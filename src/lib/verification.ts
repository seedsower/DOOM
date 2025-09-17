import crypto from 'crypto';

// Question pool with correct answer hashes
export interface VerificationQuestion {
  id: string;
  question: string;
  answerHash: string;
  hint?: string;
  page?: number;
}

export const VERIFICATION_QUESTIONS: VerificationQuestion[] = [
  {
    id: "q1",
    question: "On page 154, what furniture held the Fools Crow paperback?",
    answerHash: hashAnswer("stack of old national geographics"),
    hint: "Think about where old magazines might accumulate",
    page: 154
  },
  {
    id: "q2", 
    question: "What corporate entity appears in the Ciba-Geigy dossier?",
    answerHash: hashAnswer("ciba-geigy"),
    hint: "A pharmaceutical giant with a dark history"
  },
  {
    id: "q3",
    question: "Unit 734 first appears in which chapter?",
    answerHash: hashAnswer("chapter 12"),
    hint: "The frequency of collapse has its origins"
  },
  {
    id: "q4",
    question: "What temperature begins human system failure?",
    answerHash: hashAnswer("37 degrees celsius"),
    hint: "37 degrees in the metric system"
  },
  {
    id: "q5",
    question: "The Ghost of Fools Crow speaks in what frequency?",
    answerHash: hashAnswer("734 hz"),
    hint: "The wavelength of destruction itself"
  },
  {
    id: "q6",
    question: "What binary pattern represents the number 37?",
    answerHash: hashAnswer("100101"),
    hint: "Ones and zeros, chaos and order"
  },
  {
    id: "q7",
    question: "How many pages contain references to environmental collapse?",
    answerHash: hashAnswer("47"),
    hint: "More than you'd expect, fewer than you'd hope"
  },
  {
    id: "q8",
    question: "The bunker access code mentioned in chapter 12 is?",
    answerHash: hashAnswer("666"),
    hint: "The number of the beast, but for access"
  }
];

export function hashAnswer(answer: string): string {
  return crypto
    .createHash('sha256')
    .update(answer.toLowerCase().trim())
    .digest('hex');
}

export function verifyAnswer(questionId: string, userAnswer: string): boolean {
  const question = VERIFICATION_QUESTIONS.find(q => q.id === questionId);
  if (!question) return false;
  
  const userAnswerHash = hashAnswer(userAnswer);
  return userAnswerHash === question.answerHash;
}

export function getRandomQuestion(): VerificationQuestion {
  const randomIndex = Math.floor(Math.random() * VERIFICATION_QUESTIONS.length);
  return VERIFICATION_QUESTIONS[randomIndex];
}
