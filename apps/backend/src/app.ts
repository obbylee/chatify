import express from "express";
import { authRouter } from "./route/auth.route";
import { messageRouter } from "./route/message.route";

const app = express();

app.use("/api/auth", authRouter);
app.use("/api/message", messageRouter);

export default app;
