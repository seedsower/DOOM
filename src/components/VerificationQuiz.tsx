'use client';

import React, { useState, useEffect } from 'react';

interface Question {
  id: string;
  question: string;
  hint?: string;
  page?: number;
}

interface VerificationQuizProps {
  onSubmit: (questionId: string, answer: string) => void;
  loading: boolean;
}

// Pool of verification questions based on literary references
const QUESTION_POOL: Question[] = [
  {
    id: "q1",
    question: "On page 154, what furniture held the Fools Crow paperback?",
    hint: "Think about where old magazines might accumulate",
    page: 154
  },
  {
    id: "q2", 
    question: "What corporate entity appears in the Ciba-Geigy dossier?",
    hint: "A pharmaceutical giant with a dark history"
  },
  {
    id: "q3",
    question: "Unit 734 first appears in which chapter?",
    hint: "The frequency of collapse has its origins"
  },
  {
    id: "q4",
    question: "What temperature begins human system failure?",
    hint: "37 degrees in the metric system"
  },
  {
    id: "q5",
    question: "The Ghost of Fools Crow speaks in what frequency?",
    hint: "The wavelength of destruction itself"
  },
  {
    id: "q6",
    question: "What binary pattern represents the number 37?",
    hint: "Ones and zeros, chaos and order"
  },
  {
    id: "q7",
    question: "How many pages contain references to environmental collapse?",
    hint: "More than you'd expect, fewer than you'd hope"
  },
  {
    id: "q8",
    question: "The bunker access code mentioned in chapter 12 is?",
    hint: "The number of the beast, but for access"
  }
];

export const VerificationQuiz: React.FC<VerificationQuizProps> = ({ onSubmit, loading }) => {
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [answer, setAnswer] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    // Select random question on component mount
    const randomQuestion = QUESTION_POOL[Math.floor(Math.random() * QUESTION_POOL.length)];
    setCurrentQuestion(randomQuestion);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentQuestion || !answer.trim() || loading) return;

    setAttempts(prev => prev + 1);
    onSubmit(currentQuestion.id, answer);
  };

  const handleNewQuestion = () => {
    const randomQuestion = QUESTION_POOL[Math.floor(Math.random() * QUESTION_POOL.length)];
    setCurrentQuestion(randomQuestion);
    setAnswer('');
    setShowHint(false);
  };

  if (!currentQuestion) {
    return (
      <div className="text-center">
        <div className="animate-pulse text-terminal-green">
          Loading verification protocol...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Question Header */}
      <div>
        <h3 className="text-lg font-bold text-warning-amber mb-2">
          VERIFICATION CHALLENGE #{attempts + 1}
        </h3>
        {currentQuestion.page && (
          <div className="text-xs text-glitch-blue mb-2">
            Reference: Page {currentQuestion.page}
          </div>
        )}
      </div>

      {/* Question */}
      <div className="bg-doom-black/50 p-4 border border-terminal-green rounded">
        <p className="text-terminal-green font-mono">
          {currentQuestion.question}
        </p>
      </div>

      {/* Hint */}
      {currentQuestion.hint && (
        <div>
          {!showHint ? (
            <button
              onClick={() => setShowHint(true)}
              className="text-xs text-glitch-blue hover:text-terminal-green transition-colors underline"
            >
              Show hint
            </button>
          ) : (
            <div className="text-xs text-warning-amber bg-warning-amber/10 p-3 border border-warning-amber rounded">
              💡 {currentQuestion.hint}
            </div>
          )}
        </div>
      )}

      {/* Answer Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Your Answer:
          </label>
          <input
            type="text"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Enter your answer..."
            className="w-full bg-doom-black border border-terminal-green rounded px-3 py-2 text-terminal-green placeholder-terminal-green/50 focus:border-glitch-blue focus:outline-none"
            disabled={loading}
            required
          />
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading || !answer.trim()}
            className="flex-1 bg-terminal-green/20 border border-terminal-green px-4 py-2 rounded hover:bg-terminal-green/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <span className="animate-spin mr-2">⟳</span>
                Verifying...
              </span>
            ) : (
              'SUBMIT ANSWER'
            )}
          </button>

          <button
            type="button"
            onClick={handleNewQuestion}
            disabled={loading}
            className="bg-glitch-blue/20 border border-glitch-blue px-4 py-2 rounded hover:bg-glitch-blue/30 disabled:opacity-50 transition-colors"
          >
            NEW QUESTION
          </button>
        </div>
      </form>

      {/* Instructions */}
      <div className="text-xs opacity-70 space-y-1">
        <p>• Answers are case-insensitive</p>
        <p>• Spelling matters - be precise</p>
        <p>• Only true readers will know</p>
        <p>• The protocol remembers everything</p>
      </div>

      {/* Literary Warning */}
      <div className="bg-blood-red/10 border border-blood-red p-3 rounded">
        <p className="text-blood-red text-xs font-bold mb-1">
          LITERARY VERIFICATION REQUIRED
        </p>
        <p className="text-xs opacity-70">
          These questions reference specific details from the source material. 
          Guessing will not work. Reading is the only path to verification.
        </p>
      </div>
    </div>
  );
};
