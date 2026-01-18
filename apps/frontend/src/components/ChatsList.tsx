import { useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";

import UsersLoadingSkeleton from "./UsersLoadingSkeleton";
import NoChatsFound from "./NoChatsFound";

export default function ChatsList() {
  const getMyChatPartners = useChatStore((s) => s.getMyChatPartners);
  const chats = useChatStore((s) => s.chats);
  const isUsersLoading = useChatStore((s) => s.isUsersLoading);
  const setSelectedUser = useChatStore((s) => s.setSelectedUser);
  const selectedUser = useChatStore((s) => s.selectedUser);

  const onlineUsers = useAuthStore((s) => s.onlineUsers);

  useEffect(() => {
    if (chats.length === 0) {
      getMyChatPartners();
    }
  }, [getMyChatPartners, chats.length]);

  if (isUsersLoading) return <UsersLoadingSkeleton />;
  if (chats.length === 0) return <NoChatsFound />;

  return (
    <>
      {chats.map((chat) => (
        <div
          key={chat._id}
          role="button"
          tabIndex={0}
          onClick={() => setSelectedUser(chat)}
          onKeyDown={(e) => e.key === "Enter" && setSelectedUser(chat)}
          className={`p-4 rounded-lg cursor-pointer transition-colors
            ${
              selectedUser?._id === chat._id
                ? "bg-cyan-500/30"
                : "bg-cyan-500/10 hover:bg-cyan-500/20"
            }
          `}
        >
          <div className="flex items-center gap-3">
            <div className={`avatar ${onlineUsers.includes(chat._id) ? "online" : "offline"}`}>
              <div className="size-12 rounded-full">
                <img src={chat.profilePic || "/avatar.png"} alt={chat.fullName} />
              </div>
            </div>
            <h4 className="text-slate-200 font-medium truncate">{chat.fullName}</h4>
          </div>
        </div>
      ))}
    </>
  );
}
