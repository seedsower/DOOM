const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

exports.handler = async (event, context) => {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  const healthCheck = {
    timestamp: new Date().toISOString(),
    status: 'unknown',
    database: {
      connected: false,
      error: null,
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
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify(healthCheck)
      };
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
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(healthCheck)
    };

  } catch (error) {
    healthCheck.database.error = error.message;
    healthCheck.status = 'error';
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify(healthCheck)
    };
  } finally {
    await prisma.$disconnect();
  }
};
