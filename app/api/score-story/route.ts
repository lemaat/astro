import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const audioFile = formData.get('audio') as File;
    const promptText = formData.get('promptText') as string;
    const age = formData.get('age') as string;
    const childName = formData.get('name') as string;

    // 1. Transcribe with Whisper
    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: "whisper-1",
    });

    const transcript = transcription.text;

    if (!transcript || transcript.length < 5) {
      return NextResponse.json({ error: "Empty story" }, { status: 400 });
    }

    // 2. Analyze with Claude
    const response = await anthropic.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: 1000,
      system: "You are Astraubot, a friendly AI space companion for children. Analyze their story. Be extremely encouraging. Return ONLY valid JSON.",
      messages: [
        {
          role: "user",
          content: `A child aged ${age} was given this prompt: '${promptText}'. 
          They told this story: '${transcript}'. 
          Analyze it and return a JSON object with:
          - narrative_structure (0-10)
          - imagination (0-10)
          - vocabulary (0-10)
          - coherence (0-10)
          - emotional_expression (0-10)
          - standout_moment: ONE quoted short line from their transcript that is creative.
          - feedback: A short, warm, spoken-style message to the child in French or Arabic (matching the prompt language).
          - tip: ONE friendly suggestion for next time.`
        }
      ],
    });

    const analysis = JSON.parse((response.content[0] as any).text);

    return NextResponse.json({
      transcript,
      ...analysis
    });
  } catch (error) {
    console.error("Story analysis error:", error);
    return NextResponse.json({ error: "Failed to process story" }, { status: 500 });
  }
}