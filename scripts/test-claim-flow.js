const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');

const prisma = new PrismaClient();

// Hash function for answers
function hashAnswer(answer) {
  return crypto.createHash('sha256').update(answer.toLowerCase().trim()).digest('hex');
}

// Test the complete claim flow
async function testClaimFlow() {
  try {
    console.log('🧪 Testing DOOM Protocol claim flow...\n');

    // 1. Get a random question
    console.log('1. Fetching questions from database...');
    const questions = await prisma.question.findMany({
      where: { isActive: true }
    });
    
    if (questions.length === 0) {
      throw new Error('No questions found in database');
    }
    
    const testQuestion = questions[0]; // Use first question for testing
    console.log(`✅ Found ${questions.length} questions`);
    console.log(`📝 Test Question: "${testQuestion.questionText}"`);
    console.log(`💡 Hint: ${testQuestion.hint}`);

    // 2. Test answer verification
    console.log('\n2. Testing answer verification...');
    
    // Test with wrong answer
    const wrongAnswer = 'wrong_answer';
    const wrongHash = hashAnswer(wrongAnswer);
    console.log(`❌ Wrong answer hash: ${wrongHash}`);
    console.log(`✅ Correct answer hash: ${testQuestion.answerHash}`);
    console.log(`🔍 Hashes match: ${wrongHash === testQuestion.answerHash}`);

    // 3. Show correct answers for all questions
    console.log('\n3. Answer key for testing:');
    const answerKey = {
      '37000000': 'Total supply question',
      'solana': 'Blockchain network question', 
      '734': 'Claim amount question',
      'doom': 'Token symbol question',
      'token-2022': 'Program standard question',
      '48RRMbPXK1uuzJCo66yTVgRSZGARqSpE7FdXupwBbWoD': 'Mint address question',
      'decentralized oracle of monetary': 'DOOM acronym question',
      '1': 'Minimum balance question',
      'the judas interface': 'Advanced interface question',
      'json': 'Metadata format question'
    };

    for (const question of questions) {
      // Find matching answer by checking hash
      let correctAnswer = 'unknown';
      for (const [answer, description] of Object.entries(answerKey)) {
        if (hashAnswer(answer) === question.answerHash) {
          correctAnswer = answer;
          break;
        }
      }
      console.log(`📋 "${question.questionText.substring(0, 50)}..."`);
      console.log(`   Answer: ${correctAnswer}`);
      console.log(`   Hash: ${question.answerHash}\n`);
    }

    // 4. Check protocol metrics
    console.log('4. Checking protocol metrics...');
    const metrics = await prisma.protocolMetrics.findFirst();
    if (metrics) {
      console.log(`📊 Total Supply: ${metrics.totalSupply}`);
      console.log(`💰 Total Claimed: ${metrics.totalClaimed}`);
      console.log(`👥 Unique Holders: ${metrics.uniqueHolders}`);
    } else {
      console.log('⚠️  No protocol metrics found');
    }

    // 5. Check existing claims
    console.log('\n5. Checking existing claims...');
    const claimCount = await prisma.tokenClaim.count();
    console.log(`📈 Total claims: ${claimCount}`);

    if (claimCount > 0) {
      const recentClaims = await prisma.tokenClaim.findMany({
        take: 5,
        orderBy: { claimedAt: 'desc' }
      });
      console.log('Recent claims:');
      recentClaims.forEach(claim => {
        console.log(`  - ${claim.walletAddress}: ${claim.amount} tokens at ${claim.claimedAt}`);
      });
    }

    console.log('\n✅ Claim flow test completed successfully!');
    console.log('\n🚀 Ready to test with frontend API calls');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run test
testClaimFlow();
