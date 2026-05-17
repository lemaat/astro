import { Anthropic } from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || "",
});

export async function POST(req: Request) {
  try {
    const { drawing, reference, difficulty, age, engagement } = await req.json();

    // Remove the data:image/png;base64, prefix
    const base64Data = drawing.split(',')[1];

    const prompt = `You are an encouraging AI art teacher for children. 
    A child aged ${age} (Difficulty: ${difficulty}) drew an image attempting to copy a "${reference}".
    
    Technical engagement signals: 
    - Strokes: ${engagement.strokes}
    - Colors used: ${engagement.colorsUsed}
    - Time spent: ${engagement.timeSpent} seconds
    
    Analyze the attached drawing. Be extremely generous and positive. 
    Return ONLY a JSON object with:
    {
      "similarity": number (0-10),
      "color_accuracy": number (0-10),
      "creativity": number (0-10),
      "feedback": "A short encouraging sentence in French/Arabic style (provide both)",
      "parentNotes": "Detailed analysis of fine motor skills or creativity",
      "improvementTip": "One tiny friendly thing to try next time"
    }`;

    const message = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20240620",
      max_tokens: 1000,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: prompt,
            },
            {
              type: "image",
              source: {
                type: "base64",
                media_type: "image/png",
                data: base64Data,
              },
            },
          ],
        },
      ],
    });

    const result = JSON.parse(message.content[0].text);
    return NextResponse.json(result);
  } catch (error) {
    console.error("AI Scoring Error:", error);
    return NextResponse.json({ error: "Failed to score" }, { status: 500 });
  }
}