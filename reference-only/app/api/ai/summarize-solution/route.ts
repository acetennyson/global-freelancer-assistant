import { NextRequest, NextResponse } from 'next/server';
import { summarizeSolution } from '@/ai/flows/summarize-solution';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { calculation, solution } = body;

    if (!calculation || !solution) {
      return NextResponse.json(
        { error: 'Calculation and solution are required' },
        { status: 400 }
      );
    }

    const result = await summarizeSolution({ calculation, solution });
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error summarizing solution:', error);
    return NextResponse.json(
      { error: 'Failed to summarize solution' },
      { status: 500 }
    );
  }
}
