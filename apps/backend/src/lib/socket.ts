import { Server } from "socket.io";
import http from "http";
import express from "express";
import { ENV } from "./env.js";
// import { socketAuthMiddleware } from "./middleware/socket.auth.middleware.js";

declare module "socket.io" {
  interface Socket {
    userId: string;
    user: {
      fullName: string;
    };
  }
}

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: [ENV.CLIENT_URL ?? "http://localhost:3000"],
    credentials: true,
  },
});

// store online users
const userSocketMap: Record<string, string> = {}; // { userId: socketId }

// apply authentication middleware
// io.use(socketAuthMiddleware);

/**
 * Get socket ID of a specific user
 */
export function getReceiverSocketId(userId: string): string | undefined {
  return userSocketMap[userId];
}

io.on("connection", (socket) => {
  console.log("✅ User connected:", socket.user.fullName);

  const userId = socket.userId;

  userSocketMap[userId] = socket.id;

  // send online users
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("disconnect", () => {
    console.log("❌ User disconnected:", socket.user.fullName);

    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { io, app, server };
