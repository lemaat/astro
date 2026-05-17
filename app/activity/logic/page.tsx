"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { LOGIC_PUZZLES, LogicPuzzle } from "./puzzles";
import Astraubot from "@/components/Astrobot";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useAstro } from "@/context/AstroContext";

export default function LogicActivity() {
  const router = useRouter();
  const { profile, completeActivity } = useAstro();
  const [puzzle, setPuzzle] = useState<LogicPuzzle | null>(null);
  const [timeLeft, setTimeLeft] = useState(180);
  const [status, setStatus] = useState<"intro" | "playing" | "success" | "timeout">("intro");
  const [attempts, setAttempts] = useState(0);
  const [startTime] = useState(Date.now());
  const [hesitationCount, setHesitationCount] = useState(0);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const t = {
    fr: {
      timer: "Temps restant",
      academy: "ACADÉMIE ALIEN",
      back: "Retour au Hub",
      intro: `Bienvenue à l'Académie Alien, ${profile.name} ! Regarde bien et trouve la réponse. Tu as 3 minutes, mais pas de stress, amuse-toi bien !`,
      win: `BRILLANT ! 🌟 Tu as réussi, ${profile.name} !`,
      fail: `Bon essai, ${profile.name} ! La prochaine fois, regarde bien le motif étape par étape. Tu vas y arriver !`,
    },
    ar: {
      timer: "الوقت المتبقي",
      academy: "أكاديمية الكائنات فضائية",
      back: "العودة للمركز",
      intro: `مرحباً بك في أكاديمية الفضاء يا ${profile.name}! انظر جيداً وجد الإجابة. لديك 3 دقائق، لكن لا داعي للقلق، استمتع بوقتك!`,
      win: `عبقري! 🌟 لقد فعلتها يا ${profile.name}!`,
      fail: `محاولة جيدة يا ${profile.name}! في المرة القادمة، انظر إلى النمط خطوة بخطوة. ستنجح بالتأكيد!`,
    }
  }[profile.language];

  useEffect(() => {
    const pool = LOGIC_PUZZLES[profile.difficulty];
    setPuzzle(pool[Math.floor(Math.random() * pool.length)]);

    // Auto-advance past intro after 3 s
    const introDelay = setTimeout(
      () => setStatus((prev) => (prev === "intro" ? "playing" : prev)),
      3000
    );

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          setStatus("timeout");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearTimeout(introDelay);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const handleAnswer = async (choice: string) => {
    setAttempts(prev => prev + 1);
    if (choice === puzzle?.answer) {
      if (timerRef.current) clearInterval(timerRef.current);
      setStatus("success");
      confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
      const ability = Math.max(2, 10 - (attempts) * 2);
      const engagement = Math.max(0, 10 - Math.floor(hesitationCount / 60));
      completeActivity("logic", ability, engagement, t.win);
      await submitScore(true);
    } else {
      // Re-trigger visual feedback but don't end game
      const btn = document.getElementById(`opt-${choice}`);
      btn?.classList.add("animate-shake");
      setTimeout(() => btn?.classList.remove("animate-shake"), 500);
    }
  };

  const submitScore = async (isCorrect: boolean) => {
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);
    await fetch("/api/score-logic", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        puzzleId: puzzle?.id,
        correctAnswer: puzzle?.answer,
        childAnswer: isCorrect ? puzzle?.answer : "timeout",
        timeSpent,
        attempts,
        hesitation: hesitationCount
      }),
    });
  };

  useEffect(() => {
    if (status === "timeout") {
      completeActivity("logic", 0, 5, t.fail);
      submitScore(false);
    }
  }, [status]);

  return (
    <div 
      className="min-h-screen w-full overflow-hidden flex flex-col p-6 font-baloo relative"
      style={{ backgroundColor: "#D6F5DC", direction: profile.language === "ar" ? "rtl" : "ltr" }}
      onMouseMove={() => setHesitationCount(prev => prev + 1)}
    >
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <motion.div animate={{ y: [0, -20, 0] }} transition={{ duration: 4, repeat: Infinity }} className="absolute top-20 left-10 text-6xl">π</motion.div>
        <motion.div animate={{ x: [0, 20, 0] }} transition={{ duration: 5, repeat: Infinity }} className="absolute top-40 right-20 text-6xl">∑</motion.div>
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity }} className="absolute bottom-40 left-20 text-6xl">∞</motion.div>
      </div>

      {/* Header */}
      <div className="flex justify-between items-center z-10 bg-white/30 p-4 rounded-3xl backdrop-blur-sm shadow-sm">
        <div>
          <h1 className="text-2xl font-fredoka text-slate-700">{profile.name}</h1>
          <span className="bg-emerald-500 text-white px-3 py-1 rounded-full text-sm font-bold uppercase tracking-widest">
            {profile.difficulty}
          </span>
        </div>
        <div className="text-center">
          <p className="text-xs uppercase text-slate-500 font-bold tracking-tighter">{t.timer}</p>
          <p className={`text-3xl font-fredoka ${timeLeft < 30 ? "text-red-500 animate-pulse" : "text-slate-700"}`}>
            {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center relative z-10">
        <AnimatePresence mode="wait">
          {status === "playing" || status === "intro" ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }} 
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              className="bg-white/80 p-8 rounded-[40px] shadow-2xl border-8 border-emerald-200 max-w-2xl w-full text-center"
            >
              <h2 className="text-3xl font-fredoka text-emerald-800 mb-8">
                {puzzle?.question[profile.language]}
              </h2>

              <div className="flex flex-wrap justify-center gap-4 mb-12">
                {puzzle?.visuals.map((v, i) => (
                  <motion.div 
                    key={i}
                    whileHover={{ scale: 1.1 }}
                    className={`w-16 h-16 md:w-20 md:h-20 flex items-center justify-center rounded-2xl bg-white border-4 border-emerald-100 text-4xl shadow-sm ${v === "?" ? "border-dashed border-emerald-400 text-emerald-500 animate-pulse" : ""}`}
                  >
                    {v}
                  </motion.div>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-4">
                {puzzle?.options.map((opt) => (
                  <Button
                    key={opt}
                    id={`opt-${opt}`}
                    onClick={() => handleAnswer(opt)}
                    className="h-20 text-3xl rounded-3xl bg-emerald-500 hover:bg-emerald-600 transition-all transform active:scale-90 border-b-8 border-emerald-700"
                  >
                    {opt}
                  </Button>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, y: 50 }} 
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <h2 className="text-5xl font-fredoka text-emerald-900 mb-8">
                {status === "success" ? t.win : t.fail}
              </h2>
              <Button 
                onClick={() => router.push("/planet")}
                className="px-12 py-8 text-2xl rounded-full bg-indigo-600 hover:bg-indigo-700 font-fredoka shadow-xl"
              >
                {t.back}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Astraubot */}
      <div className="fixed bottom-4 right-4 z-50">
        <Astraubot
          message={status === "success" ? t.win : status === "timeout" ? t.fail : t.intro}
          size="md"
          language={profile.language}
        />
      </div>
      
      <style jsx global>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }
        .animate-shake { animation: shake 0.4s ease-in-out; }
      `}</style>
    </div>
  );
}