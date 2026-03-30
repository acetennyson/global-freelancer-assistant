import { NextResponse } from 'next/server';
import { runAI } from '@/services/ai';

export async function POST(req: Request) {
  try {
    const { question, context } = await req.json();
    if (!question) return NextResponse.json({ error: 'No question' }, { status: 400 });

    const prompt = `You are an AI assistant for a freelancer managing global clients. Answer based on the client data below.

Client data:
${JSON.stringify(context, null, 2)}

Question: ${question}

Answer concisely and practically. Be specific about which client and why when recommending actions.`;

    const answer = await runAI(prompt);
    return NextResponse.json({ answer });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
