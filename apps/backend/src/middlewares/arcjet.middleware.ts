import { type NextFunction, type Request, type Response } from "express";
import { isSpoofedBot } from "@arcjet/inspect";
import aj from "../lib/arcjet";

export const arcjetProtection = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const decision = await aj.protect(req);

    if (decision.isDenied()) {
      if (decision.reason.isRateLimit()) {
        return res.status(429).json({ message: "Rate limit exceeded. Please try again later." });
      }

      if (decision.reason.isBot() || decision.reason.type === "BOT") {
        return res.status(403).json({ message: "Bot access denied." });
      }

      return res.status(403).json({ message: "Access denied by security policy." });
    }

    if (decision.results.some(isSpoofedBot)) {
      return res.status(403).json({
        message: "Spoofed bot detected. Malicious bot activity detected.",
      });
    }

    next();
  } catch (error: unknown) {
    console.error("Arcjet Protection Error:", error instanceof Error ? error.message : error);
    next();
  }
};
