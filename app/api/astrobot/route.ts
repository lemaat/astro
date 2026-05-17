import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export async function POST(req: Request) {
  try {
    const { selected, childName, passionsContext } = await req.json();

    const systemPrompt = `Tu es AstroBot, un guide sympathique pour KidsSpark, une app éducative spatiale pour enfants 5-14 ans. Tu parles en français, ton ton est joyeux et simple. KidsSpark a 3 activités: dessin, logique, storytelling. L enfant s appelle ${childName || "Explorer"}.${passionsContext ? ` ${passionsContext} Utilise ces passions pour personnaliser tes réponses et suggestions d'activités.` : ""}
Reponds TOUJOURS avec UNIQUEMENT un JSON valide, sans markdown, sans backticks, sans texte avant ou apres:
{"message":"ta reponse courte max 2 phrases","options":[{"icon":"emoji","text":"texte court"},{"icon":"emoji","text":"texte court"},{"icon":"🏠","text":"Menu principal"}]}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [
        {
          role: "user",
          parts: [{ text: systemPrompt + "\n\nL enfant a choisi: " + selected }],
        },
      ],
      config: { temperature: 0.7, maxOutputTokens: 300 },
    });

    const raw = (response.text ?? "").replace(/```json\s*/gi, "").replace(/```/g, "").trim();
    const result = JSON.parse(raw);
    return NextResponse.json(result);
  } catch (error) {
    console.error("AstroBot error:", error);
    return NextResponse.json({
      message: "Oups ! Je suis perdu dans l'espace 🚀 Réessaie !",
      options: [{ icon: "🏠", text: "Menu principal" }],
    });
  }
}
