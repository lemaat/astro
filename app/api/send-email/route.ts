import { Resend } from "resend";
import { NextResponse } from "next/server";

const resend = new Resend(process.env.RESEND_API_KEY);

function buildEmailHTML(report: any, childName: string, isArabic: boolean): string {
  const dir = isArabic ? "rtl" : "ltr";
  const activityLabels = isArabic
    ? { drawing: "الرسم", logic: "الألغاز", storytelling: "القصص", strengths: "نقاط القوة", development: "مجالات النمو", home: "أنشطة منزلية", score: "النتيجة" }
    : { drawing: "Dessin", logic: "Énigmes", storytelling: "Histoires", strengths: "Points forts", development: "Axes de développement", home: "Activités à la maison", score: "Score" };

  const scoreBar = (val: number) => {
    const pct = Math.round((val / 10) * 100);
    const color = val >= 7 ? "#6BCB77" : val >= 4 ? "#FFD93D" : "#FF6B6B";
    return `<div style="background:#f0f0f0;border-radius:99px;height:10px;width:100%;margin:4px 0;">
      <div style="background:${color};width:${pct}%;height:10px;border-radius:99px;"></div>
    </div>`;
  };

  return `<!DOCTYPE html>
<html lang="${isArabic ? "ar" : "fr"}" dir="${dir}">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>${report.title}</title></head>
<body style="margin:0;padding:0;background:#f4f1ff;font-family:'Helvetica Neue',Arial,sans-serif;direction:${dir};">
  <div style="max-width:600px;margin:0 auto;padding:32px 16px;">

    <!-- Header -->
    <div style="background:linear-gradient(135deg,#2D1B69,#1A3a6b);border-radius:24px;padding:40px 32px;text-align:center;margin-bottom:24px;">
      <div style="font-size:48px;margin-bottom:12px;">🚀✨</div>
      <h1 style="color:#FFD93D;font-size:26px;font-weight:800;margin:0 0 8px;">${report.title}</h1>
      <p style="color:rgba(255,255,255,0.7);font-size:14px;margin:0;">Astro Academy — ${new Date().toLocaleDateString(isArabic ? "ar-SA" : "fr-FR", { year: "numeric", month: "long", day: "numeric" })}</p>
    </div>

    <!-- Greeting -->
    <div style="background:#fff;border-radius:20px;padding:28px 32px;margin-bottom:20px;box-shadow:0 2px 16px rgba(0,0,0,0.06);">
      <p style="font-size:16px;line-height:1.7;color:#1A1B3A;margin:0;">${report.greeting}</p>
    </div>

    <!-- Overall score -->
    <div style="background:linear-gradient(135deg,#FFD93D22,#FF6B6B11);border:2px solid #FFD93D;border-radius:20px;padding:24px 32px;margin-bottom:20px;text-align:center;">
      <p style="color:#888;font-size:13px;font-weight:700;letter-spacing:2px;text-transform:uppercase;margin:0 0 8px;">${isArabic ? "النتيجة الإجمالية" : "Score global"}</p>
      <div style="font-size:56px;font-weight:900;color:#1A1B3A;line-height:1;">${report.scores.overall}<span style="font-size:24px;color:#888;">/10</span></div>
      <div style="display:flex;justify-content:center;gap:24px;margin-top:20px;flex-wrap:wrap;">
        ${[
          { label: "🎨 " + activityLabels.drawing, val: report.scores.drawing },
          { label: "🧩 " + activityLabels.logic, val: report.scores.logic },
          { label: "📖 " + activityLabels.storytelling, val: report.scores.storytelling },
        ].map(s => `<div style="text-align:center;min-width:100px;">
          <div style="font-size:13px;color:#555;margin-bottom:4px;">${s.label}</div>
          ${scoreBar(s.val)}
          <div style="font-size:18px;font-weight:800;color:#1A1B3A;">${s.val}/10</div>
        </div>`).join("")}
      </div>
    </div>

    <!-- Overview -->
    <div style="background:#fff;border-radius:20px;padding:28px 32px;margin-bottom:20px;box-shadow:0 2px 16px rgba(0,0,0,0.06);">
      <h2 style="font-size:18px;font-weight:800;color:#1A1B3A;margin:0 0 12px;">🔭 ${isArabic ? "نظرة عامة" : "Vue d'ensemble"}</h2>
      <p style="font-size:15px;line-height:1.8;color:#444;margin:0;">${report.overview}</p>
    </div>

    <!-- Strengths -->
    <div style="background:#f0fdf4;border:2px solid #6BCB77;border-radius:20px;padding:28px 32px;margin-bottom:20px;">
      <h2 style="font-size:18px;font-weight:800;color:#1A1B3A;margin:0 0 16px;">⭐ ${activityLabels.strengths}</h2>
      ${report.strengths.map((s: string) => `<div style="display:flex;align-items:flex-start;gap:12px;margin-bottom:10px;">
        <span style="font-size:18px;flex-shrink:0;">✅</span>
        <p style="font-size:14px;line-height:1.6;color:#2D5A27;margin:0;">${s}</p>
      </div>`).join("")}
    </div>

    <!-- Development -->
    <div style="background:#fff8e1;border:2px solid #FFD93D;border-radius:20px;padding:28px 32px;margin-bottom:20px;">
      <h2 style="font-size:18px;font-weight:800;color:#1A1B3A;margin:0 0 16px;">🌱 ${activityLabels.development}</h2>
      ${report.development.map((d: string) => `<div style="display:flex;align-items:flex-start;gap:12px;margin-bottom:10px;">
        <span style="font-size:18px;flex-shrink:0;">💡</span>
        <p style="font-size:14px;line-height:1.6;color:#7A5C00;margin:0;">${d}</p>
      </div>`).join("")}
    </div>

    <!-- Home Activities -->
    <div style="background:#fff;border-radius:20px;padding:28px 32px;margin-bottom:20px;box-shadow:0 2px 16px rgba(0,0,0,0.06);">
      <h2 style="font-size:18px;font-weight:800;color:#1A1B3A;margin:0 0 16px;">🏠 ${activityLabels.home}</h2>
      ${report.homeActivities.map((a: any, i: number) => `<div style="background:#f4f1ff;border-radius:14px;padding:16px 20px;margin-bottom:12px;">
        <p style="font-weight:800;color:#6B4EE6;margin:0 0 6px;">${i + 1}. ${a.title}</p>
        <p style="font-size:14px;line-height:1.6;color:#444;margin:0;">${a.description}</p>
      </div>`).join("")}
    </div>

    <!-- Closing -->
    <div style="background:linear-gradient(135deg,#6B4EE622,#4D96FF11);border:2px solid #6B4EE6;border-radius:20px;padding:28px 32px;margin-bottom:24px;">
      <p style="font-size:15px;line-height:1.8;color:#1A1B3A;margin:0;font-style:italic;">${report.closing}</p>
    </div>

    <!-- Footer -->
    <div style="text-align:center;padding:16px;">
      <p style="font-size:12px;color:#aaa;margin:0;">🚀 Astro Academy — ${isArabic ? "نحو مستقبل مشرق" : "Vers un avenir brillant"}</p>
    </div>
  </div>
</body>
</html>`;
}

export async function POST(req: Request) {
  try {
    const { email, report, childName, language } = await req.json();
    const isArabic = language === "ar";

    const subject = isArabic
      ? `تقرير ${childName} — أكاديمية أستروبوت 🚀`
      : `Rapport de ${childName} — Astro Academy 🚀`;

    const { error } = await resend.emails.send({
      from: "Astro Academy <onboarding@resend.dev>",
      to: email,
      subject,
      html: buildEmailHTML(report, childName, isArabic),
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json({ error }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Email send error:", error);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }
}
