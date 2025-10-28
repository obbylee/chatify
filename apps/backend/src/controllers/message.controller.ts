import { type Request, type Response } from "express";
import User from "../models/user";
import Message from "../models/message";
import cloudinary from "../lib/cloudinary";

export const getAllContacts = async (req: Request, res: Response) => {
  try {
    const loggedInUserId = req.user?.userId;

    if (!loggedInUserId) {
      return res.status(401).json({ message: "Unauthorized: User not found" });
    }

    const contacts = await User.find({ _id: { $ne: loggedInUserId } }).select("-password");

    res.status(200).json(contacts);
  } catch (error: unknown) {
    console.error("Error in getAllContacts:", error instanceof Error ? error.message : error);

    res.status(500).json({ message: "Internal server error" });
  }
};

export const getMessagesByUserId = async (req: Request, res: Response) => {
  try {
    const currentUser = req.user?.userId;

    if (!currentUser) {
      return res.status(401).json({ message: "Unauthorized: User not found" });
    }

    const { id: userToChatId } = req.params;

    if (!userToChatId) {
      return res.status(400).json({ message: "Bad request: chat user ID is required" });
    }

    const messages = await Message.find({
      $or: [
        { senderId: currentUser, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: currentUser },
      ],
    }).sort({ createdAt: 1 }); // sort messages by time

    res.status(200).json(messages);
  } catch (error: unknown) {
    console.error("Error in getMessagesByUserId:", error instanceof Error ? error.message : error);

    res.status(500).json({ message: "Internal server error" });
  }
};

export const sendMessage = async (req: Request, res: Response) => {
  try {
    const { text, image } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user?.userId;

    if (!senderId) {
      return res.status(401).json({ message: "Unauthorized: User not found" });
    }

    if (!text && !image) {
      return res.status(400).json({ message: "Text or image is required." });
    }

    if (senderId === receiverId) {
      return res.status(400).json({ message: "Cannot send messages to yourself." });
    }

    const receiverExists = await User.exists({ _id: receiverId });
    if (!receiverExists) {
      return res.status(404).json({ message: "Receiver not found." });
    }

    let imageUrl: string | undefined;
    if (image) {
      // upload base64 image to cloudinary
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl,
    });

    await newMessage.save();

    // const receiverSocketId = getReceiverSocketId(receiverId);
    // if (receiverSocketId) {
    //   io.to(receiverSocketId).emit("newMessage", newMessage);
    // }

    res.status(201).json(newMessage);
  } catch (error: unknown) {
    console.error("Error in send message:", error instanceof Error ? error.message : error);

    res.status(500).json({ message: "Internal server error" });
  }
};

export const getChatPartners = async (req: Request, res: Response) => {
  try {
    const loggedInUserId = req.user?.userId;

    if (!loggedInUserId) {
      return res.status(401).json({ message: "Unauthorized: User not found" });
    }

    // find all the messages where the logged-in user is either sender or receiver
    const messages = await Message.find({
      $or: [{ senderId: loggedInUserId }, { receiverId: loggedInUserId }],
    }).select("senderId receiverId");

    const chatPartnerIds = Array.from(
      new Set(
        messages.map((msg) =>
          msg.senderId.toString() === loggedInUserId.toString()
            ? msg.receiverId.toString()
            : msg.senderId.toString(),
        ),
      ),
    );

    const chatPartners = await User.find({ _id: { $in: chatPartnerIds } }).select("-password");

    res.status(200).json(chatPartners);
  } catch (error: unknown) {
    console.error("Error in getChatPartners:", error instanceof Error ? error.message : error);

    res.status(500).json({ message: "Internal server error" });
  }
};
