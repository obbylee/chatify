import { useAuthStore } from "../store/useAuthStore";

export default function ChatPage() {
  const { logout } = useAuthStore();
  return (
    <div className="relative w-full flex items-center justify-center p-4 bg-slate-900">
      <div className="text-white text-2xl h-screen">ChatPage</div>
      <button
        type="button"
        onClick={() => {
          console.log("logged out ...");
          logout();
        }}
        className="btn btn-primary"
      >
        Logout
      </button>
    </div>
  );
}
