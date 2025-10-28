import jwt from "jsonwebtoken";
import { ENV } from "./env";
import { Error } from "mongoose";

const { JWT_SECRET } = ENV;

export const generateToken = (userId: string): string => {
  if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured");
  }

  const token = jwt.sign({ userId }, JWT_SECRET, {
    expiresIn: "7d",
  });

  return token;
};

export const validateToken = (token: string): { userId: string } | null => {
  if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured");
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET as string);

    if (typeof decoded !== "object" || decoded === null || !("userId" in decoded)) {
      return null;
    }

    return decoded as { userId: string };
  } catch (error) {
    if (error instanceof Error) {
      console.log("JWT validation failed:", error.message);
    }
    return null;
  }
};
