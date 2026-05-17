"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useAstro } from "@/context/AstroContext";
import Astrobot from "@/components/Astrobot";
import { Sparkles } from "lucide-react";

// ============================================================
// FLOATING THEMED OBJECT — drifts in space
// ============================================================
const FloatingObject = ({
  children,
  x,
  y,
  size = 50,
  delay = 0,
  duration = 6,
}: {
  children: React.ReactNode;
  x: string;
  y: string;
  size?: number;
  delay?: number;
  duration?: number;
}) => (
  <motion.div
    className="absolute pointer-events-none z-20"
    style={{
      left: x,
      top: y,
      fontSize: `${size}px`,
      filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.3))",
      pointerEvents: "none",
    }}
    animate={{
      y: [0, -20, 0],
      rotate: [-8, 8, -8],
    }}
    transition={{ duration, repeat: Infinity, ease: "easeInOut", delay }}
  >
    {children}
  </motion.div>
);

// ============================================================
// CUTE ALIEN
// ============================================================
const Alien = ({
  x,
  y,
  delay = 0,
  color = "#6BCB77",
}: {
  x: string;
  y: string;
  delay?: number;
  color?: string;
}) => (
  <motion.div
    className="absolute pointer-events-none z-20"
    style={{ left: x, top: y, pointerEvents: "none" }}
    animate={{
      y: [0, -25, 0],
      x: [0, 15, 0],
    }}
    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay }}
  >
    <svg width="55" height="65" viewBox="0 0 100 120">
      <line x1="50" y1="20" x2="50" y2="35" stroke="#2D3047" strokeWidth="3" />
      <circle cx="50" cy="15" r="6" fill={color}>
        <animate attributeName="opacity" values="1;0.4;1" dur="1.5s" repeatCount="indefinite" />
      </circle>
      <ellipse cx="50" cy="55" rx="32" ry="28" fill={color} stroke="#2D3047" strokeWidth="3" />
      <ellipse cx="50" cy="55" rx="18" ry="20" fill="white" stroke="#2D3047" strokeWidth="3" />
      <circle cx="50" cy="58" r="9" fill="#2D3047" />
      <circle cx="53" cy="55" r="3" fill="white" />
      <path d="M 38 78 Q 50 86 62 78" stroke="#2D3047" strokeWidth="3" fill="none" strokeLinecap="round" />
      <ellipse cx="50" cy="100" rx="20" ry="12" fill={color} stroke="#2D3047" strokeWidth="3" />
    </svg>
  </motion.div>
);

// ============================================================
// PORTAL DOOR — floats in space, fully clickable
// ============================================================
interface DoorProps {
  label: string;
  emoji: string;
  glowColor: string;
  doorColor: string;
  position: { top?: string; bottom?: string; left?: string; right?: string };
  completed: boolean;
  onClick: () => void;
  delay: number;
}

const PortalDoor: React.FC<DoorProps> = ({
  label,
  emoji,
  glowColor,
  doorColor,
  position,
  completed,
  onClick,
  delay,
}) => {
  return (
    <motion.div
      className="absolute z-30"
      style={position}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, type: "spring", stiffness: 100 }}
    >
      {/* Light rays bursting from door — pulsing, click-through */}
      <motion.div
        className="absolute"
        style={{
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: -1,
          pointerEvents: "none",
        }}
        animate={{ opacity: [0.3, 0.8, 0.3] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
      >
        <svg
          width="320"
          height="320"
          viewBox="0 0 320 320"
          style={{ overflow: "visible", pointerEvents: "none" }}
        >
          {[...Array(12)].map((_, i) => (
            <motion.line
              key={i}
              x1="160"
              y1="160"
              x2="160"
              y2="30"
              stroke={glowColor}
              strokeWidth="4"
              strokeLinecap="round"
              style={{ transformOrigin: "160px 160px", pointerEvents: "none" }}
              transform={`rotate(${i * 30})`}
              animate={{
                strokeWidth: [2, 5, 2],
                opacity: [0.4, 0.9, 0.4],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.1,
              }}
            />
          ))}
        </svg>
      </motion.div>

      {/* Outer glow ring — click-through */}
      <motion.div
        className="absolute rounded-full"
        style={{
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          width: "150px",
          height: "150px",
          background: `radial-gradient(circle, ${glowColor}66 0%, transparent 70%)`,
          filter: "blur(15px)",
          zIndex: -1,
          pointerEvents: "none",
        }}
        animate={{ scale: [1, 1.3, 1] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* The door itself — this is the clickable area */}
      <motion.div
        className="relative cursor-pointer"
        onClick={onClick}
        whileHover={{ scale: 1.12 }}
        whileTap={{ scale: 0.92 }}
        animate={{
          boxShadow: [
            `0 0 30px ${glowColor}, 0 0 60px ${glowColor}44`,
            `0 0 50px ${glowColor}, 0 0 100px ${glowColor}66`,
            `0 0 30px ${glowColor}, 0 0 60px ${glowColor}44`,
          ],
        }}
        transition={{
          boxShadow: { duration: 2, repeat: Infinity },
        }}
        style={{
          width: "100px",
          height: "130px",
          borderRadius: "50px 50px 12px 12px",
          background: `linear-gradient(180deg, ${doorColor} 0%, ${doorColor}EE 50%, ${doorColor}BB 100%)`,
          border: "4px solid white",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Glowing portal window */}
        <motion.div
          className="absolute top-4 left-1/2 -translate-x-1/2 rounded-full pointer-events-none"
          style={{
            width: "40px",
            height: "40px",
            background: `radial-gradient(circle, white 0%, ${glowColor} 60%, transparent 100%)`,
            pointerEvents: "none",
          }}
          animate={{ scale: [1, 1.1, 1], opacity: [0.8, 1, 0.8] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />

        {/* Door handle */}
        <div
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full pointer-events-none"
          style={{
            width: "8px",
            height: "8px",
            background: "#FFD93D",
            boxShadow: "0 0 8px #FFD93D",
            pointerEvents: "none",
          }}
        />

        {/* Emoji — large, centered */}
        <div
          className="pointer-events-none"
          style={{
            fontSize: "42px",
            marginTop: "30px",
            filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.4))",
            pointerEvents: "none",
          }}
        >
          {emoji}
        </div>

        {/* Completion checkmark */}
        {completed && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-3 -right-3 bg-green-500 rounded-full shadow-lg border-2 border-white z-20 flex items-center justify-center font-bold text-white pointer-events-none"
            style={{ width: "32px", height: "32px", pointerEvents: "none" }}
          >
            ✓
          </motion.div>
        )}
      </motion.div>

      {/* Label — always upright */}
      <div
        className="absolute left-1/2 -translate-x-1/2 mt-4 whitespace-nowrap pointer-events-none"
        style={{ top: "100%", pointerEvents: "none" }}
      >
        <div
          className="px-4 py-1.5 rounded-full text-white font-extrabold text-base"
          style={{
            fontFamily: "'Fredoka', 'Cairo', sans-serif",
            background: `${doorColor}DD`,
            border: `2px solid white`,
            boxShadow: `0 4px 15px ${glowColor}88`,
          }}
        >
          {label}
        </div>
      </div>
    </motion.div>
  );
};

// ============================================================
// MAIN PAGE
// ============================================================
export default function PlanetHub() {
  const router = useRouter();
  const { profile, scores, setLanguage } = useAstro();
  const allCompleted = scores.every((s) => s.completed);

  const t = {
    fr: {
      welcome: `Bienvenue sur ma planète, ${profile.name} ! Choisis une porte pour commencer l'aventure !`,
      drawing: "Dessin",
      logic: "Énigmes",
      story: "Histoires",
      finish: "Découvre ton étincelle ! ✨",
    },
    ar: {
      welcome: `مرحباً بك في كوكبي يا ${profile.name}! اختر باباً لبدء المغامرة!`,
      drawing: "الرسم",
      logic: "الألغاز",
      story: "القصص",
      finish: "اكتشف شرارتك! ✨",
    },
  };

  const currentT = t[profile.language];

  return (
    <main
      className="relative min-h-screen w-full overflow-hidden flex flex-col items-center justify-center"
      style={{
        background: "radial-gradient(ellipse at top, #2D1B69 0%, #1A1B3A 50%, #0F0F1E 100%)",
      }}
    >
      {/* === Twinkling stars === */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {[...Array(120)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute bg-white rounded-full"
            style={{
              width: Math.random() * 3 + 1 + "px",
              height: Math.random() * 3 + 1 + "px",
              top: Math.random() * 100 + "%",
              left: Math.random() * 100 + "%",
            }}
            animate={{ opacity: [0.2, 1, 0.2] }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              delay: Math.random() * 3,
            }}
          />
        ))}
      </div>

      {/* === Nebula clouds === */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div
          className="absolute"
          style={{
            top: "5%",
            left: "10%",
            width: "350px",
            height: "350px",
            background: "radial-gradient(circle, rgba(255,107,107,0.18) 0%, transparent 70%)",
            filter: "blur(60px)",
          }}
        />
        <div
          className="absolute"
          style={{
            bottom: "10%",
            right: "5%",
            width: "450px",
            height: "450px",
            background: "radial-gradient(circle, rgba(77,150,255,0.18) 0%, transparent 70%)",
            filter: "blur(60px)",
          }}
        />
        <div
          className="absolute"
          style={{
            top: "40%",
            right: "30%",
            width: "300px",
            height: "300px",
            background: "radial-gradient(circle, rgba(155,93,229,0.15) 0%, transparent 70%)",
            filter: "blur(70px)",
          }}
        />
      </div>

      {/* === Top bar === */}
      <div className="absolute top-0 w-full p-6 flex justify-between items-center z-50">
        <div className="flex gap-2">
          <button
            onClick={() => setLanguage("fr")}
            className={`text-2xl p-2 rounded-xl transition-all ${
              profile.language === "fr"
                ? "bg-white scale-110 shadow-lg"
                : "bg-white/20 opacity-60 hover:opacity-100"
            }`}
          >
            🇫🇷
          </button>
          <button
            onClick={() => setLanguage("ar")}
            className={`text-2xl p-2 rounded-xl transition-all ${
              profile.language === "ar"
                ? "bg-white scale-110 shadow-lg"
                : "bg-white/20 opacity-60 hover:opacity-100"
            }`}
          >
            🇸🇦
          </button>
        </div>

        <div className="flex gap-3 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
          {scores.map((s, i) => (
            <div
              key={i}
              className={`w-4 h-4 rounded-full transition-colors duration-500 ${
                s.completed ? "bg-green-400" : "bg-white/20"
              }`}
            />
          ))}
        </div>
      </div>

      {/* === Decorative floating objects (themed) === */}
      <FloatingObject x="8%" y="15%" size={48} delay={0}>🎨</FloatingObject>
      <FloatingObject x="85%" y="12%" size={45} delay={1}>📚</FloatingObject>
      <FloatingObject x="5%" y="75%" size={42} delay={2}>🖌️</FloatingObject>
      <FloatingObject x="3%" y="45%" size={38} delay={2.3}>⭐</FloatingObject>

      {/* === Cute aliens === */}
      <Alien x="12%" y="35%" delay={0} color="#6BCB77" />
      <Alien x="80%" y="20%" delay={1.5} color="#FF6B6B" />

      {/* === THE PLANET IMAGE === */}
      <div
        className="absolute z-10 pointer-events-none"
        style={{
          width: "700px",
          height: "700px",
          top: "50%",
          left: "50%",
          marginTop: "-350px",
          marginLeft: "-350px",
        }}
      >
        <motion.div
          className="relative w-full h-full"
          animate={{
            y: [0, -15, 0],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          {/* Glow halo behind planet */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(255,200,150,0.3) 0%, rgba(155,93,229,0.2) 40%, transparent 70%)",
              filter: "blur(40px)",
              transform: "scale(1.3)",
            }}
          />

          {/* The planet PNG */}
          <img
            src="/planet.png"
            alt="Astro Planet"
            className="relative w-full h-full object-contain"
            style={{
              filter: "drop-shadow(0 20px 60px rgba(155,93,229,0.6))",
            }}
          />
        </motion.div>
      </div>

      {/* === DOORS — TIGHTER TRIANGLE, CLOSER TO PLANET === */}
      {/* TOP — Logic (apex of triangle) */}
      <PortalDoor
        label={currentT.logic}
        emoji="🧩"
        glowColor="#6BCB77"
        doorColor="#6BCB77"
        position={{ top: "8%", left: "calc(50% - 50px)" }}
        completed={scores[1].completed}
        onClick={() => router.push("/activity/logic")}
        delay={0.3}
      />

      {/* BOTTOM-LEFT — Drawing (moved closer to planet) */}
      <PortalDoor
        label={currentT.drawing}
        emoji="🎨"
        glowColor="#FF6B6B"
        doorColor="#FF6B6B"
        position={{ top: "70%", left: "30%" }}
        completed={scores[0].completed}
        onClick={() => router.push("/activity/drawing")}
        delay={0.5}
      />

      {/* BOTTOM-RIGHT — Storytelling (moved closer to planet) */}
      <PortalDoor
        label={currentT.story}
        emoji="📖"
        glowColor="#4D96FF"
        doorColor="#4D96FF"
        position={{ top: "70%", right: "30%" }}
        completed={scores[2].completed}
        onClick={() => router.push("/activity/storytelling")}
        delay={0.7}
      />

      {/* === Center glow when all done === */}
      <AnimatePresence>
        {allCompleted && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1.5, opacity: 1 }}
            className="absolute z-20 pointer-events-none"
            style={{
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "600px",
              height: "600px",
              background:
                "radial-gradient(circle, rgba(255,217,61,0.5) 0%, transparent 60%)",
              filter: "blur(30px)",
            }}
          />
        )}
      </AnimatePresence>

      {/* === Final CTA === */}
      <AnimatePresence>
        {allCompleted && (
          <motion.button
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            whileHover={{ scale: 1.1, rotate: 2 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => router.push("/results")}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 z-40 bg-gradient-to-r from-yellow-400 to-orange-500 px-8 py-4 rounded-full text-2xl font-extrabold text-white shadow-2xl flex items-center gap-3"
            style={{ fontFamily: "'Fredoka', 'Cairo', sans-serif" }}
          >
            <Sparkles /> {currentT.finish}
          </motion.button>
        )}
      </AnimatePresence>

      {/* === Astrobot in bottom-right corner === */}
      <div className="fixed bottom-4 right-4 z-50 max-w-[200px]">
        <Astrobot
          message={currentT.welcome}
          size="sm"
          language={profile.language}
          speak={true}
        />
      </div>

      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Fredoka:wght@500;700;800&family=Baloo+2:wght@500;700&family=Cairo:wght@500;700;800&display=swap");
      `}</style>
    </main>
  );
}