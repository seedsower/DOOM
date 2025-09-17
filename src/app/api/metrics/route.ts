import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Get current protocol metrics
    let metrics = await prisma.protocolMetrics.findFirst();
    
    if (!metrics) {
      // Create initial metrics if they don't exist
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

    // Get real-time claim data
    const totalClaims = await prisma.tokenClaim.count();
    const totalClaimedAmount = totalClaims * 734;

    // Get recent verification attempts for activity metrics
    const recentAttempts = await prisma.verificationAttempt.count({
      where: {
        attemptedAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
        }
      }
    });

    const successfulAttempts = await prisma.verificationAttempt.count({
      where: {
        attemptedAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
        },
        isCorrect: true
      }
    });

    // Calculate success rate
    const successRate = recentAttempts > 0 ? (successfulAttempts / recentAttempts) * 100 : 0;

    // Update metrics with current data
    const updatedMetrics = await prisma.protocolMetrics.update({
      where: { id: metrics.id },
      data: {
        totalClaimed: BigInt(totalClaimedAmount),
        uniqueHolders: totalClaims,
        lastUpdated: new Date()
      }
    });

    return NextResponse.json({
      totalSupply: Number(updatedMetrics.totalSupply),
      circulatingSupply: Number(updatedMetrics.circulatingSupply),
      totalClaimed: Number(updatedMetrics.totalClaimed),
      totalBurned: Number(updatedMetrics.totalBurned),
      uniqueHolders: updatedMetrics.uniqueHolders,
      claimsToday: successfulAttempts,
      attemptsToday: recentAttempts,
      successRate: Math.round(successRate * 100) / 100,
      lastUpdated: updatedMetrics.lastUpdated,
      // Mock market data (in production, this would come from DEX APIs)
      marketData: {
        price: 0.00001337,
        change24h: -66.6,
        volume24h: 13370,
        marketCap: Number(updatedMetrics.circulatingSupply) * 0.00001337
      }
    });

  } catch (error) {
    console.error('Error fetching metrics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch metrics' },
      { status: 500 }
    );
  }
}
