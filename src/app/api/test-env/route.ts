import { NextResponse } from 'next/server';

export async function GET() {
  const timestamp = new Date().toISOString();
  
  return NextResponse.json({
    timestamp,
    environment: {
      nodeEnv: process.env.NODE_ENV,
      hasDatabaseUrl: !!process.env.DATABASE_URL,
      databaseUrlPrefix: process.env.DATABASE_URL?.slice(0, 20) + '...',
      hasSolanaKey: !!process.env.SOLANA_PRIVATE_KEY,
      solanaKeyLength: process.env.SOLANA_PRIVATE_KEY?.length || 0,
      solanaKeyPrefix: process.env.SOLANA_PRIVATE_KEY?.slice(0, 20) + '...'
    }
  });
}
