"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { KeyRound, CheckCircle2, Eye, EyeOff, X } from "lucide-react";

export default function ApiKeyButton() {
  const [open, setOpen] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [saved, setSaved] = useState(false);
  const [hasSavedKey, setHasSavedKey] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("astro_api_key");
    if (stored) {
      setApiKey(stored);
      setHasSavedKey(true);
    }
  }, []);

  const handleSave = () => {
    if (!apiKey.trim()) return;
    localStorage.setItem("astro_api_key", apiKey.trim());
    setHasSavedKey(true);
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      setOpen(false);
    }, 1400);
  };

  const handleClear = () => {
    localStorage.removeItem("astro_api_key");
    setApiKey("");
    setHasSavedKey(false);
  };

  return (
    <>
      {/* Floating Astrobot trigger */}
      <motion.div
        className="fixed bottom-6 right-6 z-50 cursor-pointer"
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.94 }}
        onClick={() => setOpen(true)}
        title="Configure API Key"
      >
        {/* Key badge */}
        <div
          className="absolute -top-1 -left-1 z-10 rounded-full flex items-center justify-center shadow-md"
          style={{
            width: 24,
            height: 24,
            background: hasSavedKey
              ? "linear-gradient(135deg,#4ade80,#22c55e)"
              : "linear-gradient(135deg,#f59e0b,#ef4444)",
          }}
        >
          <KeyRound size={12} color="white" strokeWidth={2.5} />
        </div>

        <div style={{ width: 90, height: 90 }}>
          <DotLottieReact
            src="https://lottie.host/cd06b6df-676e-4463-9ccc-8a5e3aa0ac05/lvxA9Iqc43.lottie"
            loop
            autoplay
            style={{ width: "100%", height: "100%" }}
          />
        </div>
      </motion.div>

      {/* Modal overlay */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 z-50"
              style={{ background: "rgba(10,8,30,0.65)", backdropFilter: "blur(6px)" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />

            {/* Modal card */}
            <motion.div
              className="fixed z-50 left-1/2 top-1/2"
              style={{ translateX: "-50%", translateY: "-50%" }}
              initial={{ opacity: 0, scale: 0.85, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.85, y: 24 }}
              transition={{ type: "spring", stiffness: 340, damping: 26 }}
            >
              <div
                className="relative w-80 rounded-3xl overflow-hidden shadow-2xl"
                style={{
                  background: "linear-gradient(160deg,#1A1B3A 0%,#2D1B69 100%)",
                  border: "1.5px solid rgba(167,139,250,0.3)",
                }}
              >
                {/* Close button */}
                <button
                  onClick={() => setOpen(false)}
                  className="absolute top-3 right-3 text-white/40 hover:text-white/80 transition-colors"
                >
                  <X size={18} />
                </button>

                {/* Astrobot + speech bubble */}
                <div className="flex flex-col items-center pt-6 pb-2 px-6">
                  {/* Speech bubble */}
                  <div
                    className="relative mb-2 bg-white rounded-2xl px-4 py-2 shadow-md text-center"
                    style={{
                      fontFamily: "'Fredoka','Baloo 2',sans-serif",
                      fontSize: 14,
                      color: "#2D3047",
                      fontWeight: 600,
                      maxWidth: 220,
                    }}
                  >
                    {hasSavedKey
                      ? "Clé API enregistrée ! 🔑"
                      : "Entre ta clé API pour commencer 🚀"}
                    <div
                      className="absolute bottom-[-8px] left-1/2 -translate-x-1/2 w-4 h-4 bg-white rotate-45"
                      style={{ borderRight: "1.5px solid #e2e8f0", borderBottom: "1.5px solid #e2e8f0" }}
                    />
                  </div>

                  {/* Astronaut */}
                  <div style={{ width: 110, height: 110 }}>
                    <DotLottieReact
                      src="https://lottie.host/cd06b6df-676e-4463-9ccc-8a5e3aa0ac05/lvxA9Iqc43.lottie"
                      loop
                      autoplay
                      style={{ width: "100%", height: "100%" }}
                    />
                  </div>
                </div>

                {/* Form area */}
                <div className="px-6 pb-6">
                  <label
                    className="block text-xs font-semibold mb-1.5 tracking-wide"
                    style={{ color: "rgba(216,180,254,0.9)", fontFamily: "'Fredoka',sans-serif" }}
                  >
                    Clé API OpenRouter
                  </label>

                  <div className="relative">
                    <input
                      type={showKey ? "text" : "password"}
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSave()}
                      placeholder="sk-or-..."
                      className="w-full px-4 py-3 pr-10 rounded-xl text-sm outline-none"
                      style={{
                        background: "rgba(255,255,255,0.08)",
                        border: "1.5px solid rgba(167,139,250,0.4)",
                        color: "#fff",
                        fontFamily: "monospace",
                      }}
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setShowKey((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-purple-300/60 hover:text-purple-200 transition-colors"
                    >
                      {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>

                  <div className="flex gap-2 mt-3">
                    <motion.button
                      whileTap={{ scale: 0.96 }}
                      onClick={handleSave}
                      disabled={!apiKey.trim() || saved}
                      className="flex-1 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                      style={{
                        background: saved
                          ? "linear-gradient(135deg,#4ade80,#22c55e)"
                          : "linear-gradient(135deg,#a855f7,#6366f1)",
                        color: "#fff",
                        fontFamily: "'Fredoka',sans-serif",
                        fontSize: 15,
                      }}
                    >
                      {saved ? (
                        <>
                          <CheckCircle2 size={16} /> Enregistré !
                        </>
                      ) : (
                        <>
                          <KeyRound size={15} /> Enregistrer
                        </>
                      )}
                    </motion.button>

                    {hasSavedKey && (
                      <button
                        onClick={handleClear}
                        className="px-3 py-2.5 rounded-xl text-xs text-red-300/70 hover:text-red-300 transition-colors"
                        style={{ border: "1px solid rgba(252,165,165,0.2)" }}
                      >
                        Effacer
                      </button>
                    )}
                  </div>

                  <p
                    className="mt-3 text-center text-xs"
                    style={{ color: "rgba(167,139,250,0.5)", fontFamily: "'Baloo 2',sans-serif" }}
                  >
                    Stockée localement · jamais envoyée ailleurs
                  </p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
