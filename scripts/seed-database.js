const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');

const prisma = new PrismaClient();

// Hash function for answers
function hashAnswer(answer) {
  return crypto.createHash('sha256').update(answer.toLowerCase().trim()).digest('hex');
}

// DOOM Protocol Questions and Answers
const questions = [
  {
    questionText: "What is the total supply of DOOM tokens?",
    answer: "37000000",
    hint: "Check the protocol metrics - it's a number that represents total collapse",
    difficulty: 1
  },
  {
    questionText: "What blockchain network does DOOM Protocol operate on?",
    answer: "solana",
    hint: "Fast, cheap, and built for the apocalypse",
    difficulty: 1
  },
  {
    questionText: "How many DOOM tokens do you receive per successful claim?",
    answer: "734",
    hint: "The number of the beast's cousin",
    difficulty: 2
  },
  {
    questionText: "What is the symbol of the DOOM token?",
    answer: "doom",
    hint: "It's literally in the name",
    difficulty: 1
  },
  {
    questionText: "What program standard does DOOM token use?",
    answer: "token-2022",
    hint: "The newest token standard with metadata support",
    difficulty: 3
  },
  {
    questionText: "What is the mint address of DOOM token on mainnet?",
    answer: "48RRMbPXK1uuzJCo66yTVgRSZGARqSpE7FdXupwBbWoD",
    hint: "Check the Solana Explorer - it's a long string starting with numbers",
    difficulty: 4
  },
  {
    questionText: "What does DOOM stand for in the protocol context?",
    answer: "decentralized oracle of monetary",
    hint: "Think about what a financial protocol might represent",
    difficulty: 3
  },
  {
    questionText: "What is the minimum token balance required to access the bunker?",
    answer: "1",
    hint: "Even one token grants you access to the collapse",
    difficulty: 2
  },
  {
    questionText: "What is the name of the interface for advanced users?",
    answer: "the judas interface",
    hint: "Named after betrayal, found in the navigation",
    difficulty: 2
  },
  {
    questionText: "What file format is used for DOOM token metadata?",
    answer: "json",
    hint: "Standard web format for structured data",
    difficulty: 2
  }
];

async function seedDatabase() {
  try {
    console.log('🔥 Starting DOOM Protocol database seeding...');

    // Clear existing questions
    await prisma.question.deleteMany({});
    console.log('📝 Cleared existing questions');

    // Insert new questions
    for (const q of questions) {
      await prisma.question.create({
        data: {
          questionText: q.questionText,
          answerHash: hashAnswer(q.answer),
          hint: q.hint,
          difficulty: q.difficulty,
          isActive: true
        }
      });
      console.log(`✅ Added question: "${q.questionText.substring(0, 50)}..."`);
    }

    // Initialize protocol metrics if not exists
    const existingMetrics = await prisma.protocolMetrics.findFirst();
    if (!existingMetrics) {
      await prisma.protocolMetrics.create({
        data: {
          totalSupply: BigInt(37000000),
          circulatingSupply: BigInt(37000000),
          totalClaimed: BigInt(0),
          totalBurned: BigInt(0),
          uniqueHolders: 0
        }
      });
      console.log('📊 Initialized protocol metrics');
    }

    console.log('🎯 Database seeding complete!');
    console.log(`📋 Total questions added: ${questions.length}`);
    
    // Display answer key for testing
    console.log('\n🔑 ANSWER KEY (for testing):');
    questions.forEach((q, index) => {
      console.log(`${index + 1}. ${q.questionText}`);
      console.log(`   Answer: ${q.answer}`);
      console.log(`   Hash: ${hashAnswer(q.answer)}`);
      console.log('');
    });

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase, hashAnswer };
