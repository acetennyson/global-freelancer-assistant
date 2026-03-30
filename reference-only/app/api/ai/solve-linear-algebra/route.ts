import { NextRequest, NextResponse } from 'next/server';
import { solveLinearAlgebra } from '@/ai/flows/linear-algebra-flow';

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

    const result = await solveLinearAlgebra({ problem });
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error solving linear algebra problem:', error);
    return NextResponse.json(
      { error: 'Failed to solve linear algebra problem' },
      { status: 500 }
    );
  }
}
