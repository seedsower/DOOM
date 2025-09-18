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
    questionText: "How many pigs did the author smoke?",
    answer: "6000",
    hint: "Its in the authors forward",
    difficulty: 1
  },
  {
    questionText: "What is the name of the authors car?",
    answer: "black dragon",
    hint: "Heat Haze",
    difficulty: 2
  },
  {
    questionText: "What device does the repo man have?",
    answer: "taser",
    hint: "Piggy Lake",
    difficulty: 2
  },
  {
    questionText: "What hasn't the sun forgotten how to do?",
    answer: "kill",
    hint: "The definitive doomsday edition",
    difficulty: 5
  },
  {
    questionText: "Who is the swiss voodoo merchant?",
    answer: "carl jung",
    hint: "christ on a crutch",
    difficulty: 4
  },
  {
    questionText: "Where was aunt mildred from?",
    answer: "poughkeepsie",
    hint: "Digital panopticon",
    difficulty: 8
  },
  {
    questionText: "What is the % debt to GDP ratio of the USA?",
    answer: "133",
    hint: "feeding the 37 trillion dollar beast",
    difficulty: 3
  },
  {
    questionText: "What is the drunken Kaiser rattling?",
    answer: "saber",
    hint: "The Tariff Tango",
    difficulty: 2
  },
  {
    questionText: "What is off-brand energy drink called?",
    answer: "jitterjuice",
    hint: "gas station in Asphalt Nightmares",
    difficulty: 2
  },
  {
    questionText: "What does Fools Crow refer to when is mentions hollow?",
    answer: "bone",
    hint: "Fools crow chapter",
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
