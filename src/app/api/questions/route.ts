import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

// Seed questions if database is empty
async function seedQuestionsIfEmpty() {
  const existingQuestions = await prisma.question.count();
  if (existingQuestions > 0) return;

  const questions = [
    {
      questionText: "How many pigs did the author smoke?",
      answer: "6000",
      hint: "Its in the authors forward",
      difficulty: 1
    },
    {
      questionText: "What is the name of the authors car?",
      answer: "black dragon",
      hint: "Heat Haze",
      difficulty: 2
    },
    {
      questionText: "What device does the repo man have?",
      answer: "taser",
      hint: "Zap",
      difficulty: 1
    },
    {
      questionText: "What hasn't the sun forgotten how to do?",
      answer: "kill",
      hint: "Solar power",
      difficulty: 2
    },
    {
      questionText: "Who is the swiss voodoo merchant?",
      answer: "carl jung",
      hint: "Psychology",
      difficulty: 3
    }
  ];

  for (const q of questions) {
    const answerHash = crypto.createHash('sha256').update(q.answer.toLowerCase().trim()).digest('hex');
    await prisma.question.create({
      data: {
        questionText: q.questionText,
        answerHash,
        hint: q.hint,
        difficulty: q.difficulty,
        isActive: true
      }
    });
  }
}

// GET /api/questions - Get a random active question
export async function GET() {
  try {
    // Seed questions if database is empty
    await seedQuestionsIfEmpty();

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
