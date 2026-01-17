import type { ActiveTab } from "../store/useChatStore";
import { useChatStore } from "../store/useChatStore";

export default function ActiveTabSwitch() {
  const { activeTab, setActiveTab } = useChatStore();

  const tabClass = (tab: ActiveTab) =>
    `tab ${activeTab === tab ? "bg-cyan-500/20 text-cyan-400" : "text-slate-400"}`;

  return (
    <div className="tabs tabs-boxed bg-transparent p-2 m-2" role="tablist">
      <button
        role="tab"
        aria-selected={activeTab === "chats"}
        className={tabClass("chats")}
        onClick={() => setActiveTab("chats")}
      >
        Chats
      </button>

      <button
        role="tab"
        aria-selected={activeTab === "contacts"}
        className={tabClass("contacts")}
        onClick={() => setActiveTab("contacts")}
      >
        Contacts
      </button>
    </div>
  );
}
