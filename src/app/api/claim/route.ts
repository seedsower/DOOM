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
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] 🚀 Starting claim request processing`);
  
  try {
    // Test database connection first
    console.log(`[${timestamp}] 🔌 Testing database connection...`);
    await prisma.$connect();
    console.log(`[${timestamp}] ✅ Database connected successfully`);

    console.log(`[${timestamp}] 📝 Parsing request body...`);
    const { walletAddress, questionId, answer } = await request.json();
    console.log(`[${timestamp}] 📋 Request data:`, { 
      walletAddress: walletAddress ? `${walletAddress.slice(0,8)}...` : 'missing',
      questionId,
      hasAnswer: !!answer 
    });

    if (!walletAddress || !questionId || !answer) {
      console.log(`[${timestamp}] ❌ Missing required fields`);
      return NextResponse.json({ 
        error: 'Missing required fields: walletAddress, questionId, answer' 
      }, { status: 400 });
    }

    // Check if wallet has already claimed
    console.log(`[${timestamp}] 🔍 Checking for existing claim...`);
    const existingClaim = await prisma.tokenClaim.findUnique({
      where: { walletAddress }
    });

    if (existingClaim) {
      console.log(`[${timestamp}] ⚠️ Wallet already claimed tokens`);
      return NextResponse.json({ 
        error: 'Wallet has already claimed tokens' 
      }, { status: 409 });
    }

    // Get the question and verify answer
    console.log(`[${timestamp}] 📚 Fetching question ${questionId}...`);
    const question = await prisma.question.findUnique({
      where: { id: questionId }
    });

    if (!question || !question.isActive) {
      console.log(`[${timestamp}] ❌ Question not found or inactive`);
      return NextResponse.json({ 
        error: 'Question not found or inactive' 
      }, { status: 404 });
    }

    console.log(`[${timestamp}] 🔐 Verifying answer...`);
    const answerHash = hashAnswer(answer);
    const isCorrect = answerHash === question.answerHash;
    console.log(`[${timestamp}] 📊 Answer verification result: ${isCorrect}`);

    // Log verification attempt
    console.log(`[${timestamp}] 📝 Logging verification attempt...`);
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
      console.log(`[${timestamp}] ❌ Incorrect answer provided`);
      return NextResponse.json({ 
        error: 'Incorrect answer. Try again.' 
      }, { status: 400 });
    }

    // Check environment variables for minting
    console.log(`[${timestamp}] 🔑 Checking Solana environment...`);
    const hasSolanaKey = !!process.env.SOLANA_PRIVATE_KEY;
    console.log(`[${timestamp}] 🔑 SOLANA_PRIVATE_KEY present: ${hasSolanaKey}`);

    // Mint tokens to the wallet
    console.log(`[${timestamp}] 🪙 Starting token minting process...`);
    const mintResult = await mintDoomTokens(walletAddress, 734);
    console.log(`[${timestamp}] 🪙 Mint result:`, { 
      success: mintResult.success, 
      signature: mintResult.signature?.slice(0, 16) + '...',
      error: mintResult.error 
    });

    if (!mintResult.success) {
      console.log(`[${timestamp}] ❌ Token minting failed:`, mintResult.error);
      return NextResponse.json({ 
        error: `Token minting failed: ${mintResult.error}` 
      }, { status: 500 });
    }

    // Record successful claim
    console.log(`[${timestamp}] 💾 Recording successful claim...`);
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
    console.log(`[${timestamp}] 📈 Updating protocol metrics...`);
    await prisma.protocolMetrics.updateMany({
      data: {
        totalClaimed: { increment: BigInt(734) },
        lastUpdated: new Date()
      }
    });

    console.log(`[${timestamp}] ✅ Claim processed successfully!`);
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

  } catch (error: any) {
    console.error(`[${timestamp}] ❌ Error processing claim:`, {
      message: error?.message || 'Unknown error',
      stack: error?.stack || 'No stack trace',
      name: error?.name || 'Unknown',
      cause: error?.cause || 'No cause'
    });
    
    // Additional error context
    console.error(`[${timestamp}] 🔍 Error details:`, {
      nodeEnv: process.env.NODE_ENV,
      hasDatabaseUrl: !!process.env.DATABASE_URL,
      hasSolanaKey: !!process.env.SOLANA_PRIVATE_KEY,
      timestamp
    });
    
    return NextResponse.json({ 
      error: 'Internal server error',
      timestamp,
      details: process.env.NODE_ENV === 'development' ? error?.message : undefined
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
