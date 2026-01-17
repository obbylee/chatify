import { create } from "zustand";
import { io, Socket } from "socket.io-client";
import toast from "react-hot-toast";
import axios from "axios";

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
  login: (data: { email: string; password: string }) => Promise<void>;
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
  profilePic?: string;
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
      const res = await axiosInstance.get("/auth/check");
      set({ authUser: res.data });
      get().connectSocket();
    } catch {
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", data);
      set({ authUser: res.data });

      toast.success("Logged in successfully");

      get().connectSocket();
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message ?? "Login failed");
      } else {
        toast.error("Something went wrong");
      }
    } finally {
      set({ isLoggingIn: false });
    }
  },

  signup: async (data) => {
    try {
      set({ isSigningUp: true });
      const res = await axiosInstance.post("/auth/register", data);
      set({ authUser: res.data });
      toast.success("Account created!");
      get().connectSocket();
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message ?? "Register failed");
      } else {
        toast.error("Something went wrong");
      }
    } finally {
      set({ isSigningUp: false });
    }
  },

  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
    } catch {
      toast.error("Logout failed");
    } finally {
      get().disconnectSocket();
      set({ authUser: null });
    }
  },

  updateProfile: async (data) => {
    try {
      const res = await axiosInstance.put("/auth/update-profile", data);
      set({ authUser: res.data });
      toast.success("Profile updated");
    } catch (error) {
      toast.error("Failed to update profile");
    }
  },

  connectSocket: () => {
    const { authUser, socket } = get();
    if (!authUser) return;

    if (socket) {
      socket.disconnect();
    }

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
