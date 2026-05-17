"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useProfile } from '@/context/AstroContext'; // Assuming context exists
import Astraubot from '@/components/Astrobot';
import { STORY_PROMPTS, UI_STRINGS } from '@/lib/story-data';
import { Button } from '@/components/ui/button';
import { Mic, Square, Sparkles, BookOpen, ArrowLeft } from 'lucide-react';
import confetti from 'canvas-confetti';
import Link from 'next/link';

export default function StorytellingPage() {
  const { profile } = useProfile(); // { name, age, difficulty, language }
  const [step, setStep] = useState<'selecting' | 'recording' | 'processing' | 'results'>('selecting');
  const [selectedPrompt, setSelectedPrompt] = useState<any>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [analysis, setAnalysis] = useState<any>(null);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const t = UI_STRINGS[profile.language];
  const prompts = STORY_PROMPTS[profile.difficulty];

  // Astraubot Logic
  const [botMessage, setBotMessage] = useState("");

  useEffect(() => {
    if (step === 'selecting') {
      const msg = profile.language === 'fr' 
        ? `Bienvenue au Portail des Histoires, ${profile.name} ! Choisis une image pour commencer.`
        : `مرحباً بك في بوابة القصص يا ${profile.name}! اختر صورة لنبدأ الحكاية.`;
      setBotMessage(msg);
    }
  }, [step, profile.name, profile.language]);

  const handleSelectPrompt = (prompt: any) => {
    setSelectedPrompt(prompt);
    setBotMessage(prompt.text[profile.language]);
    setStep('recording');
    setTimeLeft(prompt.limit);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => chunksRef.current.push(e.data);
      mediaRecorder.onstop = () => processAudio(new Blob(chunksRef.current, { type: 'audio/webm' }));

      mediaRecorder.start();
      setIsRecording(true);

      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            stopRecording();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      console.error("Mic access denied", err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
      setStep('processing');
      setBotMessage(t.processing);
    }
  };

  const processAudio = async (blob: Blob) => {
    const formData = new FormData();
    formData.append('audio', blob, 'story.webm');
    formData.append('promptText', selectedPrompt.text[profile.language]);
    formData.append('age', profile.age.toString());
    formData.append('name', profile.name);

    try {
      const res = await fetch('/api/score-story', { method: 'POST', body: formData });
      const data = await res.json();
      
      if (data.error) throw new Error();
      
      setAnalysis(data);
      setStep('results');
      confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
      setBotMessage(data.feedback);
    } catch (e) {
      setStep('results');
      setAnalysis({ error: true });
    }
  };

  return (
    <div className={`min-h-screen bg-[#E8DFF5] font-['Baloo_2'] overflow-hidden relative p-6`}>
      {/* Decorative Background Elements */}
      <BackgroundDecorations />

      {/* Header */}
      <header className="flex justify-between items-center max-w-6xl mx-auto mb-8 relative z-10">
        <Link href="/planet-hub">
          <Button variant="ghost" className="rounded-full bg-white/50 hover:bg-white">
            <ArrowLeft className="mr-2 h-5 w-5" /> {t.backToHub}
          </Button>
        </Link>
        <div className="bg-white/80 px-6 py-2 rounded-full shadow-sm border-2 border-[#6B4EE6]/20">
          <span className="font-bold text-[#6B4EE6] capitalize">{profile.difficulty} Mode</span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto relative z-10">
        <AnimatePresence mode="wait">
          
          {/* STEP 1: Prompt Selection */}
          {step === 'selecting' && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="text-center"
            >
              <h1 className="text-4xl md:text-5xl font-['Fredoka'] font-extrabold text-[#1A1B3A] mb-8">
                {t.pickPrompt}
              </h1>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {prompts.map((p: any) => (
                  <motion.button
                    key={p.id}
                    whileHover={{ scale: 1.05, rotate: 2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleSelectPrompt(p)}
                    className="bg-white p-8 rounded-[40px] shadow-xl border-b-8 border-purple-200 flex flex-col items-center gap-4 transition-all"
                  >
                    <span className="text-7xl">{p.icon}</span>
                    <p className="text-lg font-medium leading-tight text-gray-700">{p.text[profile.language]}</p>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {/* STEP 2: Recording */}
          {step === 'recording' && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center">
              <div className="bg-white p-10 rounded-[40px] shadow-2xl border-4 border-[#6B4EE6] max-w-2xl w-full mb-8 relative">
                <div className="absolute -top-6 -right-6 bg-yellow-400 w-16 h-16 rounded-full flex items-center justify-center font-bold text-2xl border-4 border-white shadow-lg">
                  {timeLeft}s
                </div>
                <div className="text-6xl mb-4 text-center">{selectedPrompt.icon}</div>
                <p className="text-2xl text-center font-bold text-[#1A1B3A]">
                  {selectedPrompt.text[profile.language]}
                </p>
              </div>

              {!isRecording ? (
                <Button 
                  onClick={startRecording}
                  className="w-32 h-32 rounded-full bg-red-500 hover:bg-red-600 border-8 border-white shadow-2xl transition-transform hover:scale-110 active:scale-95"
                >
                  <Mic size={48} className="text-white" />
                </Button>
              ) : (
                <div className="flex flex-col items-center gap-6">
                  <div className="flex gap-1 h-12 items-center">
                    {[...Array(10)].map((_, i) => (
                      <motion.div
                        key={i}
                        animate={{ height: [10, Math.random() * 40 + 10, 10] }}
                        transition={{ repeat: Infinity, duration: 0.5, delay: i * 0.05 }}
                        className="w-2 bg-[#6B4EE6] rounded-full"
                      />
                    ))}
                  </div>
                  <Button 
                    onClick={stopRecording}
                    className="bg-[#1A1B3A] text-white px-8 py-6 rounded-full text-xl font-bold hover:bg-black"
                  >
                    <Square className="mr-2 fill-current" /> {t.stopRecording}
                  </Button>
                </div>
              )}
            </motion.div>
          )}

          {/* STEP 3: Processing */}
          {step === 'processing' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
              <div className="relative inline-block">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                >
                  <Sparkles size={80} className="text-[#6B4EE6]" />
                </motion.div>
                <motion.div 
                  animate={{ scale: [1, 1.2, 1] }} 
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <BookOpen size={30} className="text-purple-400" />
                </motion.div>
              </div>
              <h2 className="text-3xl font-bold text-[#1A1B3A] mt-8">{t.processing}</h2>
            </motion.div>
          )}

          {/* STEP 4: Results */}
          {step === 'results' && analysis && (
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center gap-6">
              <div className="bg-white p-8 rounded-[40px] shadow-xl w-full max-w-2xl border-t-8 border-[#6BCB77]">
                {analysis.error ? (
                  <p className="text-xl text-center py-10">{t.error}</p>
                ) : (
                  <>
                    <h2 className="text-3xl font-['Fredoka'] text-[#1A1B3A] mb-4 flex items-center gap-2">
                      <Sparkles className="text-yellow-400" /> {t.resultTitle}
                    </h2>
                    <div className="bg-purple-50 p-6 rounded-2xl mb-6 italic text-gray-700 leading-relaxed border-l-4 border-purple-300">
                      "{analysis.transcript}"
                    </div>
                    <div className="bg-[#D6F5DC] p-4 rounded-xl text-[#2D5A27] font-medium">
                      🌟 <strong>Astraubot says:</strong> "{analysis.standout_moment}" — {analysis.tip}
                    </div>
                  </>
                )}
              </div>
              
              <div className="flex gap-4">
                <Button 
                  onClick={() => setStep('selecting')}
                  className="bg-white text-[#6B4EE6] border-2 border-[#6B4EE6] px-8 py-6 rounded-full text-xl hover:bg-purple-50"
                >
                  {t.tryAgain}
                </Button>
                <Link href="/planet-hub">
                  <Button className="bg-[#6B4EE6] text-white px-8 py-6 rounded-full text-xl shadow-lg hover:bg-[#5A3DD3]">
                    {t.backToHub}
                  </Button>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* ASTRAUBOT COMPONENT */}
      <div className="fixed bottom-4 right-4 z-50">
        <Astraubot 
          message={botMessage} 
          size="md" 
          language={profile.language} 
          mood={step === 'processing' ? 'thinking' : 'happy'}
        />
      </div>
    </div>
  );
}

function BackgroundDecorations() {
  return (
    <div className="fixed inset-0 pointer-events-none opacity-40">
      <motion.div 
        animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }} 
        transition={{ duration: 6, repeat: Infinity }}
        className="absolute top-20 left-[10%] text-6xl"
      >
        📚
      </motion.div>
      <motion.div 
        animate={{ y: [0, 30, 0], rotate: [0, -10, 0] }} 
        transition={{ duration: 8, repeat: Infinity, delay: 1 }}
        className="absolute bottom-40 left-[5%] text-5xl"
      >
        ✨
      </motion.div>
      <motion.div 
        animate={{ scale: [1, 1.1, 1] }} 
        transition={{ duration: 10, repeat: Infinity }}
        className="absolute top-40 right-[15%] w-32 h-32 bg-purple-300 rounded-full blur-3xl opacity-50"
      />
      <div className="absolute top-10 right-[10%] text-4xl">✒️</div>
    </div>
  );
}