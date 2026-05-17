"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useAstro } from "@/context/AstroContext";
import Astrobot from "@/components/Astrobot";
import { Rocket } from "lucide-react";

export default function WelcomePage() {
  const router = useRouter();
  const { profile, setProfile, setLanguage } = useAstro();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [name, setName] = useState("");
  const [age, setAge] = useState<number | null>(null);
  const [email, setEmail] = useState("");

  const t = {
    fr: {
      step1: "Salut ! Je suis Astrobot 👋 Comment tu t'appelles ?",
      step2Greeting: (n: string) => `Enchanté, ${n} ! Quel âge as-tu ?`,
      step3: "Super ! Quel est l'email de ton parent ?",
      placeholderName: "Mon nom est...",
      placeholderEmail: "parent@email.com",
      next: "Suivant 🚀",
      start: "Commencer l'aventure ! ✨",
    },
    ar: {
      step1: "مرحبا ! أنا أسترُوبوت 👋 ما اسمك ؟",
      step2Greeting: (n: string) => `سعيد بلقائك يا ${n} ! كم عمرك ؟`,
      step3: "رائع ! ما هو بريد والديك الإلكتروني ؟",
      placeholderName: "اسمي هو...",
      placeholderEmail: "parent@email.com",
      next: "التالي 🚀",
      start: "ابدأ المغامرة ! ✨",
    },
  };

  const lang = profile.language;
  const currentT = t[lang];

  const getMessage = () => {
    if (step === 1) return currentT.step1;
    if (step === 2) return currentT.step2Greeting(name);
    return currentT.step3;
  };

  const handleNameSubmit = () => {
    if (name.trim().length < 1) return;
    setProfile({ name: name.trim() });
    setStep(2);
  };

  const handleAgeSelect = (selectedAge: number) => {
    setAge(selectedAge);
    setProfile({ age: selectedAge });
    setStep(3);
  };

  const handleFinalSubmit = () => {
    if (!email.includes("@")) return;
    setProfile({ parentEmail: email });
    router.push("/planet");
  };

  return (
    <main
      className="min-h-screen w-full overflow-hidden relative flex flex-col items-center justify-center px-6 py-10"
      style={{ background: "linear-gradient(180deg, #1A1B3A 0%, #2D1B69 50%, #6B4EE6 100%)" }}
    >
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(60)].map((_, i) => (
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
            transition={{ duration: Math.random() * 3 + 2, repeat: Infinity, delay: Math.random() * 3 }}
          />
        ))}
      </div>

      <div className="absolute top-6 right-6 flex gap-2 z-50">
        <button
          onClick={() => setLanguage("fr")}
          className={`text-2xl p-2 rounded-xl transition-all ${
            lang === "fr" ? "bg-white scale-110 shadow-lg" : "bg-white/20 opacity-60 hover:opacity-100"
          }`}
        >
          🇫🇷
        </button>
        <button
          onClick={() => setLanguage("ar")}
          className={`text-2xl p-2 rounded-xl transition-all ${
            lang === "ar" ? "bg-white scale-110 shadow-lg" : "bg-white/20 opacity-60 hover:opacity-100"
          }`}
        >
          🇸🇦
        </button>
      </div>

      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-6xl md:text-7xl font-extrabold text-white mb-4 tracking-tight"
        style={{ fontFamily: "'Fredoka', 'Cairo', sans-serif" }}
      >
        <span style={{ color: "#FF6B6B" }}>Astro</span>
        <span style={{ color: "#FFD93D" }}>✨</span>
      </motion.h1>

      <Astrobot
        message={getMessage()}
        size="xl"
        language={lang}
        speak={true}
        position="inline"
      />

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-md mt-8"
          >
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleNameSubmit()}
              placeholder={currentT.placeholderName}
              autoFocus
              dir={lang === "ar" ? "rtl" : "ltr"}
              className="w-full px-6 py-5 text-2xl rounded-full bg-white/95 text-slate-800 placeholder-slate-400 outline-none focus:ring-4 focus:ring-yellow-400 shadow-2xl text-center"
              style={{ fontFamily: "'Baloo 2', 'Cairo', sans-serif" }}
            />
            <button
              onClick={handleNameSubmit}
              disabled={name.trim().length < 1}
              className="w-full mt-4 py-5 text-xl font-bold rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-xl hover:scale-105 transition-transform disabled:opacity-50 disabled:scale-100"
              style={{ fontFamily: "'Fredoka', 'Cairo', sans-serif" }}
            >
              {currentT.next}
            </button>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-2xl mt-8"
          >
            <div className="grid grid-cols-4 gap-3">
              {[5, 6, 7, 8, 9, 10, 11, 12].map((a) => (
                <motion.button
                  key={a}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleAgeSelect(a)}
                  className={`aspect-square rounded-full text-3xl font-bold shadow-xl transition-all ${
                    age === a
                      ? "bg-yellow-400 text-slate-900 scale-110 ring-4 ring-white"
                      : "bg-white/90 text-slate-800 hover:bg-white"
                  }`}
                  style={{ fontFamily: "'Fredoka', sans-serif" }}
                >
                  {a}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-md mt-8"
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleFinalSubmit()}
              placeholder={currentT.placeholderEmail}
              autoFocus
              className="w-full px-6 py-5 text-xl rounded-full bg-white/95 text-slate-800 placeholder-slate-400 outline-none focus:ring-4 focus:ring-yellow-400 shadow-2xl text-center"
              style={{ fontFamily: "'Baloo 2', sans-serif" }}
            />
            <button
              onClick={handleFinalSubmit}
              disabled={!email.includes("@")}
              className="w-full mt-4 py-5 text-xl font-bold rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-xl hover:scale-105 transition-transform disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2"
              style={{ fontFamily: "'Fredoka', 'Cairo', sans-serif" }}
            >
              <Rocket /> {currentT.start}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Fredoka:wght@500;700;800&family=Baloo+2:wght@500;700&family=Cairo:wght@500;700;800&display=swap");
      `}</style>
    </main>
  );
}