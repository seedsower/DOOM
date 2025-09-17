import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

// Hash function for answers
function hashAnswer(answer: string): string {
  return crypto.createHash('sha256').update(answer.toLowerCase().trim()).digest('hex');
}

// POST /api/verify - Verify answer without claiming tokens
export async function POST(request: NextRequest) {
  try {
    const { questionId, answer } = await request.json();

    if (!questionId || !answer) {
      return NextResponse.json({ 
        error: 'Missing required fields: questionId, answer' 
      }, { status: 400 });
    }

    // Get the question
    const question = await prisma.question.findUnique({
      where: { id: questionId }
    });

    if (!question || !question.isActive) {
      return NextResponse.json({ 
        error: 'Question not found or inactive' 
      }, { status: 404 });
    }

    const answerHash = hashAnswer(answer);
    const isCorrect = answerHash === question.answerHash;

    return NextResponse.json({
      success: true,
      correct: isCorrect,
      hint: !isCorrect ? question.hint : undefined
    });

  } catch (error) {
    console.error('Error verifying answer:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
