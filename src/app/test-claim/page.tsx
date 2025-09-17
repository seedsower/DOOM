'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

interface Question {
  id: string;
  questionText: string;
  hint: string;
  difficulty: number;
}

interface ClaimResult {
  success: boolean;
  message?: string;
  claim?: {
    id: string;
    amount: number;
    txSignature: string;
    claimedAt: string;
  };
  error?: string;
}

export default function TestClaimPage() {
  const { publicKey, connected } = useWallet();
  const [question, setQuestion] = useState<Question | null>(null);
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ClaimResult | null>(null);
  const [claimStatus, setClaimStatus] = useState<any>(null);

  // Fetch a random question
  const fetchQuestion = async () => {
    try {
      const response = await fetch('/api/questions');
      const data = await response.json();
      if (data.success) {
        setQuestion(data.question);
        setResult(null);
        setAnswer('');
      }
    } catch (error) {
      console.error('Error fetching question:', error);
    }
  };

  // Check claim status for connected wallet
  const checkClaimStatus = async () => {
    if (!publicKey) return;
    
    try {
      const response = await fetch(`/api/status?wallet=${publicKey.toBase58()}`);
      const data = await response.json();
      if (data.success) {
        setClaimStatus(data.claimStatus);
      }
    } catch (error) {
      console.error('Error checking claim status:', error);
    }
  };

  // Submit claim
  const submitClaim = async () => {
    if (!publicKey || !question || !answer.trim()) return;

    setLoading(true);
    try {
      const response = await fetch('/api/claim', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          walletAddress: publicKey.toBase58(),
          questionId: question.id,
          answer: answer.trim()
        })
      });

      const data = await response.json();
      setResult(data);
      
      if (data.success) {
        checkClaimStatus(); // Refresh claim status
      }
    } catch (error) {
      console.error('Error submitting claim:', error);
      setResult({ success: false, error: 'Network error' });
    } finally {
      setLoading(false);
    }
  };

  // Verify answer without claiming
  const verifyAnswer = async () => {
    if (!question || !answer.trim()) return;

    setLoading(true);
    try {
      const response = await fetch('/api/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          questionId: question.id,
          answer: answer.trim()
        })
      });

      const data = await response.json();
      if (data.success) {
        if (data.correct) {
          alert('✅ Correct answer! You can now claim tokens.');
        } else {
          alert(`❌ Incorrect answer. Hint: ${data.hint}`);
        }
      }
    } catch (error) {
      console.error('Error verifying answer:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestion();
  }, []);

  useEffect(() => {
    if (connected && publicKey) {
      checkClaimStatus();
    }
  }, [connected, publicKey]);

  return (
    <div className="min-h-screen bg-black text-terminal-green p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 text-red-500 glitch-text">
            DOOM TOKEN CLAIM TEST
          </h1>
          <p className="text-lg">Test the complete claim flow with real mainnet tokens</p>
        </div>

        {/* Wallet Connection */}
        <div className="mb-8 text-center">
          <WalletMultiButton className="!bg-red-600 hover:!bg-red-700" />
        </div>

        {/* Claim Status */}
        {connected && claimStatus && (
          <div className="mb-8 p-4 border border-terminal-green rounded">
            <h3 className="text-xl font-bold mb-2">Claim Status</h3>
            {claimStatus.hasClaimed ? (
              <div className="text-green-400">
                <p>✅ You have already claimed {claimStatus.amount} DOOM tokens!</p>
                <p>Transaction: <a href={`https://explorer.solana.com/tx/${claimStatus.txSignature}`} 
                   target="_blank" rel="noopener noreferrer" className="text-blue-400 underline">
                   {claimStatus.txSignature?.substring(0, 20)}...
                </a></p>
                <p>Claimed at: {new Date(claimStatus.claimedAt).toLocaleString()}</p>
              </div>
            ) : (
              <p className="text-yellow-400">🎯 Ready to claim tokens!</p>
            )}
          </div>
        )}

        {/* Question Section */}
        {question && (
          <div className="mb-8 p-6 border border-terminal-green rounded">
            <h2 className="text-2xl font-bold mb-4">Question</h2>
            <p className="text-lg mb-4">{question.questionText}</p>
            <p className="text-sm text-gray-400 mb-4">
              💡 Hint: {question.hint}
            </p>
            <p className="text-sm text-gray-400 mb-4">
              🎯 Difficulty: {question.difficulty}/5
            </p>
            
            <div className="space-y-4">
              <input
                type="text"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Enter your answer..."
                className="w-full p-3 bg-black border border-terminal-green text-terminal-green rounded"
                disabled={loading || (claimStatus?.hasClaimed)}
              />
              
              <div className="flex gap-4">
                <button
                  onClick={verifyAnswer}
                  disabled={loading || !answer.trim()}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded"
                >
                  {loading ? 'Verifying...' : 'Verify Answer'}
                </button>
                
                {connected && !claimStatus?.hasClaimed && (
                  <button
                    onClick={submitClaim}
                    disabled={loading || !answer.trim() || !publicKey}
                    className="px-6 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 rounded"
                  >
                    {loading ? 'Claiming...' : 'Claim Tokens'}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Result Section */}
        {result && (
          <div className={`mb-8 p-6 border rounded ${
            result.success ? 'border-green-500 bg-green-900/20' : 'border-red-500 bg-red-900/20'
          }`}>
            <h3 className="text-xl font-bold mb-2">
              {result.success ? '🎉 Success!' : '❌ Error'}
            </h3>
            
            {result.success && result.claim ? (
              <div>
                <p className="mb-2">{result.message}</p>
                <p>Amount: {result.claim.amount} DOOM tokens</p>
                <p>Transaction: <a href={`https://explorer.solana.com/tx/${result.claim.txSignature}`} 
                   target="_blank" rel="noopener noreferrer" className="text-blue-400 underline">
                   {result.claim.txSignature}
                </a></p>
                <p>Claimed at: {new Date(result.claim.claimedAt).toLocaleString()}</p>
              </div>
            ) : (
              <p>{result.error || result.message}</p>
            )}
          </div>
        )}

        {/* Controls */}
        <div className="text-center space-x-4">
          <button
            onClick={fetchQuestion}
            className="px-6 py-2 bg-terminal-green text-black hover:bg-green-400 rounded"
          >
            Get New Question
          </button>
          
          {connected && (
            <button
              onClick={checkClaimStatus}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded"
            >
              Refresh Status
            </button>
          )}
        </div>

        {/* Answer Key for Testing */}
        <div className="mt-12 p-6 border border-gray-600 rounded bg-gray-900/50">
          <h3 className="text-xl font-bold mb-4 text-yellow-400">🔑 Answer Key (for testing)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p><strong>Total supply:</strong> 37000000</p>
              <p><strong>Blockchain:</strong> solana</p>
              <p><strong>Claim amount:</strong> 734</p>
              <p><strong>Symbol:</strong> doom</p>
              <p><strong>Program:</strong> token-2022</p>
            </div>
            <div>
              <p><strong>Mint address:</strong> 48RRMbPXK1uuzJCo66yTVgRSZGARqSpE7FdXupwBbWoD</p>
              <p><strong>DOOM stands for:</strong> decentralized oracle of monetary</p>
              <p><strong>Min balance:</strong> 1</p>
              <p><strong>Advanced interface:</strong> the judas interface</p>
              <p><strong>Metadata format:</strong> json</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
