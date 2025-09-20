import { NextRequest, NextResponse } from 'next/server';
import { createDoomPool, loadPoolAuthority, POOL_CONFIG } from '@/lib/pool';

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  console.log(`[${new Date().toISOString()}] Pool creation API called`);

  try {
    const { doomAmount, usdcAmount } = await request.json();
    
    // Validate input amounts
    if (!doomAmount || !usdcAmount || doomAmount <= 0 || usdcAmount <= 0) {
      return NextResponse.json(
        { error: 'Invalid liquidity amounts provided' },
        { status: 400 }
      );
    }

    console.log(`Creating pool with ${doomAmount.toLocaleString()} DOOM and $${usdcAmount} USDC`);

    // Load pool authority keypair
    const poolAuthority = loadPoolAuthority();
    console.log(`Pool authority: ${poolAuthority.publicKey.toString()}`);

    // Create the pool with initial liquidity
    const result = await createDoomPool(poolAuthority, {
      doom: doomAmount,
      usdc: usdcAmount
    });

    const executionTime = Date.now() - startTime;
    console.log(`Pool creation completed in ${executionTime}ms`);

    return NextResponse.json({
      success: true,
      poolId: result.poolId,
      lpTokenMint: result.lpTokenMint,
      createTxSignature: result.txSignature,
      burnTxSignature: result.burnTxSignature,
      liquidityBurned: true,
      message: result.message,
      config: {
        doomAmount,
        usdcAmount,
        initialPrice: POOL_CONFIG.INITIAL_PRICE
      },
      executionTime
    });

  } catch (error: any) {
    const executionTime = Date.now() - startTime;
    console.error(`Pool creation failed after ${executionTime}ms:`, error);

    return NextResponse.json({
      success: false,
      error: error.message || 'Pool creation failed',
      executionTime
    }, { status: 500 });
  }
}
