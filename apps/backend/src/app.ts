import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

import { authRouter } from "./route/auth.route";
import { messageRouter } from "./route/message.route";
import { ENV } from "./lib/env";

const app = express();

app.use(cors({ origin: ENV.CLIENT_URL, credentials: true }));
app.use(express.json({ limit: "5mb" }));
app.use(cookieParser());

app.use("/api/auth", authRouter);
app.use("/api/message", messageRouter);

export default app;
