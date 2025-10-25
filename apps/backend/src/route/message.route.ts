import { Router } from "express";

const router = Router();

router.get("/", (req, res) => {
  res.json({ message: "message endpoint" });
});

export { router as messageRouter };
