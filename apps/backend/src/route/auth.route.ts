import { Router } from "express";
import { login, register, logout, updateProfile } from "../controllers/auth.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

router.post("/login", login);
router.post("/register", register);
router.post("/logout", logout);
router.put("/update-profile", authMiddleware, updateProfile);
router.get("/check", authMiddleware, (req, res) => res.status(200).json(req.user));

export { router as authRouter };
