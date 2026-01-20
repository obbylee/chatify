import { useEffect, useRef } from "react";

import { useAuthStore } from "../store/useAuthStore";
import { useChatStore, type IMessage } from "../store/useChatStore";

import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import NoChatHistoryPlaceholder from "./NoChatHistoryPlaceholder";
import MessagesLoadingSkeleton from "./MessagesLoadingSkeleton";

export default function ChatContainer() {
  const {
    selectedUser,
    getMessagesByUserId,
    messages,
    isMessagesLoading,
    subscribeToMessages,
    unsubscribeFromMessages,
  } = useChatStore();
  const { authUser } = useAuthStore();
  const messageEndRef = useRef<HTMLDivElement>(null);

  // Load messages and subscribe to new ones
  useEffect(() => {
    if (!selectedUser) return;

    getMessagesByUserId(selectedUser._id);
    subscribeToMessages();

    return () => unsubscribeFromMessages();
  }, [selectedUser]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Guard against no selected user
  if (!selectedUser) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400 text-lg">
        Select a user to start chatting
      </div>
    );
  }

  return (
    <>
      <ChatHeader />
      <div className="flex-1 px-6 overflow-y-auto py-8">
        {isMessagesLoading ? (
          <MessagesLoadingSkeleton />
        ) : messages.length === 0 ? (
          <NoChatHistoryPlaceholder name={selectedUser.fullName} />
        ) : (
          <div className="max-w-3xl mx-auto space-y-6">
            {messages.map((msg: IMessage) => {
              const isSender = authUser?._id === msg.senderId;
              return (
                <div key={msg._id} className={`chat ${isSender ? "chat-end" : "chat-start"}`}>
                  <div
                    className={`chat-bubble relative ${
                      isSender ? "bg-cyan-600 text-white" : "bg-slate-800 text-slate-200"
                    } ${msg.isOptimistic ? "opacity-70 animate-pulse" : ""}`}
                  >
                    {msg.image && (
                      <img
                        src={msg.image}
                        alt={msg.text || "Shared image"}
                        className="rounded-lg h-48 object-cover"
                      />
                    )}
                    {msg.text && <p className="mt-2">{msg.text}</p>}
                    <p className="text-xs mt-1 opacity-75 flex items-center gap-1">
                      {new Date(msg.createdAt).toLocaleTimeString(undefined, {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              );
            })}
            <div ref={messageEndRef} />
          </div>
        )}
      </div>

      <MessageInput />
    </>
  );
}
