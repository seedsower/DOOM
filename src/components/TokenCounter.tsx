'use client';

import React, { useState, useEffect } from 'react';

interface TokenStats {
  totalSupply: number;
  circulatingSupply: number;
  burned: number;
  claimed: number;
  holders: number;
  claimsProcessed: number;
  distributionProgress: number;
  mintAddress: string;
}

export const TokenCounter: React.FC = () => {
  const [stats, setStats] = useState<TokenStats>({
    totalSupply: 37000000,
    circulatingSupply: 36999266,
    burned: 734,
    claimed: 734,
    holders: 200,
    claimsProcessed: 734,
    distributionProgress: 2.0,
    mintAddress: '5se2cVMggFyibMqsJycmqH4N6dUY6z8iqLB8fjxrgqnh'
  });

  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // Simulate real-time updates
    const interval = setInterval(() => {
      setIsAnimating(true);
      
      setStats(prev => {
        const newClaimed = prev.claimed + (Math.random() < 0.3 ? 734 : 0);
        const newHolders = Math.floor(newClaimed / 734);
        const newBurned = prev.burned + (Math.random() < 0.1 ? Math.floor(Math.random() * 100) : 0);
        
        return {
          ...prev,
          claimed: Math.min(newClaimed, prev.totalSupply),
          holders: newHolders,
          burned: newBurned,
          circulatingSupply: prev.totalSupply - newBurned,
        };
      });

      setTimeout(() => setIsAnimating(false), 500);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  const getPercentage = (value: number, total: number) => {
    return ((value / total) * 100).toFixed(2);
  };

  return (
    <div className="terminal-window max-w-2xl mx-auto">
      <h3 className="text-xl font-bold text-warning-amber mb-4 text-center">
        DOOM PROTOCOL METRICS
      </h3>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
        
        {/* Total Supply */}
        <div className="text-center">
          <div className="text-terminal-green font-mono text-lg">
            {formatNumber(stats.totalSupply)}
          </div>
          <div className="text-xs opacity-70">&ldquo;The protocol remembers what we choose to forget&rdquo;</div>
        </div>

        {/* Circulating Supply */}
        <div className="text-center">
          <div className={`text-glitch-blue font-mono text-lg ${isAnimating ? 'animate-pulse' : ''}`}>
            {formatNumber(stats.circulatingSupply)}
          </div>
          <div className="text-xs opacity-70">CIRCULATING</div>
        </div>

        {/* Burned */}
        <div className="text-center">
          <div className={`text-blood-red font-mono text-lg ${isAnimating ? 'animate-pulse' : ''}`}>
            {formatNumber(stats.burned)}
          </div>
          <div className="text-xs opacity-70">BURNED</div>
        </div>

        {/* Claimed */}
        <div className="text-center">
          <div className={`text-warning-amber font-mono text-lg ${isAnimating ? 'animate-pulse' : ''}`}>
            {formatNumber(stats.claimed)}
          </div>
          <div className="text-xs opacity-70">CLAIMED</div>
        </div>

        {/* Holders */}
        <div className="text-center">
          <div className={`text-void-purple font-mono text-lg ${isAnimating ? 'animate-pulse' : ''}`}>
            {formatNumber(stats.holders)}
          </div>
          <div className="text-xs opacity-70">HOLDERS</div>
        </div>

        {/* Progress */}
        <div className="text-center">
          <div className="text-terminal-green font-mono text-lg">
            {getPercentage(stats.claimed, stats.totalSupply)}%
          </div>
          <div className="text-xs opacity-70">DISTRIBUTED</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-4">
        <div className="bg-doom-black border border-terminal-green rounded h-2 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-terminal-green to-glitch-blue transition-all duration-1000"
            style={{ width: `${getPercentage(stats.claimed, stats.totalSupply)}%` }}
          />
        </div>
        <div className="text-xs text-center mt-1 opacity-70">
          UNIT 734 DISTRIBUTION PROGRESS
        </div>
      </div>

      {/* Unit 734 Reference */}
      <div className="mt-4 text-center">
        <div className="text-xs opacity-60">
          Each verified reader receives exactly <span className="text-warning-amber font-bold">734</span> tokens
        </div>
        <div className="text-xs opacity-40 mt-1">
          "The frequency of collapse, the wavelength of doom"
        </div>
      </div>
    </div>
  );
};
