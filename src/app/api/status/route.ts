import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/status - Get protocol metrics and claim status for a wallet
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const walletAddress = searchParams.get('wallet');

    // Get protocol metrics
    const metrics = await prisma.protocolMetrics.findFirst();
    
    let claimStatus = null;
    if (walletAddress) {
      claimStatus = await prisma.tokenClaim.findUnique({
        where: { walletAddress },
        select: {
          id: true,
          amount: true,
          claimedAt: true,
          txSignature: true,
          verified: true
        }
      });
    }

    return NextResponse.json({
      success: true,
      metrics: {
        totalSupply: metrics?.totalSupply?.toString() || '37000000',
        circulatingSupply: metrics?.circulatingSupply?.toString() || '37000000',
        totalClaimed: metrics?.totalClaimed?.toString() || '0',
        totalBurned: metrics?.totalBurned?.toString() || '0',
        uniqueHolders: metrics?.uniqueHolders || 0,
        lastUpdated: metrics?.lastUpdated
      },
      claimStatus: claimStatus ? {
        hasClaimed: true,
        ...claimStatus
      } : {
        hasClaimed: false
      }
    });

  } catch (error) {
    console.error('Error fetching status:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
