"use client";

import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useRef } from "react";

export type AstrobotPosition =
  | "center" | "bottom-left" | "bottom-right" | "right-side" | "inline";
export type AstrobotSize = "sm" | "md" | "lg" | "xl";
export type AstrobotMood = "happy" | "thinking";

interface AstrobotProps {
  message?: string;
  language?: "fr" | "ar";
  position?: AstrobotPosition;
  size?: AstrobotSize;
  speak?: boolean;
  showBubble?: boolean;
  mood?: AstrobotMood;
  onClick?: () => void;
}

const sizeMap: Record<AstrobotSize, number> = {
  sm: 120,
  md: 200,
  lg: 280,
  xl: 380,
};

const positionClasses: Record<AstrobotPosition, string> = {
  "center": "mx-auto",
  "bottom-left": "fixed bottom-6 left-6 z-50",
  "bottom-right": "fixed bottom-6 right-6 z-50",
  "right-side": "ml-auto",
  "inline": "",
};

export default function Astrobot({
  message,
  language = "fr",
  position = "inline",
  size = "md",
  speak = false,
  showBubble = true,
  mood = "happy",
  onClick,
}: AstrobotProps) {
  const [bubbleVisible, setBubbleVisible] = useState(false);
  const hasSpokenRef = useRef(false);
  const px = sizeMap[size];

  useEffect(() => {
    if (message && showBubble) setBubbleVisible(true);
  }, [message, showBubble]);

  useEffect(() => {
    if (!speak || !message) return;
    if (hasSpokenRef.current) return;
    if (typeof window === "undefined" || !window.speechSynthesis) return;

    hasSpokenRef.current = true;
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(message);
    utterance.lang = language === "ar" ? "ar-SA" : "fr-FR";
    utterance.rate = 0.95;
    utterance.pitch = 1.15;

    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(
      (v) => v.lang.startsWith(language === "ar" ? "ar" : "fr")
    );
    if (preferredVoice) utterance.voice = preferredVoice;

    window.speechSynthesis.speak(utterance);
    return () => window.speechSynthesis.cancel();
  }, [message, speak, language]);

  useEffect(() => {
    hasSpokenRef.current = false;
  }, [message]);

  return (
    <div className={`flex flex-col items-center ${positionClasses[position]}`}>
      <AnimatePresence>
        {message && showBubble && bubbleVisible && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="relative max-w-xs mb-3"
            dir={language === "ar" ? "rtl" : "ltr"}
          >
            <div
              className="bg-white rounded-3xl px-5 py-3 shadow-lg border-2 border-purple-200"
              style={{
                fontFamily: "'Fredoka', 'Baloo 2', sans-serif",
                fontSize: size === "xl" ? "18px" : "15px",
                color: "#2D3047",
                fontWeight: 500,
                lineHeight: 1.4,
              }}
            >
              {message}
            </div>
            <div className="absolute bottom-[-8px] left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-r-2 border-b-2 border-purple-200 rotate-45" />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        onClick={onClick}
        className={onClick ? "cursor-pointer" : ""}
        whileHover={onClick ? { scale: 1.05 } : undefined}
        whileTap={onClick ? { scale: 0.95 } : undefined}
        animate={mood === "thinking" ? { scale: [1, 1.04, 1] } : { scale: 1 }}
        transition={mood === "thinking" ? { duration: 1.6, repeat: Infinity, ease: "easeInOut" } : undefined}
        style={{
          width: px,
          height: px,
          filter: mood === "thinking" ? "saturate(0.4) brightness(0.9)" : undefined,
        }}
      >
        <DotLottieReact
          src="https://lottie.host/cd06b6df-676e-4463-9ccc-8a5e3aa0ac05/lvxA9Iqc43.lottie"
          loop
          autoplay
          style={{ width: "100%", height: "100%" }}
        />
      </motion.div>
    </div>
  );
}