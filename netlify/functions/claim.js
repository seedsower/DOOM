const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Mock verification function for Netlify deployment
const verifyAnswer = (questionId, answer) => {
  // Simple mock verification - in production this would be more sophisticated
  const mockAnswers = {
    1: ['apocalypse', 'end times', 'revelation'],
    2: ['darkness', 'void', 'abyss'],
    3: ['knowledge', 'wisdom', 'truth']
  };
  
  const correctAnswers = mockAnswers[questionId] || [];
  return correctAnswers.some(correct => 
    answer.toLowerCase().includes(correct.toLowerCase())
  );
};

const hashAnswer = (answer) => {
  // Simple hash for demo - use proper crypto in production
  return Buffer.from(answer).toString('base64');
};

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { walletAddress, questionId, answer } = JSON.parse(event.body);

    if (!walletAddress || !questionId || !answer) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required fields' })
      };
    }

    // Check if wallet already claimed
    const existingClaim = await prisma.tokenClaim.findFirst({
      where: { walletAddress }
    });

    if (existingClaim) {
      return {
        statusCode: 409,
        body: JSON.stringify({ error: 'Wallet has already claimed tokens' })
      };
    }

    // Verify answer
    const isCorrect = verifyAnswer(parseInt(questionId), answer);

    if (!isCorrect) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: 'Incorrect answer' })
      };
    }

    // Create claim record (mock minting for Netlify deployment)
    const claim = await prisma.tokenClaim.create({
      data: {
        walletAddress,
        questionId: parseInt(questionId),
        answerHash: hashAnswer(answer),
        amount: 734,
        verified: true,
        txSignature: `netlify_mock_${Date.now()}`
      }
    });

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        amount: 734,
        txSignature: claim.txSignature,
        message: 'Verification complete. 734 DOOM tokens allocated (mock deployment).',
        mintAddress: '5se2cVMggFyibMqsJycmqH4N6dUY6z8iqLB8fjxrgqnh'
      })
    };

  } catch (error) {
    console.error('Claim verification error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};
