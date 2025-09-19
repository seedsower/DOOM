import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  const healthCheck = {
    timestamp: new Date().toISOString(),
    status: 'unknown',
    database: {
      connected: false,
      error: null as string | null,
      url_configured: false
    },
    environment: {
      node_env: process.env.NODE_ENV,
      database_url_exists: !!process.env.DATABASE_URL,
      database_url_preview: process.env.DATABASE_URL ? 
        process.env.DATABASE_URL.substring(0, 20) + '...' : 'not set'
    }
  };

  try {
    // Check if DATABASE_URL is configured
    healthCheck.environment.url_configured = !!process.env.DATABASE_URL;
    
    if (!process.env.DATABASE_URL) {
      healthCheck.database.error = 'DATABASE_URL environment variable not set';
      healthCheck.status = 'error';
      return NextResponse.json(healthCheck, { status: 500 });
    }

    // Test database connection
    await prisma.$connect();
    healthCheck.database.connected = true;

    // Test a simple query
    const questionCount = await prisma.question.count();
    healthCheck.database = {
      ...healthCheck.database,
      connected: true,
      question_count: questionCount
    };

    healthCheck.status = 'healthy';
    
    return NextResponse.json(healthCheck);

  } catch (error) {
    healthCheck.database.error = error instanceof Error ? error.message : 'Unknown database error';
    healthCheck.status = 'error';
    
    return NextResponse.json(healthCheck, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
