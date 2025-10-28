import express from "express";
import { authRouter } from "./route/auth.route";
import { messageRouter } from "./route/message.route";
import cookieParser from "cookie-parser";

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRouter);
app.use("/api/message", messageRouter);

export default app;
