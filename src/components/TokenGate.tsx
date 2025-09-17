'use client';

import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { getTokenBalance, formatTokenAmount } from '@/lib/token';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

interface TokenGateProps {
  threshold?: number;
  children: React.ReactNode;
}

export const TokenGate: React.FC<TokenGateProps> = ({ 
  threshold = 666, 
  children 
}) => {
  const { publicKey } = useWallet();
  const [balance, setBalance] = useState(0);
  const [hasAccess, setHasAccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const checkTokenBalance = async () => {
    if (!publicKey) return;

    setIsLoading(true);
    setError(null);

    try {
      const tokenBalance = await getTokenBalance(publicKey);
      setBalance(tokenBalance);
      setHasAccess(tokenBalance >= threshold);
    } catch (err) {
      console.error('Error checking token balance:', err);
      setError('Failed to check token balance');
      setBalance(0);
      setHasAccess(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (publicKey) {
      checkTokenBalance();
    } else {
      setBalance(0);
      setHasAccess(false);
    }
  }, [publicKey, threshold]);

  if (!isMounted || !publicKey) {
    return (
      <div className="bunker-door-locked min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-blood-red mb-4">
            ACCESS DENIED
          </h2>
          <p className="text-lg mb-6">
            Wallet connection required for bunker access.
          </p>
          <p className="text-sm opacity-70">
            Connect your Solana wallet to verify DOOM token holdings.
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="bunker-door-locked min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-spin">⟳</div>
          <h2 className="text-2xl font-bold text-warning-amber mb-4">
            VERIFYING ACCESS
          </h2>
          <p className="text-lg">
            Scanning blockchain for DOOM token balance...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bunker-door-locked min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-blood-red mb-4">
            VERIFICATION ERROR
          </h2>
          <p className="text-lg mb-6">
            {error}
          </p>
          <button 
            onClick={checkTokenBalance}
            className="bg-terminal-green/20 border border-terminal-green px-6 py-3 rounded hover:bg-terminal-green/30 transition-colors"
          >
            Retry Verification
          </button>
        </div>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="bunker-door-locked min-h-[400px] flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-4xl mb-4">🚫</div>
          <h2 className="text-2xl font-bold text-blood-red mb-4">
            INSUFFICIENT CLEARANCE
          </h2>
          
          <div className="bg-doom-black/50 p-4 border border-blood-red rounded mb-6">
            <div className="text-sm space-y-2">
              <div className="flex justify-between">
                <span>Required:</span>
                <span className="text-blood-red font-bold">{threshold.toLocaleString()} DOOM</span>
              </div>
              <div className="flex justify-between">
                <span>Your Balance:</span>
                <span className="text-warning-amber font-bold">{formatTokenAmount(balance)} DOOM</span>
              </div>
              <div className="flex justify-between">
                <span>Deficit:</span>
                <span className="text-blood-red font-bold">{formatTokenAmount(threshold - balance)} DOOM</span>
              </div>
            </div>
          </div>

          <p className="text-sm opacity-70 mb-6">
            The bunker remains sealed. Acquire more tokens or return to the surface.
          </p>

          <div className="space-y-3">
            <button 
              onClick={checkTokenBalance}
              className="w-full bg-terminal-green/20 border border-terminal-green px-4 py-2 rounded hover:bg-terminal-green/30 transition-colors"
            >
              Refresh Balance
            </button>
            
            <a 
              href="/the-judas-interface"
              className="block w-full bg-glitch-blue/20 border border-glitch-blue px-4 py-2 rounded hover:bg-glitch-blue/30 transition-colors"
            >
              Claim Your 734 DOOM
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Access Granted Header */}
      <div className="terminal-window bg-terminal-green/10 border-terminal-green mb-8">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-terminal-green font-bold">✓ ACCESS GRANTED</div>
            <div className="text-xs opacity-70">
              Balance: {balance.toLocaleString()} DOOM | Required: {threshold.toLocaleString()} DOOM
            </div>
          </div>
          <button 
            onClick={checkTokenBalance}
            className="text-xs bg-terminal-green/20 border border-terminal-green px-3 py-1 rounded hover:bg-terminal-green/30 transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Protected Content */}
      {children}
    </div>
  );
};
