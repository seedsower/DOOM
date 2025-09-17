const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');

const prisma = new PrismaClient();

// Hash function for answers
function hashAnswer(answer) {
  return crypto.createHash('sha256').update(answer.toLowerCase().trim()).digest('hex');
}

// Edit questions directly in database
async function editQuestions() {
  try {
    console.log('🔧 Editing DOOM Protocol questions...\n');

    // Example: Update a specific question
    // await prisma.question.update({
    //   where: { id: 'question_id_here' },
    //   data: {
    //     questionText: 'New question text?',
    //     answerHash: hashAnswer('new_answer'),
    //     hint: 'New hint',
    //     difficulty: 3
    //   }
    // });

    // Example: Add a new question
    // await prisma.question.create({
    //   data: {
    //     questionText: 'What is the future of DOOM?',
    //     answerHash: hashAnswer('inevitable'),
    //     hint: 'It cannot be stopped',
    //     difficulty: 5,
    //     isActive: true
    //   }
    // });

    // Example: Deactivate a question
    // await prisma.question.update({
    //   where: { id: 'question_id_here' },
    //   data: { isActive: false }
    // });

    // List all current questions
    const questions = await prisma.question.findMany({
      orderBy: { createdAt: 'asc' }
    });

    console.log('📋 Current Questions:');
    questions.forEach((q, index) => {
      console.log(`${index + 1}. ID: ${q.id}`);
      console.log(`   Question: "${q.questionText}"`);
      console.log(`   Hint: ${q.hint}`);
      console.log(`   Difficulty: ${q.difficulty}`);
      console.log(`   Active: ${q.isActive}`);
      console.log(`   Hash: ${q.answerHash}\n`);
    });

    console.log('✅ Questions listed successfully!');
    console.log('💡 Uncomment and modify the examples above to edit questions.');

  } catch (error) {
    console.error('❌ Error editing questions:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  editQuestions();
}

module.exports = { editQuestions, hashAnswer };
