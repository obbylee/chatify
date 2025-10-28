import { type NextFunction, type Request, type Response } from "express";
import User from "../models/user";
import { validateToken } from "../lib/token";

type UserPayload = {
  userId: string;
  email: string;
  fullName: string;
  profilePic: string;
};

declare global {
  namespace Express {
    interface Request {
      user?: UserPayload | null;
    }
  }
}

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies.jwt;
    if (!token) return res.status(401).json({ message: "Unauthorized - No token provided" });

    const decoded = validateToken(token);
    if (!decoded) return res.status(401).json({ message: "Unauthorized - Invalid token" });

    const user = await User.findById(decoded.userId).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    req.user = {
      userId: user._id.toString(),
      email: user.email,
      fullName: user.fullName,
      profilePic: user.profilePic,
    };

    next();
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.log("Error in auth middleware:", error.message);
    }
    return res.status(401).json({ message: "Unauthorized: Invalid or expired token" });
  }
};
