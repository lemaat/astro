import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export async function POST(req: Request) {
  try {
    const { profile, scores } = await req.json();
    const isArabic = profile.language === "ar";
    const lang = isArabic ? "Arabic" : "French";
    const overall = Math.round((scores.drawing.ability + scores.logic.ability + scores.storytelling.ability) / 3);

    const prompt = `You are a warm, professional child development specialist. Write a parent report in ${lang}.

Child: ${profile.name}, age ${profile.age}, level: ${profile.difficulty}

Activity scores (out of 10):
- Drawing 🎨: ability=${scores.drawing.ability}, engagement=${scores.drawing.engagement}. AI feedback: "${scores.drawing.feedback}"
- Logic/Puzzles 🧩: ability=${scores.logic.ability}, engagement=${scores.logic.engagement}. AI feedback: "${scores.logic.feedback}"
- Storytelling 📖: ability=${scores.storytelling.ability}, engagement=${scores.storytelling.engagement}. AI feedback: "${scores.storytelling.feedback}"
- Overall: ${overall}/10

Write a detailed, warm, professional, and specific report entirely in ${lang}. Return ONLY valid JSON:
{
  "title": "<short report title mentioning child name>",
  "greeting": "<warm 2-sentence greeting to parents>",
  "overview": "<3-4 sentence overall assessment, specific and warm>",
  "strengths": ["<specific strength 1>", "<specific strength 2>", "<specific strength 3>"],
  "development": ["<gentle growth area 1 with context>", "<gentle growth area 2>"],
  "homeActivities": [
    {"title": "<activity name>", "description": "<2-sentence how-to>"},
    {"title": "<activity name>", "description": "<2-sentence how-to>"},
    {"title": "<activity name>", "description": "<2-sentence how-to>"}
  ],
  "closing": "<encouraging 2-sentence closing for parents>",
  "scores": {
    "drawing": ${scores.drawing.ability},
    "logic": ${scores.logic.ability},
    "storytelling": ${scores.storytelling.ability},
    "overall": ${overall}
  }
}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    const raw = (response.text ?? "")
      .replace(/```json\s*/gi, "")
      .replace(/```/g, "")
      .trim();

    const report = JSON.parse(raw);
    return NextResponse.json(report);
  } catch (error) {
    console.error("Report generation error:", error);
    return NextResponse.json({ error: "Failed to generate report" }, { status: 500 });
  }
}
