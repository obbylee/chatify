import { create } from "zustand";
import axios from "axios";
import toast from "react-hot-toast";

import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";
import type { IUser } from "./useAuthStore";

export interface IMessage {
  _id: string;
  senderId: string;
  receiverId: string;
  text?: string;
  image?: string;
  createdAt: string;
  isOptimistic?: boolean;
}

export type ActiveTab = "chats" | "contacts";

interface ChatState {
  allContacts: IUser[];
  chats: IUser[];
  messages: IMessage[];
  activeTab: ActiveTab;
  selectedUser: IUser | null;

  isUsersLoading: boolean;
  isMessagesLoading: boolean;
  isSoundEnabled: boolean;

  toggleSound: () => void;
  setActiveTab: (tab: ActiveTab) => void;
  setSelectedUser: (user: IUser | null) => void;

  getAllContacts: () => Promise<void>;
  getMyChatPartners: () => Promise<void>;
  getMessagesByUserId: (userId: string) => Promise<void>;
  sendMessage: (data: { text?: string; image?: string }) => Promise<void>;

  subscribeToMessages: () => void;
  unsubscribeFromMessages: () => void;
}

const getInitialSoundSetting = (): boolean => {
  try {
    return JSON.parse(localStorage.getItem("isSoundEnabled") || "true");
  } catch {
    return true;
  }
};

export const useChatStore = create<ChatState>((set, get) => ({
  allContacts: [],
  chats: [],
  messages: [],
  activeTab: "chats",
  selectedUser: null,

  isUsersLoading: false,
  isMessagesLoading: false,
  isSoundEnabled: getInitialSoundSetting(),

  toggleSound: () => {
    const nextValue = !get().isSoundEnabled;
    localStorage.setItem("isSoundEnabled", JSON.stringify(nextValue));
    set({ isSoundEnabled: nextValue });
  },

  setActiveTab: (tab) => set({ activeTab: tab }),

  setSelectedUser: (user) => set({ selectedUser: user, messages: [] }),

  getAllContacts: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get<IUser[]>("/message/contacts");
      set({ allContacts: res.data });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message ?? "Failed to load contacts");
      }
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMyChatPartners: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get<IUser[]>("/message/chats");
      set({ chats: res.data });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message ?? "Failed to load chats");
      }
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessagesByUserId: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get<IMessage[]>(`/message/${userId}`);
      set({ messages: res.data });
    } catch {
      toast.error("Failed to load messages");
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async (messageData) => {
    const { selectedUser } = get();
    const { authUser } = useAuthStore.getState();

    if (!selectedUser || !authUser) return;

    const tempId = `temp-${Date.now()}`;

    const optimisticMessage: IMessage = {
      _id: tempId,
      senderId: authUser._id,
      receiverId: selectedUser._id,
      text: messageData.text,
      image: messageData.image,
      createdAt: new Date().toISOString(),
      isOptimistic: true,
    };

    // optimistic update (safe)
    set((state) => ({
      messages: [...state.messages, optimisticMessage],
    }));

    try {
      const res = await axiosInstance.post<IMessage>(
        `/messages/send/${selectedUser._id}`,
        messageData,
      );

      // replace optimistic message
      set((state) => ({
        messages: state.messages.map((msg) => (msg._id === tempId ? res.data : msg)),
      }));
    } catch {
      // rollback optimistic message
      set((state) => ({
        messages: state.messages.filter((msg) => msg._id !== tempId),
      }));

      toast.error("Failed to send message");
    }
  },

  subscribeToMessages: () => {
    const { selectedUser, isSoundEnabled } = get();
    const socket = useAuthStore.getState().socket;

    if (!selectedUser || !socket) return;

    socket.off("newMessage");

    socket.on("newMessage", (newMessage: IMessage) => {
      if (newMessage.senderId !== selectedUser._id) return;

      set((state) => ({
        messages: [...state.messages, newMessage],
      }));

      if (isSoundEnabled) {
        const audio = new Audio("/sounds/notification.mp3");
        audio.play().catch(() => {});
      }
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket?.off("newMessage");
  },
}));
