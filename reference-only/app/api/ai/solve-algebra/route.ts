import { NextRequest, NextResponse } from 'next/server';
import { solveAlgebra } from '@/ai/flows/solve-algebra';

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

    const result = await solveAlgebra({ problem });
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error solving algebra problem:', error);
    return NextResponse.json(
      { error: 'Failed to solve algebra problem' },
      { status: 500 }
    );
  }
}
