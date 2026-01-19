import { useRef } from "react";

const SOUND_PATHS = [
  "/sounds/keystroke1.mp3",
  "/sounds/keystroke2.mp3",
  "/sounds/keystroke3.mp3",
  "/sounds/keystroke4.mp3",
];

export default function useKeyboardSound() {
  const soundsRef = useRef<HTMLAudioElement[] | null>(null);

  if (!soundsRef.current) {
    soundsRef.current = SOUND_PATHS.map((src) => new Audio(src));
  }

  const playRandomKeyStrokeSound = () => {
    const sounds = soundsRef.current;
    if (!sounds || sounds.length === 0) return;

    const randomSound = sounds[Math.floor(Math.random() * sounds.length)];

    randomSound.currentTime = 0;
    randomSound.play().catch(() => {
      // silently fail (autoplay restrictions, etc.)
    });
  };

  return { playRandomKeyStrokeSound };
}
