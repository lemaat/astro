"use client";

import React, { useState, useRef, useEffect } from "react";
import { ReactSketchCanvas, ReactSketchCanvasRef } from "react-sketch-canvas";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { Button } from "@/components/ui/button";
import { Eraser, Undo, Trash2, CheckCircle, Palette } from "lucide-react";
import Astrobot from "@/components/Astrobot"; // Assuming we keep the component in a shared folder
import { Eraser, Undo, Trash2 } from "lucide-react";
import Astrobot from "@/components/Astrobot";
import { useAstro } from "@/context/AstroContext";
import { useRouter } from "next/navigation";

type Language = "fr" | "ar";
const COLORS = ["#FF6B6B", "#4D96FF", "#FFD93D", "#6BCB77", "#6B4EE6", "#FF9F43", "#000000"];

const REFERENCES = {
  easy: [
    { id: "duck",  name: { fr: "un canard",  ar: "بطة"  }, img: "/references/duck.png"  },
    { id: "sun",   name: { fr: "un soleil",  ar: "شمس"  }, img: "/references/sun.png"   },
    { id: "boat",  name: { fr: "un bateau",  ar: "قارب" }, img: "/references/boat.png"  },
  ],
  medium: [
    { id: "rocket", name: { fr: "une fusée", ar: "صاروخ" }, img: "/references/rocket.png" },
    { id: "cat",    name: { fr: "un chat",   ar: "قطة"   }, img: "/references/cat.png"    },
    { id: "tree",   name: { fr: "un arbre",  ar: "شجرة"  }, img: "/references/tree.png"   },
  ],
  hard: [
    { id: "house",     name: { fr: "une maison",  ar: "منزل"         }, img: "/references/house.png"     },
    { id: "butterfly", name: { fr: "un papillon", ar: "فراشة"        }, img: "/references/butterfly.png" },
    { id: "landscape", name: { fr: "un paysage",  ar: "منظر طبيعي"   }, img: "/references/landscape.png" },
  ],
};

export default function DrawingPage() {
  const { profile, completeActivity } = useAstro();
  const router = useRouter();
  const lang = profile.language as Language;
  const difficulty = profile.difficulty;
  const childName = profile.name;

  const canvasRef = useRef<ReactSketchCanvasRef>(null);
  const [strokeColor, setStrokeColor] = useState("#000000");
  const [isEraser, setIsEraser] = useState(false);
  const [startTime] = useState(Date.now());
  const [strokeCount, setStrokeCount] = useState(0);
  const [usedColors, setUsedColors] = useState<Set<string>>(new Set(["#000000"]));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);

  const [reference] = useState(() => {
    const list = REFERENCES[difficulty];
    return list[Math.floor(Math.random() * list.length)];
  });

  const t = {
    fr: {
      title: "Mission Dessin",
      tryToDraw: "Dessine ça :",
      instruction: `${childName}, dessine ${reference.name.fr} avec les couleurs que tu aimes !`,
      done: "J'ai fini ! ✅",
      analyzing: "Je regarde ton chef-d'œuvre… ✨",
      back: "Retour au vaisseau 🌍",
      another: "Nouvelle mission 🚀",
      magnifique: "MAGNIFIQUE !",
      conseil: "Petit conseil :",
    },
    ar: {
      title: "مهمة الرسم",
      tryToDraw: "ارسم هذا :",
      instruction: `${childName}، ارسم ${reference.name.ar} بالألوان التي تحبها!`,
      done: "انتهيت! ✅",
      analyzing: "أرى لوحتك الرائعة… ✨",
      back: "العودة للكوكب 🌍",
      another: "مهمة جديدة 🚀",
      magnifique: "!رائع جداً",
      conseil: ":نصيحة صغيرة",
    },
  }[lang];

  useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    const u = new SpeechSynthesisUtterance(t.instruction);
    u.lang = lang === "fr" ? "fr-FR" : "ar-SA";
    window.speechSynthesis.speak(u);
  }, []);

  const handleColorChange = (color: string) => {
    setStrokeColor(color);
    setIsEraser(false);
    canvasRef.current?.eraseMode(false);
    setUsedColors(prev => new Set(prev).add(color));
  };

  const handleFinish = async () => {
    if (!canvasRef.current) return;
    setIsSubmitting(true);
    const drawingData = await canvasRef.current.exportImage("png");
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);
    try {
      const storedKey = typeof window !== "undefined" ? localStorage.getItem("astro_api_key") || "" : "";
      const response = await fetch("/api/score-drawing", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(storedKey ? { "x-api-key": storedKey } : {}),
        },
        body: JSON.stringify({
          drawing: drawingData,
          reference: reference.id,
          difficulty,
          age: profile.age,
          engagement: { strokes: strokeCount, colorsUsed: usedColors.size, timeSpent },
        }),
      });
      const data = await response.json();
      setResult(data);
      const ability = Math.round(((data.similarity ?? 5) + (data.color_accuracy ?? 5) + (data.creativity ?? 5)) / 3);
      const engagement = Math.min(10, Math.round(strokeCount / 10 + usedColors.size * 1.5));
      completeActivity("drawing", ability, engagement, data.feedback ?? "");
      confetti({ particleCount: 200, spread: 80, origin: { y: 0.5 } });
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const stars = result
    ? Math.max(1, Math.round((((result.similarity ?? 0) + (result.color_accuracy ?? 0) + (result.creativity ?? 0)) / 3) / 10 * 5))
    : 0;

  const colorCount = difficulty === "easy" ? 3 : difficulty === "medium" ? 5 : 7;

  return (
    <div
      className="min-h-screen overflow-hidden relative"
      style={{
        background: "linear-gradient(135deg, #1a0533 0%, #2d1b69 40%, #1a3a6b 100%)",
        direction: lang === "ar" ? "rtl" : "ltr",
        fontFamily: "'Baloo 2', 'Fredoka', sans-serif",
      }}
    >
      {/* Starfield */}
      {[...Array(30)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-white"
          style={{
            width: Math.random() * 3 + 1,
            height: Math.random() * 3 + 1,
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            opacity: Math.random() * 0.6 + 0.2,
          }}
          animate={{ opacity: [0.2, 0.9, 0.2] }}
          transition={{ duration: Math.random() * 3 + 2, repeat: Infinity, delay: Math.random() * 3 }}
        />
      ))}

      {/* Header */}
      <header className="relative z-10 flex justify-between items-center px-6 py-4">
        <div className="flex items-center gap-3">
          <div>
            <h1 style={{ fontFamily: "'Fredoka', sans-serif", fontSize: 28, fontWeight: 700, color: "#fff", letterSpacing: 1 }}>
              🎨 {t.title}
            </h1>
            <span style={{
              background: "linear-gradient(90deg,#FF6B6B,#FFD93D)",
              borderRadius: 99,
              padding: "2px 14px",
              fontSize: 12,
              fontWeight: 800,
              color: "#1a0533",
              letterSpacing: 2,
              textTransform: "uppercase",
            }}>
              {difficulty} mode
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span style={{ color: "#fff", fontWeight: 600, fontSize: 15, opacity: 0.8 }}>{childName}</span>
          <div style={{ width: 38, height: 38, borderRadius: 99, background: "linear-gradient(135deg,#FF6B6B,#6B4EE6)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, color: "#fff", fontSize: 16 }}>
            {childName[0]}
          </div>
        </div>
      </header>

      <main className="relative z-10 grid grid-cols-1 lg:grid-cols-5 gap-6 px-6 pb-8 items-start">

        {/* LEFT — Canvas */}
        <div className="lg:col-span-3 flex flex-col gap-4">

          {/* Reference strip */}
          <motion.div
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            style={{ background: "rgba(255,255,255,0.08)", backdropFilter: "blur(12px)", borderRadius: 24, border: "1.5px solid rgba(255,255,255,0.15)", padding: "16px 24px", display: "flex", alignItems: "center", gap: 20 }}
          >
            <div style={{ background: "rgba(255,255,255,0.12)", borderRadius: 16, padding: 10 }}>
              <img src={reference.img} alt={reference.id} style={{ height: 72, width: 72, objectFit: "contain" }} />
            </div>
            <div>
              <p style={{ color: "#FFD93D", fontWeight: 700, fontSize: 13, letterSpacing: 2, textTransform: "uppercase", marginBottom: 2 }}>{t.tryToDraw}</p>
              <p style={{ color: "#fff", fontFamily: "'Fredoka',sans-serif", fontSize: 26, fontWeight: 700, lineHeight: 1.1 }}>
                {lang === "fr" ? reference.name.fr : reference.name.ar}
              </p>
            </div>
          </motion.div>

          {/* Canvas */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}
            style={{ background: "#fff", borderRadius: 24, overflow: "hidden", boxShadow: "0 8px 40px rgba(0,0,0,0.4)", border: "4px solid rgba(255,255,255,0.25)", cursor: "crosshair" }}
          >
            <div style={{ aspectRatio: "4/3" }}>
              <ReactSketchCanvas
                ref={canvasRef}
                strokeWidth={6}
                strokeColor={strokeColor}
                eraserWidth={20}
                onStroke={() => setStrokeCount(s => s + 1)}
                style={{ width: "100%", height: "100%" }}
              />
            </div>
          </motion.div>

          {/* Toolbar */}
          <div style={{ background: "rgba(255,255,255,0.08)", backdropFilter: "blur(12px)", borderRadius: 20, border: "1.5px solid rgba(255,255,255,0.15)", padding: "12px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
            {/* Colors */}
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              {COLORS.slice(0, colorCount).map(c => (
                <button
                  key={c}
                  onClick={() => handleColorChange(c)}
                  style={{
                    width: 36, height: 36, borderRadius: 99,
                    backgroundColor: c,
                    border: strokeColor === c && !isEraser ? "3px solid #fff" : "3px solid transparent",
                    boxShadow: strokeColor === c && !isEraser ? `0 0 0 3px ${c}88, 0 4px 12px ${c}88` : "0 2px 6px rgba(0,0,0,0.3)",
                    transform: strokeColor === c && !isEraser ? "scale(1.2)" : "scale(1)",
                    transition: "all 0.15s",
                    cursor: "pointer",
                  }}
                />
              ))}
            </div>

            {/* Tools */}
            <div style={{ display: "flex", gap: 8 }}>
              {[
                { icon: <Eraser size={18}/>, action: () => { setIsEraser(true); canvasRef.current?.eraseMode(true); }, active: isEraser, title: "Gomme" },
                { icon: <Undo size={18}/>,   action: () => canvasRef.current?.undo(),         active: false, title: "Annuler" },
                { icon: <Trash2 size={18}/>, action: () => canvasRef.current?.clearCanvas(),  active: false, title: "Effacer" },
              ].map((btn, i) => (
                <button
                  key={i}
                  onClick={btn.action}
                  title={btn.title}
                  style={{
                    width: 40, height: 40, borderRadius: 12, cursor: "pointer",
                    background: btn.active ? "rgba(255,107,107,0.3)" : "rgba(255,255,255,0.12)",
                    border: btn.active ? "2px solid #FF6B6B" : "2px solid rgba(255,255,255,0.2)",
                    color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "all 0.15s",
                  }}
                >
                  {btn.icon}
                </button>
              ))}
            </div>
          </div>

          {/* Finish button */}
          <motion.button
            onClick={handleFinish}
            disabled={isSubmitting || !!result}
            whileHover={!isSubmitting && !result ? { scale: 1.02 } : {}}
            whileTap={!isSubmitting && !result ? { scale: 0.97 } : {}}
            style={{
              width: "100%", padding: "18px 0", borderRadius: 20, border: "none", cursor: isSubmitting || result ? "not-allowed" : "pointer",
              background: result ? "rgba(255,255,255,0.1)" : "linear-gradient(135deg,#6BCB77,#4D96FF)",
              color: "#fff", fontSize: 20, fontWeight: 800,
              fontFamily: "'Fredoka',sans-serif", letterSpacing: 1,
              boxShadow: result ? "none" : "0 6px 24px rgba(107,203,119,0.4)",
              opacity: result ? 0.5 : 1,
            }}
          >
            {isSubmitting ? t.analyzing : t.done}
          </motion.button>
        </div>

        {/* RIGHT — Bot & Results */}
        <div className="lg:col-span-2 flex flex-col items-center gap-6 sticky top-4">
          <AnimatePresence mode="wait">
            {!result ? (
              <motion.div key="bot" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }} className="flex flex-col items-center gap-4 w-full">
                {/* Speech bubble */}
                <div style={{ background: "rgba(255,255,255,0.12)", backdropFilter: "blur(16px)", borderRadius: 24, border: "1.5px solid rgba(255,255,255,0.2)", padding: "18px 22px", position: "relative", width: "100%" }}>
                  <p style={{ color: "#fff", fontSize: 16, lineHeight: 1.6, fontWeight: 500, margin: 0 }}>{t.instruction}</p>
                  <div style={{ position: "absolute", bottom: -12, left: "50%", transform: "translateX(-50%) rotate(45deg)", width: 22, height: 22, background: "rgba(255,255,255,0.12)", borderRight: "1.5px solid rgba(255,255,255,0.2)", borderBottom: "1.5px solid rgba(255,255,255,0.2)" }} />
                </div>
                <Astrobot size="xl" mood={isSubmitting ? "thinking" : "happy"} />
              </motion.div>
            ) : (
              <motion.div
                key="result"
                initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                style={{ width: "100%", background: "rgba(255,255,255,0.1)", backdropFilter: "blur(20px)", border: "2px solid rgba(255,215,0,0.4)", borderRadius: 32, padding: 32, textAlign: "center" }}
              >
                <motion.p
                  initial={{ scale: 0.5 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 300 }}
                  style={{ fontFamily: "'Fredoka',sans-serif", fontSize: 36, fontWeight: 800, color: "#FFD93D", marginBottom: 16 }}
                >
                  {t.magnifique}
                </motion.p>

                {/* Stars */}
                <div style={{ display: "flex", justifyContent: "center", gap: 6, marginBottom: 20 }}>
                  {[...Array(5)].map((_, i) => (
                    <motion.span
                      key={i}
                      initial={{ scale: 0, rotate: -30 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ delay: i * 0.12, type: "spring", stiffness: 300 }}
                      style={{ fontSize: 32 }}
                    >
                      {i < stars ? "⭐" : "✦"}
                    </motion.span>
                  ))}
                </div>

                {/* Scores */}
                <div style={{ display: "flex", justifyContent: "center", gap: 16, marginBottom: 20 }}>
                  {[
                    { label: "🎨", val: result.color_accuracy },
                    { label: "✏️", val: result.similarity },
                    { label: "💫", val: result.creativity },
                  ].map(({ label, val }) => (
                    <div key={label} style={{ background: "rgba(255,255,255,0.1)", borderRadius: 14, padding: "8px 14px", display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                      <span style={{ fontSize: 20 }}>{label}</span>
                      <span style={{ color: "#fff", fontWeight: 800, fontSize: 18, fontFamily: "'Fredoka',sans-serif" }}>{val ?? "—"}</span>
                      <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 11 }}>/10</span>
                    </div>
                  ))}
                </div>

                {/* Feedback */}
                <p style={{ color: "#fff", fontSize: 17, fontWeight: 600, lineHeight: 1.5, marginBottom: 14 }}>{result.feedback}</p>

                {/* Tip */}
                <div style={{ background: "rgba(107,78,230,0.3)", border: "1.5px solid rgba(107,78,230,0.5)", borderRadius: 16, padding: "12px 16px", marginBottom: 24 }}>
                  <p style={{ color: "#c4b5fd", fontSize: 13, fontWeight: 700, marginBottom: 4, textTransform: "uppercase", letterSpacing: 1 }}>💡 {t.conseil}</p>
                  <p style={{ color: "#fff", fontSize: 15, lineHeight: 1.5, margin: 0 }}>{result.improvementTip}</p>
                </div>

                {/* Buttons */}
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <button
                    onClick={() => { setResult(null); canvasRef.current?.clearCanvas(); }}
                    style={{ padding: "14px 0", borderRadius: 16, border: "none", cursor: "pointer", background: "linear-gradient(135deg,#4D96FF,#6B4EE6)", color: "#fff", fontSize: 17, fontWeight: 700, fontFamily: "'Fredoka',sans-serif" }}
                  >
                    {t.another}
                  </button>
                  <button
                    onClick={() => router.push("/planet")}
                    style={{ padding: "12px 0", borderRadius: 16, border: "1.5px solid rgba(255,255,255,0.2)", cursor: "pointer", background: "transparent", color: "rgba(255,255,255,0.7)", fontSize: 15, fontWeight: 600 }}
                  >
                    {t.back}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
