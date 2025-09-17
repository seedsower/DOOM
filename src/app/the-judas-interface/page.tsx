'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { GlitchText } from '@/components/GlitchText';
import { VerificationQuiz } from '@/components/VerificationQuiz';

export default function JudasInterfacePage() {
  const { publicKey, signMessage } = useWallet();
  const [isLoading, setIsLoading] = useState(false);
  const [claimStatus, setClaimStatus] = useState<'idle' | 'success' | 'error' | 'already_claimed'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleClaimSubmit = async (questionId: string, answer: string) => {
    if (!publicKey || !signMessage) {
      setErrorMessage('Wallet not connected');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      // Sign message to prove wallet ownership
      const message = `Claiming DOOM tokens: ${Date.now()}`;
      const signature = await signMessage(new TextEncoder().encode(message));

      const response = await fetch('/api/claim', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          walletAddress: publicKey.toString(),
          questionId,
          answer: answer.toLowerCase().trim(),
          signature: Array.from(signature),
          timestamp: Date.now(),
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setClaimStatus('success');
      } else {
        if (result.error === 'Already claimed') {
          setClaimStatus('already_claimed');
        } else {
          setClaimStatus('error');
          setErrorMessage(result.error || 'Verification failed');
        }
      }
    } catch (err) {
      console.error('Claim error:', err);
      setClaimStatus('error');
      setErrorMessage('Failed to submit claim. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-doom-black text-terminal-green flex items-center justify-center p-4">
      <div className="container max-w-2xl">
        
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="text-glitch-blue hover:text-terminal-green transition-colors text-sm">
            ← RETURN TO SURFACE
          </Link>
          <GlitchText 
            text="THE JUDAS INTERFACE" 
            className="text-4xl md:text-6xl font-bold my-6 block"
          />
          <p className="text-lg text-blood-red">
            PROVE YOUR READERSHIP
          </p>
        </div>

        {/* Main Interface */}
        <div className="terminal-window">
          
          {/* Success State */}
          {claimStatus === 'success' && (
            <div className="text-center">
              <div className="text-terminal-green text-2xl font-bold mb-4 animate-pulse">
                ✓ VERIFICATION COMPLETE
              </div>
              <p className="text-lg mb-4">
                734 DOOM tokens have been transferred to your wallet.
              </p>
              <p className="text-sm opacity-70 mb-6">
                You are now part of the protocol. The frequency of collapse resonates within you.
              </p>
              <div className="space-y-4">
                <Link 
                  href="/bunker" 
                  className="block bg-void-purple/20 border border-void-purple p-4 rounded hover:bg-void-purple/30 transition-colors"
                >
                  <span className="text-void-purple font-bold">Enter the Bunker →</span>
                  <div className="text-xs opacity-70 mt-1">
                    Requires 666 DOOM for full access
                  </div>
                </Link>
                <Link 
                  href="/market" 
                  className="block bg-glitch-blue/20 border border-glitch-blue p-4 rounded hover:bg-glitch-blue/30 transition-colors"
                >
                  <span className="text-glitch-blue font-bold">View Market Data →</span>
                </Link>
              </div>
            </div>
          )}

          {/* Already Claimed State */}
          {claimStatus === 'already_claimed' && (
            <div className="text-center">
              <div className="text-warning-amber text-2xl font-bold mb-4">
                ⚠️ ALREADY VERIFIED
              </div>
              <p className="text-lg mb-4">
                This wallet has already claimed its 734 DOOM tokens.
              </p>
              <p className="text-sm opacity-70 mb-6">
                The protocol remembers. Each reader may only claim once.
              </p>
              <Link 
                href="/bunker" 
                className="inline-block bg-void-purple/20 border border-void-purple px-6 py-3 rounded hover:bg-void-purple/30 transition-colors"
              >
                <span className="text-void-purple font-bold">Proceed to Bunker →</span>
              </Link>
            </div>
          )}

          {/* Error State */}
          {claimStatus === 'error' && (
            <div className="text-center">
              <div className="text-blood-red text-2xl font-bold mb-4">
                ✗ VERIFICATION FAILED
              </div>
              <p className="text-lg mb-4 text-blood-red">
                {errorMessage}
              </p>
              <p className="text-sm opacity-70 mb-6">
                The void rejects false knowledge. Study harder, reader.
              </p>
              <button 
                onClick={() => setClaimStatus('idle')}
                className="bg-terminal-green/20 border border-terminal-green px-6 py-3 rounded hover:bg-terminal-green/30 transition-colors"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Main Interface */}
          {claimStatus === 'idle' && (
            <>
              {/* Instructions */}
              <div className="mb-8">
                <h2 className="text-xl font-bold text-warning-amber mb-4">
                  LITERARY VERIFICATION PROTOCOL
                </h2>
                <div className="text-sm space-y-2 opacity-80">
                  <p>• Connect your Solana wallet</p>
                  <p>• Answer questions about the source material</p>
                  <p>• Receive exactly 734 DOOM tokens upon verification</p>
                  <p>• One claim per wallet address</p>
                </div>
              </div>

              {/* Wallet Connection */}
              <div className="terminal-window mb-8">
                <h2 className="text-xl font-bold text-warning-amber mb-4">
                  WALLET AUTHENTICATION
                </h2>
                <p className="text-sm mb-4 opacity-80">
                  Connect your Solana wallet to proceed with verification.
                </p>
                {isMounted && (
                  <WalletMultiButton className="!bg-transparent !border-2 !border-terminal-green hover:!bg-terminal-green hover:!text-black !text-terminal-green !font-mono !px-6 !py-3 !rounded-none !transition-all !duration-300" />
                )}
              </div>

              {/* Connected Wallet Info */}
              {publicKey && (
                <div className="mb-6 p-4 bg-terminal-green/10 border border-terminal-green rounded">
                  <div className="text-sm">
                    <span className="opacity-70">Connected Wallet:</span>
                    <div className="font-mono text-xs mt-1 break-all">
                      {publicKey.toString()}
                    </div>
                  </div>

                  {/* Verification Quiz */}
                  <VerificationQuiz 
                    onSubmit={handleClaimSubmit}
                    loading={isLoading}
                  />
                </div>
              )}
            </>
          )}
        </div>

        {/* Warning Footer */}
        <div className="mt-8 text-center">
          <div className="terminal-window bg-blood-red/10 border-blood-red">
            <p className="text-blood-red font-bold text-sm mb-2">
              ⚠️ SECURITY NOTICE ⚠️
            </p>
            <p className="text-xs opacity-70">
              Never share your private keys. This interface only requires message signing, 
              never private key access. The protocol protects those who protect themselves.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
