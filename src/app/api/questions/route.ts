import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/questions - Get a random active question
export async function GET() {
  try {
    // Get all active questions
    const questions = await prisma.question.findMany({
      where: { isActive: true },
      select: {
        id: true,
        questionText: true,
        hint: true,
        difficulty: true
        // Don't return answerHash for security
      }
    });

    if (questions.length === 0) {
      return NextResponse.json({ error: 'No questions available' }, { status: 404 });
    }

    // Return a random question
    const randomQuestion = questions[Math.floor(Math.random() * questions.length)];
    
    return NextResponse.json({
      success: true,
      question: randomQuestion
    });

  } catch (error) {
    console.error('Error fetching questions:', error);
    return NextResponse.json({ error: 'Failed to fetch questions' }, { status: 500 });
  }
}
