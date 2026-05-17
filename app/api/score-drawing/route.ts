import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export async function POST(req: Request) {
  try {
    const { drawing, reference, difficulty, age, engagement } = await req.json();
    const base64Data = drawing.split(",")[1];

    const prompt = `You are an encouraging AI art teacher for children.
A child aged ${age} (difficulty: ${difficulty}) drew an image attempting to copy a "${reference}".

Technical engagement: strokes=${engagement.strokes}, colors used=${engagement.colorsUsed}, time=${engagement.timeSpent}s

Analyze the drawing. Be extremely generous and positive. Return ONLY valid JSON:
{
  "similarity": <number 0-10>,
  "color_accuracy": <number 0-10>,
  "creativity": <number 0-10>,
  "feedback": "<short encouraging sentence in French>",
  "improvementTip": "<one tiny friendly tip for next time in French>"
}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [
        {
          role: "user",
          parts: [
            { text: prompt },
            { inlineData: { mimeType: "image/png", data: base64Data } },
          ],
        },
      ],
    });

    const raw = (response.text ?? "")
      .replace(/```json\s*/gi, "")
      .replace(/```/g, "")
      .trim();

    const result = JSON.parse(raw);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Drawing score error:", error);
    return NextResponse.json({ error: "Failed to score drawing" }, { status: 500 });
  }
}
