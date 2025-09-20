import { NextRequest, NextResponse } from 'next/server';
import { getPoolInfo, simulateTrade } from '@/lib/pool';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const poolId = searchParams.get('poolId');
    
    if (!poolId) {
      return NextResponse.json(
        { error: 'Pool ID is required' },
        { status: 400 }
      );
    }

    const poolInfo = await getPoolInfo(poolId);

    // Simulate some common trade sizes
    const tradeSimulations = {
      buy100USDC: simulateTrade(100, poolInfo.usdcReserve, poolInfo.doomReserve),
      buy1000USDC: simulateTrade(1000, poolInfo.usdcReserve, poolInfo.doomReserve),
      sell1MDOOM: simulateTrade(1_000_000, poolInfo.doomReserve, poolInfo.usdcReserve)
    };

    return NextResponse.json({
      success: true,
      poolId,
      price: poolInfo.price,
      reserves: {
        doom: poolInfo.doomReserve,
        usdc: poolInfo.usdcReserve
      },
      lpSupply: poolInfo.lpSupply,
      liquidityBurned: poolInfo.lpSupply === 0,
      tradeSimulations,
      marketCap: poolInfo.doomReserve * poolInfo.price,
      fullyDilutedValue: 37_000_000 * poolInfo.price // Total DOOM supply
    });

  } catch (error: any) {
    console.error('Pool info fetch failed:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to fetch pool information'
    }, { status: 500 });
  }
}
