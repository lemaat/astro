"use client";

import React, { useState, useRef, useEffect, useContext } from "react";
import { ReactSketchCanvas, ReactSketchCanvasRef } from "react-sketch-canvas";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { Button } from "@/components/ui/button";
import { Eraser, Undo, Trash2, CheckCircle, Palette } from "lucide-react";
import Astrobot from "@/components/Astrobot"; // Assuming we keep the component in a shared folder

// Types
type Language = "fr" | "ar";
const COLORS = ["#FF6B6B", "#4D96FF", "#FFD93D", "#6BCB77", "#6B4EE6", "#FF9F43", "#000000"];

const REFERENCES = {
  easy: [
    { id: "duck", name: { fr: "un canard", ar: "بطة" }, img: "/references/duck.png" },
    { id: "sun", name: { fr: "un soleil", ar: "شمس" }, img: "/references/sun.png" },
    { id: "boat", name: { fr: "un bateau", ar: "قارب" }, img: "/references/boat.png" }
  ],
  medium: [
    { id: "rocket", name: { fr: "une fusée", ar: "صاروخ" }, img: "/references/rocket.png" },
    { id: "cat", name: { fr: "un chat", ar: "قطة" }, img: "/references/cat.png" },
    { id: "tree", name: { fr: "un arbre", ar: "شجرة" }, img: "/references/tree.png" }
  ],
  hard: [
    { id: "house", name: { fr: "une maison", ar: "منزل" }, img: "/references/house.png" },
    { id: "butterfly", name: { fr: "un papillon", ar: "فراشة" }, img: "/references/butterfly.png" },
    { id: "landscape", name: { fr: "un paysage", ar: "منظر طبيعي" }, img: "/references/landscape.png" }
  ]
};

export default function DrawingPage() {
  // Demo State (In real app, pull from Context)
  const [lang, setLang] = useState<Language>("fr");
  const [childName] = useState("Léo");
  const [difficulty] = useState<"easy" | "medium" | "hard">("easy");
  
  const canvasRef = useRef<ReactSketchCanvasRef>(null);
  const [strokeColor, setStrokeColor] = useState("#000000");
  const [isEraser, setIsEraser] = useState(false);
  const [startTime] = useState(Date.now());
  const [strokeCount, setStrokeCount] = useState(0);
  const [usedColors, setUsedColors] = useState<Set<string>>(new Set(["#000000"]));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);

  // Pick a random reference once
  const [reference] = useState(() => {
    const list = REFERENCES[difficulty];
    return list[Math.floor(Math.random() * list.length)];
  });

  const t = {
    fr: {
      title: "Mission Dessin 🚀",
      instruction: `Bienvenue à la Porte du Dessin, ${childName} ! Essaie de dessiner ${reference.name.fr}. Utilise les couleurs que tu aimes. Appuie sur 'C'est fini !' quand tu as terminé.`,
      done: "C'est fini ! ✅",
      analyzing: "Laisse-moi regarder ton chef-d'œuvre...",
      back: "Retour au vaisseau 🌍",
      another: "Autre mission 🚪",
      tryToDraw: "Essaie de dessiner ceci :"
    },
    ar: {
      title: "مهمة الرسم 🚀",
      instruction: `مرحباً بك في باب الرسم، ${childName}! حاول رسم ${reference.name.ar}. استخدم الألوان التي تحبها. اضغط على "انتهيت!" عندما تنتهي.`,
      done: "انتهيت! ✅",
      analyzing: "دعني أرى لوحتك الرائعة...",
      back: "العودة للكوكب 🌍",
      another: "مهمة أخرى 🚪",
      tryToDraw: "حاول رسم هذا:"
    }
  };

  const speak = (msg: string) => {
    const utterance = new SpeechSynthesisUtterance(msg);
    utterance.lang = lang === "fr" ? "fr-FR" : "ar-SA";
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    speak(t[lang].instruction);
  }, [lang]);

  const handleColorChange = (color: string) => {
    setStrokeColor(color);
    setIsEraser(false);
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
          age: 7, // Demo age
          engagement: {
            strokes: strokeCount,
            colorsUsed: usedColors.size,
            timeSpent
          }
        })
      });
      const data = await response.json();
      setResult(data);
      confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
      speak(lang === "fr" ? `Bravo ${childName} ! C'est magnifique !` : `أحسنت يا ${childName}! هذا رائع!`);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      className={`min-h-screen bg-[#FFF8D6] p-4 md:p-8 font-['Baloo_2'] overflow-hidden relative`}
      dir={lang === "ar" ? "rtl" : "ltr"}
    >
      {/* Background Decor */}
      <FloatingUFO className="absolute top-10 left-10 w-24 h-24 opacity-40 rotate-12" />
      <FloatingUFO className="absolute bottom-20 right-10 w-32 h-32 opacity-40 -rotate-12" color="#4D96FF" />
      
      {/* Header */}
      <header className="flex justify-between items-center mb-6 relative z-10">
        <div>
          <h1 className="text-3xl font-['Fredoka'] font-extrabold text-[#1A1B3A]">
            {t[lang].title}
          </h1>
          <span className="bg-white/50 px-4 py-1 rounded-full text-sm font-bold border-2 border-[#1A1B3A]/10">
             {difficulty.toUpperCase()} MODE
          </span>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setLang("fr")} className={`text-2xl p-2 rounded-xl transition-all ${lang === 'fr' ? 'bg-white shadow-lg scale-110' : 'opacity-50'}`}>🇫🇷</button>
          <button onClick={() => setLang("ar")} className={`text-2xl p-2 rounded-xl transition-all ${lang === 'ar' ? 'bg-white shadow-lg scale-110' : 'opacity-50'}`}>🇸🇦</button>
        </div>
      </header>

      <main className="grid grid-cols-1 lg:grid-cols-10 gap-8 items-start">
        {/* Left: Canvas Area */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-white/80 p-4 rounded-3xl shadow-xl border-4 border-white">
            <p className="text-center font-bold text-[#6B4EE6] mb-2">{t[lang].tryToDraw}</p>
            <img src={reference.img} alt="reference" className="h-32 mx-auto object-contain mb-4" />
            
            <div className="aspect-[4/3] bg-white rounded-2xl overflow-hidden border-2 border-[#E8DFF5] cursor-crosshair">
              <ReactSketchCanvas
                ref={canvasRef}
                strokeWidth={6}
                strokeColor={strokeColor}
                eraserWidth={20}
                onStroke={() => setStrokeCount(s => s + 1)}
              />
            </div>

            {/* Toolbar */}
            <div className="flex flex-wrap gap-3 mt-4 justify-center items-center">
              <div className="flex gap-2 p-2 bg-[#1A1B3A]/5 rounded-2xl">
                {COLORS.slice(0, difficulty === "easy" ? 3 : difficulty === "medium" ? 5 : 7).map(c => (
                  <button
                    key={c}
                    onClick={() => handleColorChange(c)}
                    className={`w-10 h-10 rounded-full border-4 transition-transform active:scale-90 ${strokeColor === c && !isEraser ? 'border-white scale-110 shadow-md' : 'border-transparent'}`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
              
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="icon" 
                  className={`rounded-xl border-2 ${isEraser ? 'bg-red-100 border-red-400' : 'bg-white'}`}
                  onClick={() => { setIsEraser(true); canvasRef.current?.eraseMode(true); }}
                >
                  <Eraser />
                </Button>
                <Button variant="outline" size="icon" className="rounded-xl border-2" onClick={() => canvasRef.current?.undo()}>
                  <Undo />
                </Button>
                <Button variant="outline" size="icon" className="rounded-xl border-2" onClick={() => canvasRef.current?.clearCanvas()}>
                  <Trash2 />
                </Button>
              </div>
            </div>
          </div>

          <Button 
            onClick={handleFinish}
            disabled={isSubmitting || !!result}
            className="w-full py-8 text-2xl rounded-3xl bg-[#6BCB77] hover:bg-[#5bb566] text-white shadow-xl transform transition-transform hover:scale-[1.02] active:scale-95"
          >
            {isSubmitting ? t[lang].analyzing : t[lang].done}
          </Button>
        </div>

        {/* Right: Astraubot & Results */}
        <div className="lg:col-span-4 flex flex-col items-center sticky top-8">
          <AnimatePresence mode="wait">
            {!result ? (
              <motion.div 
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="relative flex flex-col items-center"
              >
                <div className="bg-white p-6 rounded-[2rem] shadow-xl border-4 border-[#6B4EE6] mb-8 relative">
                  <p className="text-xl font-bold leading-relaxed">{t[lang].instruction}</p>
                  <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-8 h-8 bg-white border-b-4 border-r-4 border-[#6B4EE6] rotate-45" />
                </div>
               <Astrobot size="xl" />
              </motion.div>
            ) : (
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                className="bg-white p-8 rounded-[3rem] shadow-2xl border-8 border-[#FFD93D] text-center"
              >
                <h2 className="text-4xl font-['Fredoka'] mb-4 text-[#1A1B3A]">
                  {lang === "fr" ? "MAGNIFIQUE !" : "رائع جداً!"}
                </h2>
                <div className="flex justify-center gap-2 mb-6">
                  {[...Array(3)].map((_, i) => (
                    <motion.span 
                      key={i} 
                      animate={{ rotate: [0, 15, -15, 0] }} 
                      transition={{ repeat: Infinity, delay: i * 0.2 }}
                      className="text-4xl"
                    >
                      ⭐
                    </motion.span>
                  ))}
                </div>
                <p className="text-xl mb-6 font-bold">{result.feedback}</p>
                <p className="text-md text-[#6B4EE6] italic mb-8">
                  💡 {lang === "fr" ? "Petit conseil :" : "نصيحة صغيرة:"} {result.improvementTip}
                </p>
                
                <div className="flex flex-col gap-4">
                  <Button className="rounded-2xl py-6 bg-[#4D96FF] text-lg">{t[lang].another}</Button>
                  <Button variant="ghost" className="text-[#1A1B3A]">{t[lang].back}</Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

// Sub-component for decoration
function FloatingUFO({ className, color = "#6B4EE6" }: { className?: string, color?: string }) {
  return (
    <motion.div 
      animate={{ y: [0, -20, 0], rotate: [0, 5, -5, 0] }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      className={className}
    >
      <svg viewBox="0 0 100 60" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 40C20 30 50 25 80 40" stroke={color} strokeWidth="4" strokeLinecap="round" />
        <ellipse cx="50" cy="35" rx="40" ry="15" fill={color} />
        <path d="M35 25C35 15 50 10 65 25" fill={color} opacity="0.5" />
        <circle cx="30" cy="35" r="3" fill="white" />
        <circle cx="50" cy="35" r="3" fill="white" />
        <circle cx="70" cy="35" r="3" fill="white" />
      </svg>
    </motion.div>
  );
}