import { NextRequest, NextResponse } from 'next/server';
import { classifyProblem } from '@/ai/flows/classify-problem';

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

    const result = await classifyProblem({ problem });
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error classifying problem:', error);
    return NextResponse.json(
      { error: 'Failed to classify problem' },
      { status: 500 }
    );
  }
}
