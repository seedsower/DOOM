import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  const results: any = {
    timestamp: new Date().toISOString(),
    tests: {}
  };

  // Test 1: Database Connection
  try {
    await prisma.$connect();
    await prisma.question.findFirst();
    results.tests.database = { status: 'success', message: 'Database connection working' };
  } catch (error: any) {
    results.tests.database = { status: 'error', message: error.message };
  }

  // Test 2: Environment Variables
  results.tests.environment = {
    status: 'info',
    hasDatabaseUrl: !!process.env.DATABASE_URL,
    hasSolanaKey: !!process.env.SOLANA_PRIVATE_KEY,
    solanaKeyLength: process.env.SOLANA_PRIVATE_KEY?.length || 0
  };

  // Test 3: Solana Keypair Loading
  try {
    const { Keypair } = require('@solana/web3.js');
    const privateKeyArray = JSON.parse(process.env.SOLANA_PRIVATE_KEY || '[]');
    const keypair = Keypair.fromSecretKey(new Uint8Array(privateKeyArray));
    results.tests.solanaKeypair = { 
      status: 'success', 
      publicKey: keypair.publicKey.toBase58() 
    };
  } catch (error: any) {
    results.tests.solanaKeypair = { status: 'error', message: error.message };
  }

  // Test 4: Prisma Client
  try {
    const questionCount = await prisma.question.count();
    results.tests.prisma = { 
      status: 'success', 
      questionCount,
      message: 'Prisma queries working' 
    };
  } catch (error: any) {
    results.tests.prisma = { status: 'error', message: error.message };
  }

  await prisma.$disconnect();
  
  return NextResponse.json(results);
}
