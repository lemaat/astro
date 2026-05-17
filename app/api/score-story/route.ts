import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const audioFile = formData.get("audio") as File;
    const mimeType = (formData.get("mimeType") as string) || "audio/webm";
    const promptText = formData.get("promptText") as string;
    const age = formData.get("age") as string;
    const childName = formData.get("name") as string;

    // Convert audio to base64
    const arrayBuffer = await audioFile.arrayBuffer();
    const base64Audio = Buffer.from(arrayBuffer).toString("base64");

    const prompt = `You are Astraubot, a friendly AI space companion for children.

A child named ${childName} aged ${age} was asked to tell a story about: "${promptText}"

First, transcribe the audio. Then analyze the story.
Return ONLY valid JSON:
{
  "transcript": "<full transcription of what was said>",
  "narrative_structure": <0-10>,
  "imagination": <0-10>,
  "vocabulary": <0-10>,
  "coherence": <0-10>,
  "emotional_expression": <0-10>,
  "standout_moment": "<one short quoted creative line from their story>",
  "feedback": "<warm encouraging spoken-style message to the child in French>",
  "tip": "<one friendly suggestion for next time in French>"
}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [
        {
          role: "user",
          parts: [
            { text: prompt },
            { inlineData: { mimeType, data: base64Audio } },
          ],
        },
      ],
    });

    const raw = (response.text ?? "")
      .replace(/```json\s*/gi, "")
      .replace(/```/g, "")
      .trim();

    const analysis = JSON.parse(raw);

    if (!analysis.transcript || analysis.transcript.length < 3) {
      return NextResponse.json({ error: "Empty story" }, { status: 400 });
    }

    return NextResponse.json(analysis);
  } catch (error) {
    console.error("Story analysis error:", error);
    return NextResponse.json({ error: "Failed to process story" }, { status: 500 });
  }
}
