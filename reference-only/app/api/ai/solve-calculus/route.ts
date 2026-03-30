import { NextRequest, NextResponse } from 'next/server';
import { solveCalculus } from '@/ai/flows/solve-calculus';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { problem } = body;

    if (!problem) {
      return NextResponse.json(
        { error: 'Problem is required' },
        { status: 400 }
      );
    }

    const result = await solveCalculus({ problem });
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error solving calculus problem:', error);
    return NextResponse.json(
      { error: 'Failed to solve calculus problem' },
      { status: 500 }
    );
  }
}
