import { type Request, type Response } from "express";
import User from "../models/user";
import bcrypt from "bcryptjs";
import { ENV } from "../lib/env";
import { generateToken } from "../lib/token";

interface RegisterBody {
  fullName: string;
  email: string;
  password: string;
}

interface LoginBody {
  email: string;
  password: string;
}

export const login = async (req: Request<{}, {}, LoginBody>, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    const user = await User.findOne({ email });

    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) return res.status(400).json({ message: "Invalid credentials" });

    const token = generateToken(user._id.toString());

    res.cookie("jwt", token, {
      maxAge: 7 * 24 * 60 * 60 * 1000, // MS
      httpOnly: true, // prevent XSS attacks: cross-site scripting
      sameSite: "strict", // CSRF attacks
      secure: ENV.NODE_ENV === "development" ? false : true,
    });

    res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePic: user.profilePic,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.log("Error in login controller:", error.message);
    }
    res.status(500).json({ message: "Internal server error" });
  }
};

export const register = async (req: Request<{}, {}, RegisterBody>, res: Response) => {
  const { fullName, email, password } = req.body;

  try {
    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    // check if emailis valid: regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    const user = await User.findOne({ email });

    if (user) return res.status(400).json({ message: "Email already exists" });

    const salt = await bcrypt.genSalt(10);

    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
    });

    if (!newUser) {
      res.status(400).json({ message: "Invalid user data" });
    }

    const savedUser = await newUser.save();

    const token = generateToken(savedUser._id.toString());

    res.cookie("jwt", token, {
      maxAge: 7 * 24 * 60 * 60 * 1000, // MS
      httpOnly: true, // prevent XSS attacks: cross-site scripting
      sameSite: "strict", // CSRF attacks
      secure: ENV.NODE_ENV === "development" ? false : true,
    });

    res.status(201).json({
      _id: newUser._id,
      fullName: newUser.fullName,
      email: newUser.email,
      profilePic: newUser.profilePic,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.log("Error in register controller:", error.message);
    }

    res.status(500).json({ message: "Internal server error" });
  }
};

export const logout = async (req: Request, res: Response) => {
  res.cookie("jwt", "", {
    httpOnly: true,
    sameSite: "strict",
    secure: ENV.NODE_ENV !== "development",
    expires: new Date(0),
  });

  res.status(200).json({ message: "Logged out successfully" });
};

export const updateProfile = async (req: Request, res: Response) => {
  res.json({ message: "update progfile endpoint" });
};
