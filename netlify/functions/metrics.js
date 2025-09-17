const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // Get total claims
    const totalClaims = await prisma.tokenClaim.count();
    
    // Get total tokens awarded
    const totalTokensResult = await prisma.tokenClaim.aggregate({
      _sum: {
        amount: true
      }
    });

    const totalTokensAwarded = totalTokensResult._sum.amount || 0;

    // Mock additional metrics for demo
    const metrics = {
      totalClaims,
      totalTokensAwarded,
      uniqueWallets: totalClaims, // Each claim is from unique wallet
      averageClaimAmount: totalClaims > 0 ? totalTokensAwarded / totalClaims : 0,
      protocolStatus: 'ACTIVE',
      lastUpdated: new Date().toISOString()
    };

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(metrics)
    };

  } catch (error) {
    console.error('Metrics error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};
