"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAstro } from "@/context/AstroContext";
import { useRouter } from "next/navigation";
import confetti from "canvas-confetti";

export default function ResultsPage() {
  const { profile, scores } = useAstro();
  const router = useRouter();
  const isArabic = profile.language === "ar";

  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [emailInput, setEmailInput] = useState(profile.parentEmail || "");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const t = {
    fr: {
      generating: "On prépare le rapport de ton aventure… ✨",
      title: "Mission accomplie !",
      subtitle: "Voici le bilan de ton voyage spatial",
      overview: "Vue d'ensemble",
      strengths: "Points forts",
      development: "Pour progresser",
      home: "À faire à la maison",
      sendReport: "Envoyer le rapport aux parents",
      emailLabel: "Email des parents",
      send: "Envoyer 📬",
      sending: "Envoi en cours…",
      sent: "Rapport envoyé ! 🎉",
      backToHub: "Retour au vaisseau 🚀",
      scores: { drawing: "Dessin", logic: "Énigmes", storytelling: "Histoires", overall: "Score global" },
      error: "Erreur d'envoi. Vérifiez l'email.",
    },
    ar: {
      generating: "نحضّر تقرير مغامرتك… ✨",
      title: "!المهمة أنجزت",
      subtitle: "إليك ملخص رحلتك الفضائية",
      overview: "نظرة عامة",
      strengths: "نقاط القوة",
      development: "للتطوير",
      home: "أنشطة منزلية",
      sendReport: "إرسال التقرير للوالدين",
      emailLabel: "بريد الوالدين الإلكتروني",
      send: "إرسال 📬",
      sending: "جارٍ الإرسال…",
      sent: "!تم إرسال التقرير 🎉",
      backToHub: "🚀 العودة للمركبة",
      scores: { drawing: "الرسم", logic: "الألغاز", storytelling: "القصص", overall: "النتيجة الإجمالية" },
      error: "خطأ في الإرسال. تحقق من البريد الإلكتروني.",
    },
  }[profile.language];

  useEffect(() => {
    const scoresByKey = {
      drawing: scores.find(s => s.activity === "drawing") ?? { ability: 0, engagement: 0, feedback: "" },
      logic: scores.find(s => s.activity === "logic") ?? { ability: 0, engagement: 0, feedback: "" },
      storytelling: scores.find(s => s.activity === "storytelling") ?? { ability: 0, engagement: 0, feedback: "" },
    };

    fetch("/api/report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profile, scores: scoresByKey }),
    })
      .then(r => r.json())
      .then(data => {
        setReport(data);
        setLoading(false);
        confetti({ particleCount: 200, spread: 90, origin: { y: 0.4 } });
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSend = async () => {
    if (!emailInput.trim()) return;
    setSending(true);
    setError("");
    try {
      const res = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailInput, report, childName: profile.name, language: profile.language }),
      });
      if (!res.ok) throw new Error();
      setSent(true);
    } catch {
      setError(t.error);
    } finally {
      setSending(false);
    }
  };

  const scoreColor = (v: number) => v >= 7 ? "#6BCB77" : v >= 4 ? "#FFD93D" : "#FF6B6B";
  const activityScores = [
    { key: "drawing", label: "🎨 " + t.scores.drawing, val: scores.find(s => s.activity === "drawing")?.ability ?? 0 },
    { key: "logic",   label: "🧩 " + t.scores.logic,   val: scores.find(s => s.activity === "logic")?.ability ?? 0 },
    { key: "storytelling", label: "📖 " + t.scores.storytelling, val: scores.find(s => s.activity === "storytelling")?.ability ?? 0 },
  ];
  const overall = Math.round(activityScores.reduce((a, s) => a + s.val, 0) / 3);

  return (
    <div
      dir={isArabic ? "rtl" : "ltr"}
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #1a0533 0%, #2d1b69 40%, #1a3a6b 100%)",
        fontFamily: "'Baloo 2', 'Cairo', sans-serif",
        padding: "32px 16px",
      }}
    >
      {/* Stars */}
      {[...Array(24)].map((_, i) => (
        <motion.div
          key={i}
          className="fixed rounded-full bg-white pointer-events-none"
          style={{ width: Math.random() * 2 + 1, height: Math.random() * 2 + 1, top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%`, opacity: 0.3 }}
          animate={{ opacity: [0.2, 0.8, 0.2] }}
          transition={{ duration: Math.random() * 3 + 2, repeat: Infinity, delay: Math.random() * 3 }}
        />
      ))}

      <div style={{ maxWidth: 720, margin: "0 auto", position: "relative", zIndex: 10 }}>
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ textAlign: "center", padding: "80px 0" }}>
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }} style={{ fontSize: 64, display: "inline-block" }}>🚀</motion.div>
              <p style={{ color: "#fff", fontSize: 20, marginTop: 24, fontWeight: 600 }}>{t.generating}</p>
            </motion.div>
          ) : (
            <motion.div key="content" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>

              {/* Hero */}
              <div style={{ textAlign: "center", marginBottom: 32 }}>
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, delay: 0.2 }} style={{ fontSize: 72, marginBottom: 8 }}>🏆</motion.div>
                <h1 style={{ fontFamily: "'Fredoka', sans-serif", fontSize: 36, fontWeight: 800, color: "#FFD93D", margin: "0 0 8px" }}>{t.title}</h1>
                <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 16, margin: 0 }}>{t.subtitle}</p>
              </div>

              {/* Score cards */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 24 }}>
                <div style={{ gridColumn: "span 4", background: "rgba(255,255,255,0.08)", borderRadius: 20, padding: "20px 24px", textAlign: "center", border: "2px solid rgba(255,215,0,0.3)" }}>
                  <p style={{ color: "#FFD93D", fontSize: 12, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", margin: "0 0 4px" }}>{t.scores.overall}</p>
                  <div style={{ fontFamily: "'Fredoka',sans-serif", fontSize: 56, fontWeight: 900, color: "#fff", lineHeight: 1 }}>
                    {overall}<span style={{ fontSize: 22, opacity: 0.5 }}>/10</span>
                  </div>
                </div>
                {activityScores.map((s, i) => (
                  <motion.div
                    key={s.key}
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * i + 0.3 }}
                    style={{ background: "rgba(255,255,255,0.08)", borderRadius: 16, padding: "16px 12px", textAlign: "center", border: `2px solid ${scoreColor(s.val)}44` }}
                  >
                    <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 11, margin: "0 0 4px" }}>{s.label}</p>
                    <div style={{ fontFamily: "'Fredoka',sans-serif", fontSize: 28, fontWeight: 800, color: scoreColor(s.val) }}>{s.val}<span style={{ fontSize: 13, opacity: 0.6 }}>/10</span></div>
                    <div style={{ background: "rgba(255,255,255,0.1)", borderRadius: 99, height: 6, marginTop: 8 }}>
                      <div style={{ background: scoreColor(s.val), width: `${s.val * 10}%`, height: 6, borderRadius: 99, transition: "width 1s" }} />
                    </div>
                  </motion.div>
                ))}
              </div>

              {report && (
                <>
                  {/* Overview */}
                  <Card title={`🔭 ${t.overview}`} delay={0.5}>
                    <p style={{ color: "rgba(255,255,255,0.85)", fontSize: 15, lineHeight: 1.8, margin: 0 }}>{report.overview}</p>
                  </Card>

                  {/* Strengths */}
                  <Card title={`⭐ ${t.strengths}`} accent="#6BCB77" delay={0.6}>
                    {report.strengths?.map((s: string, i: number) => (
                      <div key={i} style={{ display: "flex", gap: 10, marginBottom: 10, alignItems: "flex-start" }}>
                        <span style={{ fontSize: 16, flexShrink: 0, marginTop: 2 }}>✅</span>
                        <p style={{ color: "rgba(255,255,255,0.85)", fontSize: 14, lineHeight: 1.6, margin: 0 }}>{s}</p>
                      </div>
                    ))}
                  </Card>

                  {/* Development */}
                  <Card title={`🌱 ${t.development}`} accent="#FFD93D" delay={0.7}>
                    {report.development?.map((d: string, i: number) => (
                      <div key={i} style={{ display: "flex", gap: 10, marginBottom: 10, alignItems: "flex-start" }}>
                        <span style={{ fontSize: 16, flexShrink: 0, marginTop: 2 }}>💡</span>
                        <p style={{ color: "rgba(255,255,255,0.85)", fontSize: 14, lineHeight: 1.6, margin: 0 }}>{d}</p>
                      </div>
                    ))}
                  </Card>

                  {/* Home Activities */}
                  <Card title={`🏠 ${t.home}`} delay={0.8}>
                    {report.homeActivities?.map((a: any, i: number) => (
                      <div key={i} style={{ background: "rgba(107,78,230,0.2)", borderRadius: 12, padding: "12px 16px", marginBottom: 10 }}>
                        <p style={{ fontWeight: 800, color: "#c4b5fd", margin: "0 0 4px", fontSize: 14 }}>{i + 1}. {a.title}</p>
                        <p style={{ color: "rgba(255,255,255,0.75)", fontSize: 13, lineHeight: 1.6, margin: 0 }}>{a.description}</p>
                      </div>
                    ))}
                  </Card>

                  {/* Closing */}
                  <Card delay={0.9}>
                    <p style={{ color: "rgba(255,255,255,0.85)", fontSize: 15, lineHeight: 1.8, margin: 0, fontStyle: "italic" }}>{report.closing}</p>
                  </Card>

                  {/* Email send */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1 }}
                    style={{ background: "rgba(255,255,255,0.08)", border: "2px solid rgba(77,150,255,0.4)", borderRadius: 20, padding: "28px 24px", marginBottom: 20 }}
                  >
                    <h3 style={{ fontFamily: "'Fredoka',sans-serif", color: "#fff", fontSize: 20, fontWeight: 700, margin: "0 0 16px" }}>📬 {t.sendReport}</h3>
                    <label style={{ color: "rgba(255,255,255,0.6)", fontSize: 12, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", display: "block", marginBottom: 8 }}>{t.emailLabel}</label>
                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                      <input
                        type="email"
                        value={emailInput}
                        onChange={e => setEmailInput(e.target.value)}
                        disabled={sent}
                        style={{ flex: 1, minWidth: 200, padding: "12px 16px", borderRadius: 12, border: "2px solid rgba(255,255,255,0.2)", background: "rgba(255,255,255,0.08)", color: "#fff", fontSize: 15, outline: "none" }}
                        placeholder="parent@email.com"
                        dir="ltr"
                      />
                      <button
                        onClick={handleSend}
                        disabled={sending || sent || !emailInput.trim()}
                        style={{ padding: "12px 24px", borderRadius: 12, border: "none", cursor: sent ? "default" : "pointer", background: sent ? "#6BCB77" : "linear-gradient(135deg,#4D96FF,#6B4EE6)", color: "#fff", fontWeight: 800, fontSize: 15, fontFamily: "'Fredoka',sans-serif", whiteSpace: "nowrap" }}
                      >
                        {sent ? t.sent : sending ? t.sending : t.send}
                      </button>
                    </div>
                    {error && <p style={{ color: "#FF6B6B", fontSize: 13, marginTop: 8 }}>{error}</p>}
                  </motion.div>
                </>
              )}

              {/* Back button */}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.1 }} style={{ textAlign: "center" }}>
                <button
                  onClick={() => router.push("/planet")}
                  style={{ background: "rgba(255,255,255,0.1)", border: "2px solid rgba(255,255,255,0.2)", borderRadius: 16, padding: "14px 32px", color: "rgba(255,255,255,0.8)", fontSize: 16, fontWeight: 600, cursor: "pointer" }}
                >
                  {t.backToHub}
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function Card({ title, children, accent, delay = 0 }: { title?: string; children: React.ReactNode; accent?: string; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
      style={{ background: "rgba(255,255,255,0.07)", border: `2px solid ${accent ? accent + "44" : "rgba(255,255,255,0.12)"}`, borderRadius: 20, padding: "24px", marginBottom: 16 }}
    >
      {title && <h3 style={{ fontFamily: "'Fredoka',sans-serif", color: "#fff", fontSize: 18, fontWeight: 700, margin: "0 0 14px" }}>{title}</h3>}
      {children}
    </motion.div>
  );
}
