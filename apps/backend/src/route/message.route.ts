import { Router } from "express";
import {
  getAllContacts,
  getChatPartners,
  getMessagesByUserId,
  sendMessage,
} from "../controllers/message.controller";
import { arcjetProtection } from "../middlewares/arcjet.middleware";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

router.use(arcjetProtection, authMiddleware);

router.get("/contacts", getAllContacts);
router.get("/chats", getChatPartners);
router.get("/:id", getMessagesByUserId);
router.post("/send/:id", sendMessage);

export { router as messageRouter };
