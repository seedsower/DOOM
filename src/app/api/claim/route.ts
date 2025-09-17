import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAnswer, hashAnswer } from '@/lib/verification';
import { PublicKey } from '@solana/web3.js';
import { mintDoomTokens } from '@/lib/mint';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const { walletAddress, questionId, answer } = await request.json();

    // Validate required fields
    if (!walletAddress || !questionId || !answer) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate wallet address format
    try {
      new PublicKey(walletAddress);
    } catch {
      return NextResponse.json(
        { error: 'Invalid wallet address' },
        { status: 400 }
      );
    }

    // Check if wallet has already claimed
    const existingClaim = await prisma.tokenClaim.findUnique({
      where: { walletAddress }
    });

    if (existingClaim) {
      return NextResponse.json(
        { error: 'Already claimed' },
        { status: 403 }
      );
    }

    // Verify the answer
    const isCorrect = verifyAnswer(questionId, answer);
    
    // Log the verification attempt
    // Get client IP for rate limiting (in production, use proper rate limiting)
    const clientIp = request.headers.get('x-forwarded-for') || 'unknown';
    await prisma.verificationAttempt.create({
      data: {
        walletAddress,
        questionId,
        answerHash: hashAnswer(answer),
        isCorrect,
        ipAddress: clientIp,
        userAgent: request.headers.get('user-agent') || 'unknown'
      }
    });

    if (!isCorrect) {
      return NextResponse.json(
        { error: 'Incorrect answer' },
        { status: 401 }
      );
    }

    // Mint DOOM tokens to the wallet
    const mintResult = await mintDoomTokens(walletAddress, 734);
    
    if (!mintResult.success) {
      return NextResponse.json(
        { error: 'Token minting failed: ' + mintResult.error },
        { status: 500 }
      );
    }

    // Create the token claim record
    const claim = await prisma.tokenClaim.create({
      data: {
        walletAddress,
        questionId,
        answerHash: hashAnswer(answer),
        amount: 734,
        verified: true,
        txSignature: mintResult.signature || `mock_tx_${crypto.randomBytes(16).toString('hex')}`
      }
    });

    // Update protocol metrics
    await updateProtocolMetrics();

    return NextResponse.json({
      success: true,
      amount: 734,
      txSignature: claim.txSignature,
      message: 'Verification complete. 734 DOOM tokens have been minted to your wallet.',
      mintAddress: '5se2cVMggFyibMqsJycmqH4N6dUY6z8iqLB8fjxrgqnh'
    });

  } catch (error) {
    console.error('Claim verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function updateProtocolMetrics() {
  try {
    // Get current metrics or create if doesn't exist
    let metrics = await prisma.protocolMetrics.findFirst();
    
    if (!metrics) {
      metrics = await prisma.protocolMetrics.create({
        data: {
          totalSupply: BigInt(37000000),
          circulatingSupply: BigInt(37000000),
          totalClaimed: BigInt(0),
          totalBurned: BigInt(0),
          uniqueHolders: 0
        }
      });
    }

    // Count total claims
    const totalClaims = await prisma.tokenClaim.count();
    const totalClaimedAmount = totalClaims * 734;

    // Update metrics
    await prisma.protocolMetrics.update({
      where: { id: metrics.id },
      data: {
        totalClaimed: BigInt(totalClaimedAmount),
        uniqueHolders: totalClaims,
        lastUpdated: new Date()
      }
    });
  } catch (error) {
    console.error('Error updating protocol metrics:', error);
  }
}
