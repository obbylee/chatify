import { useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import UsersLoadingSkeleton from "./UsersLoadingSkeleton";

export default function ContactList() {
  const getAllContacts = useChatStore((s) => s.getAllContacts);
  const allContacts = useChatStore((s) => s.allContacts);
  const isUsersLoading = useChatStore((s) => s.isUsersLoading);
  const setSelectedUser = useChatStore((s) => s.setSelectedUser);
  const selectedUser = useChatStore((s) => s.selectedUser);

  const onlineUsers = useAuthStore((s) => s.onlineUsers);

  useEffect(() => {
    if (allContacts.length === 0) {
      getAllContacts();
    }
  }, [getAllContacts, allContacts.length]);

  if (isUsersLoading) return <UsersLoadingSkeleton />;

  return (
    <>
      {allContacts.map((contact) => (
        <div
          key={contact._id}
          role="button"
          tabIndex={0}
          onClick={() => setSelectedUser(contact)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              setSelectedUser(contact);
            }
          }}
          className={`p-4 rounded-lg cursor-pointer transition-colors
            ${
              selectedUser?._id === contact._id
                ? "bg-cyan-500/30"
                : "bg-cyan-500/10 hover:bg-cyan-500/20"
            }
          `}
        >
          <div className="flex items-center gap-3">
            <div className={`avatar ${onlineUsers.includes(contact._id) ? "online" : "offline"}`}>
              <div className="size-12 rounded-full">
                <img src={contact.profilePic || "/avatar.png"} alt={contact.fullName} />
              </div>
            </div>
            <h4 className="text-slate-200 font-medium truncate">{contact.fullName}</h4>
          </div>
        </div>
      ))}
    </>
  );
}
