import { NextRequest, NextResponse } from 'next/server';
import { approximateIntegral } from '@/ai/flows/numerical-integration-flow';

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

    const result = await approximateIntegral({ problem });
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error approximating integral:', error);
    return NextResponse.json(
      { error: 'Failed to approximate integral' },
      { status: 500 }
    );
  }
}
