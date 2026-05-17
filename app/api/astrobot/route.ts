import { NextResponse } from "next/server";

// Models from different providers to avoid shared rate limits
const FREE_MODELS = [
  "meta-llama/llama-3.3-70b-instruct:free", // Meta
  "openai/gpt-oss-20b:free",               // OpenAI OSS
  "qwen/qwen3-next-80b-a3b-instruct:free", // Qwen/Alibaba
];

async function tryModel(model: string, body: object, apiKey: string): Promise<Response> {
  return fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
    body: JSON.stringify({ model, ...body }),
    signal: AbortSignal.timeout(8000),
  });
}

export async function POST(req: Request) {
  try {
    const { selected, childName, passionsContext } = await req.json();
    const apiKey = req.headers.get("x-api-key") || process.env.OPENROUTER_API_KEY || "";

    if (!apiKey) {
      return NextResponse.json({ error: "API key manquante" }, { status: 401 });
    }

    const systemPrompt = `Tu es AstroBot, un guide sympathique pour KidsSpark, une app éducative spatiale pour enfants 5-14 ans. Tu parles en français, ton ton est joyeux et simple. KidsSpark a 3 activités: dessin, logique, storytelling. L enfant s appelle ${childName || "Explorer"}.${passionsContext ? ` ${passionsContext} Utilise ces passions pour personnaliser tes réponses et suggestions d'activités.` : ""}
Reponds TOUJOURS avec UNIQUEMENT un JSON valide, sans markdown, sans backticks, sans texte avant ou apres:
{"message":"ta reponse courte max 2 phrases","options":[{"icon":"emoji","text":"texte court"},{"icon":"emoji","text":"texte court"},{"icon":"🏠","text":"Menu principal"}]}`;

    const requestBody = {
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: "L enfant a choisi: " + selected },
      ],
      temperature: 0.7,
      max_tokens: 300,
      response_format: { type: "json_object" },
    };

    for (const model of FREE_MODELS) {
      try {
        const response = await tryModel(model, requestBody, apiKey);
        const data = await response.json();

        if (!response.ok) {
          console.warn(`Model ${model} failed (${response.status})`);
          continue;
        }

        const raw = data.choices?.[0]?.message?.content || "";
        if (!raw) continue;

        const clean = raw.replace(/```json|```/g, "").trim();
        return NextResponse.json(JSON.parse(clean));
      } catch {
        console.warn(`Model ${model} timed out or errored`);
        continue;
      }
    }

    throw new Error("All models failed");
  } catch (error) {
    console.error("AstroBot error:", error);
    return NextResponse.json({
      message: "Oups ! Je suis perdu dans l'espace 🚀 Réessaie !",
      options: [{ icon: "🏠", text: "Menu principal" }],
    });
  }
}
