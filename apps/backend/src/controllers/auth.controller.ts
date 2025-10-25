import { type Request, type Response } from "express";

export const login = async (req: Request, res: Response) => {
  res.json({ message: "login endpoint" });
};
export const register = async (req: Request, res: Response) => {
  res.json({ message: "register endpoint" });
};
export const logout = async (req: Request, res: Response) => {
  res.cookie("jwt", "", { maxAge: 0 });
  res.status(200).json({ message: "Logged out successfully" });
};
export const updateProfile = async (req: Request, res: Response) => {
  res.json({ message: "update progfile endpoint" });
};
