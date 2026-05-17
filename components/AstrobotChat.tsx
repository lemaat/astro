"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { X, ChevronLeft, Loader2 } from "lucide-react";
import { useAstro } from "@/context/AstroContext";

interface Option {
  icon: string;
  text: string;
}

// Discovery questions to understand the child's passions
const DISCOVERY_STEPS = [
  {
    message: (name: string) => `Salut ${name} ! 🚀 Je suis AstroBot ! Dis-moi, qu'est-ce que tu aimes le plus ?`,
    options: [
      { icon: "🦁", text: "Les animaux" },
      { icon: "🚀", text: "L'espace & science" },
      { icon: "🏰", text: "Magie & contes" },
      { icon: "🦸", text: "Super-héros" },
      { icon: "🌊", text: "La mer & nature" },
      { icon: "🎨", text: "Art & couleurs" },
    ],
  },
  {
    message: () => `Super choix ! 🌟 Et qu'est-ce que tu préfères faire ?`,
    options: [
      { icon: "🎨", text: "Dessiner & créer" },
      { icon: "🧩", text: "Résoudre des puzzles" },
      { icon: "📖", text: "Inventer des histoires" },
      { icon: "🎵", text: "Chanter & bouger" },
    ],
  },
];

const MAIN_OPTIONS: Option[] = [
  { icon: "🌍", text: "Comment fonctionne KidsSpark ?" },
  { icon: "🎮", text: "Quels jeux puis-je faire ?" },
  { icon: "🏆", text: "Montre mes scores" },
  { icon: "🚀", text: "Emmène-moi dans un monde" },
  { icon: "❓", text: "J'ai besoin d'aide" },
];

export default function AstrobotChat() {
  const { profile, setPassions } = useAstro();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [options, setOptions] = useState<Option[]>([]);
  const [loading, setLoading] = useState(false);
  const [discoveryStep, setDiscoveryStep] = useState(0);
  const [discoveredPassions, setDiscoveredPassions] = useState<string[]>([]);
  const [discoveryDone, setDiscoveryDone] = useState(false);
  const [historyStack, setHistoryStack] = useState<{ message: string; options: Option[] }[]>([]);

  const startDiscovery = () => {
    // If passions already known, go straight to main menu
    if (profile.passions.length > 0) {
      setDiscoveryDone(true);
      setMessage(`Bienvenue ${profile.name} ! 🚀 Que veux-tu faire aujourd'hui ?`);
      setOptions(MAIN_OPTIONS);
      return;
    }
    setDiscoveryStep(0);
    setDiscoveredPassions([]);
    setDiscoveryDone(false);
    const step = DISCOVERY_STEPS[0];
    setMessage(step.message(profile.name));
    setOptions(step.options);
  };

  const handleOpen = () => {
    setOpen(true);
    setHistoryStack([]);
    startDiscovery();
  };

  const handleDiscoveryChoice = (option: Option) => {
    const newPassions = [...discoveredPassions, option.text];
    setDiscoveredPassions(newPassions);

    if (discoveryStep < DISCOVERY_STEPS.length - 1) {
      const next = DISCOVERY_STEPS[discoveryStep + 1];
      setDiscoveryStep(discoveryStep + 1);
      setMessage(next.message(profile.name));
      setOptions(next.options);
    } else {
      // Discovery complete — save passions and show main menu
      setPassions(newPassions);
      setDiscoveryDone(true);
      setMessage(`Parfait ! 🎉 J'ai tout noté ! Je vais rendre tes activités autour de "${newPassions[0]}" extra-amusantes !`);
      setOptions(MAIN_OPTIONS);
    }
  };

  const handleMainOption = async (option: Option) => {
    if (option.text === "Menu principal") {
      setMessage(`Que veux-tu faire, ${profile.name} ? 🚀`);
      setOptions(MAIN_OPTIONS);
      setHistoryStack([]);
      return;
    }

    setHistoryStack(prev => [...prev, { message, options }]);
    setLoading(true);

    const storedKey = typeof window !== "undefined" ? localStorage.getItem("astro_api_key") || "" : "";

    try {
      const passionsContext = profile.passions.length > 0
        ? `Les passions de l'enfant: ${profile.passions.join(", ")}.`
        : "";

      const res = await fetch("/api/astrobot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(storedKey ? { "x-api-key": storedKey } : {}),
        },
        body: JSON.stringify({
          selected: option.text,
          childName: profile.name,
          passionsContext,
        }),
      });

      const data = await res.json();
      setMessage(data.message);
      setOptions(data.options || []);
    } catch {
      setMessage("Oups ! Réessaie 🚀");
      setOptions([{ icon: "🏠", text: "Menu principal" }]);
    } finally {
      setLoading(false);
    }
  };

  const handleOption = (option: Option) => {
    if (!discoveryDone) {
      handleDiscoveryChoice(option);
    } else {
      handleMainOption(option);
    }
  };

  const handleBack = () => {
    const prev = historyStack[historyStack.length - 1];
    if (!prev) return;
    setMessage(prev.message);
    setOptions(prev.options);
    setHistoryStack(s => s.slice(0, -1));
  };

  const canGoBack = discoveryDone && historyStack.length > 0;

  return (
    <>
      <AnimatePresence>
        {!open && (
          <motion.div
            className="fixed bottom-6 right-6 z-50 cursor-pointer"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.92 }}
            onClick={handleOpen}
          >
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{ background: "rgba(34,211,238,0.3)", borderRadius: "50%" }}
              animate={{ scale: [1, 1.35, 1], opacity: [0.6, 0, 0.6] }}
              transition={{ duration: 2.2, repeat: Infinity }}
            />
            <div style={{ width: 72, height: 72 }}>
              <DotLottieReact
                src="https://lottie.host/cd06b6df-676e-4463-9ccc-8a5e3aa0ac05/lvxA9Iqc43.lottie"
                loop autoplay style={{ width: "100%", height: "100%" }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed bottom-6 right-6 z-50"
            style={{ width: 400 }}
            initial={{ opacity: 0, y: 60, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 60, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
          >
            <div style={{
              background: "rgba(15, 12, 41, 0.85)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(34,211,238,0.2)",
              borderRadius: 24,
              overflow: "hidden",
              boxShadow: "0 0 40px rgba(34,211,238,0.1), 0 20px 60px rgba(0,0,0,0.5)",
              height: 560,
              display: "flex",
              flexDirection: "column",
            }}>
              {/* Header */}
              <div className="flex items-center justify-between px-4 pt-4 pb-2"
                style={{ borderBottom: "1px solid rgba(34,211,238,0.1)" }}>
                {canGoBack ? (
                  <button onClick={handleBack}
                    className="flex items-center gap-1 text-xs transition-colors"
                    style={{ color: "rgba(148,163,184,0.7)", fontFamily: "Nunito, sans-serif" }}>
                    <ChevronLeft size={14} /> Retour
                  </button>
                ) : <div style={{ width: 48 }} />}

                <motion.div className="rounded-full overflow-hidden" style={{
                  width: 52, height: 52,
                  border: "2px solid rgba(34,211,238,0.8)",
                  boxShadow: "0 0 16px rgba(34,211,238,0.5)",
                }}
                  animate={{ boxShadow: ["0 0 12px rgba(34,211,238,0.4)", "0 0 24px rgba(34,211,238,0.8)", "0 0 12px rgba(34,211,238,0.4)"] }}
                  transition={{ duration: 2, repeat: Infinity }}>
                  <DotLottieReact
                    src="https://lottie.host/cd06b6df-676e-4463-9ccc-8a5e3aa0ac05/lvxA9Iqc43.lottie"
                    loop autoplay style={{ width: "100%", height: "100%" }}
                  />
                </motion.div>

                <button onClick={() => setOpen(false)}
                  style={{ color: "rgba(148,163,184,0.6)" }}
                  className="hover:text-white transition-colors">
                  <X size={18} />
                </button>
              </div>

              {/* Passions badges (shown after discovery) */}
              {profile.passions.length > 0 && (
                <div className="flex gap-1 px-4 pt-2 flex-wrap">
                  {profile.passions.map((p, i) => (
                    <span key={i} style={{
                      background: "rgba(34,211,238,0.15)",
                      border: "1px solid rgba(34,211,238,0.3)",
                      borderRadius: 99, padding: "2px 10px",
                      fontSize: "0.72rem", color: "rgba(34,211,238,0.9)",
                      fontFamily: "Nunito, sans-serif",
                    }}>{p}</span>
                  ))}
                </div>
              )}

              {/* Message bubble */}
              <div className="px-4 pt-4 pb-2">
                <AnimatePresence mode="wait">
                  <motion.div key={message}
                    initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    style={{
                      background: "rgba(255,255,255,0.05)",
                      borderLeft: "3px solid rgba(34,211,238,0.7)",
                      borderRadius: "0 12px 12px 12px",
                      padding: "10px 14px", fontSize: "0.9rem",
                      color: "rgba(226,232,240,0.95)",
                      fontFamily: "Nunito, sans-serif", lineHeight: 1.5,
                    }}>
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <Loader2 size={14} className="animate-spin" style={{ color: "rgb(34,211,238)" }} />
                        <span style={{ color: "rgba(148,163,184,0.7)", fontSize: "0.85rem" }}>AstroBot réfléchit...</span>
                      </div>
                    ) : message}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Options */}
              <div className="flex-1 overflow-y-auto px-4 pb-4 flex flex-col gap-2 mt-2">
                <AnimatePresence>
                  {!loading && options.map((opt, i) => (
                    <motion.button key={opt.text}
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      transition={{ delay: i * 0.06 }}
                      whileHover={{ scale: 1.02, boxShadow: "0 0 16px rgba(34,211,238,0.3)" }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => handleOption(opt)}
                      className="w-full flex items-center gap-3 text-left transition-all"
                      style={{
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        borderRadius: 14, padding: "10px 14px",
                        color: "rgba(226,232,240,0.9)",
                        fontFamily: "Nunito, sans-serif",
                        fontSize: "0.88rem", fontWeight: 600, cursor: "pointer",
                      }}>
                      <span style={{ fontSize: "1.2rem", lineHeight: 1 }}>{opt.icon}</span>
                      <span>{opt.text}</span>
                    </motion.button>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@500;600;700&display=swap');`}</style>
    </>
  );
}
