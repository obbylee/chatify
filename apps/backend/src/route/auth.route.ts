import { Router } from "express";
import { login, register, updateProfile } from "../controllers/auth.controller";

const router = Router();

router.get("/", (req, res) => {
  res.json({ message: "auth endpoint" });
});

router.post("/login", login);
router.post("/register", register);
router.post("/logout", login);
router.post("/update-profile", updateProfile);
// router.get("/check", (req, res) => res.status(200).json(req.user))

export { router as authRouter };
