import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { isCorrect, attempts, timeSpent, hesitation } = await req.json();

    const ability = isCorrect ? Math.max(2, 10 - (attempts - 1) * 2) : 0;
    const speed = Math.max(0, 10 - Math.floor(timeSpent / 20));
    const focus = Math.max(0, 10 - Math.floor(hesitation / 60));
    const engagement = Math.round((speed + focus) / 2);

    return NextResponse.json({ ability, engagement, correct: isCorrect });
  } catch {
    return NextResponse.json({ error: "Failed to score" }, { status: 500 });
  }
}
