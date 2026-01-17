import { useState, useRef, type ChangeEvent } from "react";
import { LogOutIcon, VolumeOffIcon, Volume2Icon } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";

export default function ProfileHeader() {
  const { logout, authUser, updateProfile } = useAuthStore();
  const { isSoundEnabled, toggleSound } = useChatStore();

  const [selectedImg, setSelectedImg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const clickSoundRef = useRef<HTMLAudioElement | null>(null);

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // basic validation
    if (!file.type.startsWith("image/")) {
      return alert("Please select an image file");
    }

    if (file.size > 2 * 1024 * 1024) {
      return alert("Image size must be under 2MB");
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onloadend = async () => {
      if (typeof reader.result !== "string") return;

      setSelectedImg(reader.result);
      await updateProfile({ profilePic: reader.result });
    };
  };

  if (!authUser) {
    return null; // or a skeleton loader
  }

  return (
    <div className="p-6 border-b border-slate-700/50">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="avatar online">
            <button
              className="size-14 rounded-full overflow-hidden relative group"
              onClick={() => fileInputRef.current?.click()}
            >
              <img
                src={selectedImg || authUser.profilePic || "/avatar.png"}
                alt="User avatar"
                className="size-full object-cover"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <span className="text-white text-xs">Change</span>
              </div>
            </button>

            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>

          <div>
            <h3 className="text-slate-200 font-medium text-base max-w-[130px] truncate">
              {authUser.fullName}
            </h3>
            <p className="text-slate-400 text-xs">Online</p>
          </div>
        </div>

        <div className="flex gap-4 items-center">
          <button
            className="text-slate-400 hover:text-slate-200 transition-colors"
            onClick={logout}
            aria-label="Logout"
          >
            <LogOutIcon className="size-5" />
          </button>

          <button
            className="text-slate-400 hover:text-slate-200 transition-colors"
            aria-label="Toggle sound"
            onClick={() => {
              if (!clickSoundRef.current) {
                clickSoundRef.current = new Audio("/sounds/mouse-click.mp3");
              }

              clickSoundRef.current.currentTime = 0;
              clickSoundRef.current.play().catch(() => {});
              toggleSound();
            }}
          >
            {isSoundEnabled ? (
              <Volume2Icon className="size-5" />
            ) : (
              <VolumeOffIcon className="size-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
