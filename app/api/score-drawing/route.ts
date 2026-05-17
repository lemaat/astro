import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { drawing, reference, difficulty, age, engagement } = await req.json();

    const apiKey = req.headers.get("x-api-key") || process.env.OPENROUTER_API_KEY || "";

    if (!apiKey) {
      return NextResponse.json({ error: "API key manquante" }, { status: 401 });
    }

    const base64Data = drawing.split(",")[1];

    const prompt = `You are an encouraging AI art teacher for children.
    A child aged ${age} (Difficulty: ${difficulty}) drew an image attempting to copy a "${reference}".

    Technical engagement signals:
    - Strokes: ${engagement.strokes}
    - Colors used: ${engagement.colorsUsed}
    - Time spent: ${engagement.timeSpent} seconds

    Analyze the attached drawing. Be extremely generous and positive.
    Return ONLY a valid JSON object with no extra text, no markdown, no backticks:
    {
      "similarity": number (0-10),
      "color_accuracy": number (0-10),
      "creativity": number (0-10),
      "feedback": "A short encouraging sentence in French",
      "parentNotes": "Detailed analysis of fine motor skills or creativity",
      "improvementTip": "One tiny friendly thing to try next time"
    }`;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        models: [
          "google/gemma-4-31b-it:free",
          "nvidia/nemotron-nano-12b-v2-vl:free",
          "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free",
        ],
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              { type: "image_url", image_url: { url: `data:image/png;base64,${base64Data}` } },
            ],
          },
        ],
        temperature: 0.4,
        max_tokens: 1000,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("OpenRouter API error:", JSON.stringify(data));
      return NextResponse.json({ error: "OpenRouter API error" }, { status: 500 });
    }

    const rawText = data.choices?.[0]?.message?.content || "";
    const clean = rawText.replace(/```json|```/g, "").trim();
    const result = JSON.parse(clean);

    return NextResponse.json(result);
  } catch (error) {
    console.error("AI Scoring Error:", error);
    return NextResponse.json({ error: "Failed to score" }, { status: 500 });
  }
}
