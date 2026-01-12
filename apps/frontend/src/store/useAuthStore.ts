import { create } from "zustand";
import { io, Socket } from "socket.io-client";
import toast from "react-hot-toast";

import { axiosInstance } from "../lib/axios";

const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:3000" : "/";

interface AuthState {
  authUser: IUser | null;
  isCheckingAuth: boolean;
  isSigningUp: boolean;
  isLoggingIn: boolean;

  socket: Socket | null;
  onlineUsers: string[];

  checkAuth: () => Promise<void>;
  signup: (data: { email: string; fullName: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<IUser>) => Promise<void>;
  connectSocket: () => void;
  disconnectSocket: () => void;
}

export interface IUser {
  _id: string;
  email: string;
  fullName: string;
  profilePic: string;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  authUser: null,
  isCheckingAuth: true,
  isSigningUp: false,
  isLoggingIn: false,

  socket: null,
  onlineUsers: [],

  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/me");
      set({ authUser: res.data });
    } catch {
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signup: async (data) => {
    try {
      set({ isSigningUp: true });
      const res = await axiosInstance.post("/auth/signup", data);
      set({ authUser: res.data });
      toast.success("Account created!");
      get().connectSocket();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Signup failed");
    } finally {
      set({ isSigningUp: false });
    }
  },

  logout: async () => {
    await axiosInstance.post("/auth/logout");
    get().disconnectSocket();
    set({ authUser: null });
  },

  updateProfile: async (data) => {
    const res = await axiosInstance.put("/auth/profile", data);
    set({ authUser: res.data });
    toast.success("Profile updated");
  },

  connectSocket: () => {
    const { authUser, socket } = get();
    if (!authUser || socket) return;

    const newSocket = io(BASE_URL, {
      query: { userId: authUser._id },
    });

    newSocket.on("getOnlineUsers", (users: string[]) => {
      set({ onlineUsers: users });
    });

    set({ socket: newSocket });
  },

  disconnectSocket: () => {
    const socket = get().socket;
    if (socket) {
      socket.disconnect();
      set({ socket: null, onlineUsers: [] });
    }
  },
}));
