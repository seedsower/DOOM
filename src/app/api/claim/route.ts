import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { mintDoomTokens } from '@/lib/mint';
import crypto from 'crypto';

const prisma = new PrismaClient();

// Hash function for answers
function hashAnswer(answer: string): string {
  return crypto.createHash('sha256').update(answer.toLowerCase().trim()).digest('hex');
}

// POST /api/claim - Process token claim
export async function POST(request: NextRequest) {
  try {
    const { walletAddress, questionId, answer } = await request.json();

    if (!walletAddress || !questionId || !answer) {
      return NextResponse.json({ 
        error: 'Missing required fields: walletAddress, questionId, answer' 
      }, { status: 400 });
    }

    // Check if wallet has already claimed
    const existingClaim = await prisma.tokenClaim.findUnique({
      where: { walletAddress }
    });

    if (existingClaim) {
      return NextResponse.json({ 
        error: 'Wallet has already claimed tokens' 
      }, { status: 409 });
    }

    // Get the question and verify answer
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

    // Log verification attempt
    await prisma.verificationAttempt.create({
      data: {
        walletAddress,
        questionId,
        answerHash,
        isCorrect,
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown'
      }
    });

    if (!isCorrect) {
      return NextResponse.json({ 
        error: 'Incorrect answer. Try again.' 
      }, { status: 400 });
    }

    // Mint tokens to the wallet
    const mintResult = await mintDoomTokens(walletAddress, 734);

    if (!mintResult.success) {
      return NextResponse.json({ 
        error: `Token minting failed: ${mintResult.error}` 
      }, { status: 500 });
    }

    // Record successful claim
    const claim = await prisma.tokenClaim.create({
      data: {
        walletAddress,
        questionId,
        answerHash,
        txSignature: mintResult.signature,
        amount: 734,
        verified: true
      }
    });

    // Update protocol metrics
    await prisma.protocolMetrics.updateMany({
      data: {
        totalClaimed: { increment: BigInt(734) },
        lastUpdated: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Tokens claimed successfully!',
      claim: {
        id: claim.id,
        amount: claim.amount,
        txSignature: claim.txSignature,
        claimedAt: claim.claimedAt
      }
    });

  } catch (error) {
    console.error('Error processing claim:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
