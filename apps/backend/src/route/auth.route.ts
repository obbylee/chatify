import { Router } from "express";
import { login, register, logout, updateProfile } from "../controllers/auth.controller";

const router = Router();

router.post("/login", login);
router.post("/register", register);
router.post("/logout", logout);
router.post("/update-profile", updateProfile);
// router.get("/check", (req, res) => res.status(200).json(req.user))

export { router as authRouter };
