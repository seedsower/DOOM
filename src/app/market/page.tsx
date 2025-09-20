'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { GlitchText } from '@/components/GlitchText';
import { PoolManager } from '@/components/PoolManager';

interface MarketData {
  price: number;
  change24h: number;
  volume24h: number;
  marketCap: number;
  totalSupply: number;
  circulatingSupply: number;
  burned: number;
  holders: number;
  liquidity: {
    doom: number;
    usdc: number;
  };
}

interface PricePoint {
  timestamp: number;
  price: number;
}

export default function MarketPage() {
  const [marketData, setMarketData] = useState<MarketData>({
    price: 0.00001337,
    change24h: -66.6,
    volume24h: 13370,
    marketCap: 494580,
    totalSupply: 37000000,
    circulatingSupply: 36999266,
    burned: 734,
    holders: 200,
    liquidity: {
      doom: 10000000,
      usdc: 100
    }
  });

  const [priceHistory, setPriceHistory] = useState<PricePoint[]>([]);
  const [isLive, setIsLive] = useState(true);

  useEffect(() => {
    // Initialize price history
    const now = Date.now();
    const history: PricePoint[] = [];
    for (let i = 23; i >= 0; i--) {
      history.push({
        timestamp: now - (i * 60 * 60 * 1000), // Hourly data for 24h
        price: marketData.price * (1 + (Math.random() - 0.5) * 0.2)
      });
    }
    setPriceHistory(history);

    // Simulate real-time updates
    const interval = setInterval(() => {
      if (isLive) {
        setMarketData(prev => {
          const newPrice = prev.price * (1 + (Math.random() - 0.5) * 0.05);
          
          // Update price history
          setPriceHistory(prevHistory => [...prevHistory.slice(1), {
            timestamp: Date.now(),
            price: newPrice
          }]);
          
          return {
            ...prev,
            price: newPrice,
            change24h: prev.change24h + (Math.random() - 0.5) * 2,
            volume24h: prev.volume24h * (1 + (Math.random() - 0.5) * 0.05),
            marketCap: newPrice * prev.circulatingSupply,
            burned: prev.burned + (Math.random() < 0.1 ? Math.floor(Math.random() * 100) : 0),
            holders: prev.holders + (Math.random() < 0.3 ? 1 : 0),
          };
        });
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [isLive, marketData.price]);

  const formatPrice = (price: number) => {
    if (price < 0.001) {
      return price.toFixed(8);
    }
    return price.toFixed(6);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(2) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(2) + 'K';
    }
    return num.toFixed(0);
  };

  const formatPercent = (percent: number) => {
    const sign = percent >= 0 ? '+' : '';
    return `${sign}${percent.toFixed(2)}%`;
  };

  return (
    <div className="min-h-screen bg-doom-black text-terminal-green p-4">
      <div className="container mx-auto max-w-6xl">
        
        {/* Header */}
        <header className="text-center mb-8">
          <Link href="/" className="text-glitch-blue hover:text-terminal-green transition-colors text-sm">
            ← RETURN TO SURFACE
          </Link>
          <GlitchText 
            text="MARKET DYNAMICS" 
            className="text-4xl md:text-6xl font-bold my-6 block"
          />
          <p className="text-lg text-glitch-blue">
            WATCH THE COLLAPSE IN REAL-TIME
          </p>
        </header>

        {/* Live Status */}
        <div className="text-center mb-8">
          <button
            onClick={() => setIsLive(!isLive)}
            className={`px-4 py-2 rounded border transition-colors ${
              isLive 
                ? 'border-terminal-green bg-terminal-green/20 text-terminal-green' 
                : 'border-blood-red bg-blood-red/20 text-blood-red'
            }`}
          >
            {isLive ? '🟢 LIVE DATA' : '🔴 PAUSED'}
          </button>
        </div>

        {/* Price Overview */}
        <section className="terminal-window mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Current Price */}
            <div className="text-center">
              <div className="text-3xl font-bold text-terminal-green mb-2">
                ${formatPrice(marketData.price)}
              </div>
              <div className={`text-lg font-bold ${
                marketData.change24h >= 0 ? 'text-terminal-green' : 'text-blood-red'
              }`}>
                {formatPercent(marketData.change24h)}
              </div>
              <div className="text-xs opacity-70">24H CHANGE</div>
            </div>

            {/* Market Cap */}
            <div className="text-center">
              <div className="text-2xl font-bold text-glitch-blue mb-2">
                ${formatNumber(marketData.marketCap)}
              </div>
              <div className="text-xs opacity-70">MARKET CAP</div>
            </div>

            {/* Volume */}
            <div className="text-center">
              <div className="text-2xl font-bold text-warning-amber mb-2">
                ${formatNumber(marketData.volume24h)}
              </div>
              <div className="text-xs opacity-70">24H VOLUME</div>
            </div>
          </div>
        </section>

        {/* Detailed Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          
          {/* Token Metrics */}
          <section className="terminal-window">
            <h3 className="text-xl font-bold text-warning-amber mb-4">
              TOKEN METRICS
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span>Total Supply:</span>
                <span className="font-mono">{formatNumber(marketData.totalSupply)} DOOM</span>
              </div>
              <div className="flex justify-between">
                <span>Circulating Supply:</span>
                <span className="font-mono">{formatNumber(marketData.circulatingSupply)} DOOM</span>
              </div>
              <div className="flex justify-between">
                <span>Burned:</span>
                <span className="font-mono text-blood-red">{formatNumber(marketData.burned)} DOOM</span>
              </div>
              <div className="flex justify-between">
                <span>Holders:</span>
                <span className="font-mono">{formatNumber(marketData.holders)}</span>
              </div>
              <div className="flex justify-between">
                <span>Unit 734 Claims:</span>
                <span className="font-mono text-void-purple">{Math.floor(marketData.holders * 734).toLocaleString()}</span>
              </div>
            </div>
          </section>

          {/* Liquidity Pool */}
          <section className="terminal-window">
            <h3 className="text-xl font-bold text-warning-amber mb-4">
              LIQUIDITY POOL
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span>DOOM Reserve:</span>
                <span className="font-mono">{formatNumber(marketData.liquidity.doom)} DOOM</span>
              </div>
              <div className="flex justify-between">
                <span>USDC Reserve:</span>
                <span className="font-mono">${formatNumber(marketData.liquidity.usdc)}</span>
              </div>
              <div className="flex justify-between">
                <span>LP Tokens:</span>
                <span className="font-mono text-blood-red">BURNED 🔥</span>
              </div>
              <div className="bg-blood-red/10 p-3 border border-blood-red rounded mt-4">
                <p className="text-xs text-blood-red font-bold mb-1">
                  PERMANENT LIQUIDITY
                </p>
                <p className="text-xs opacity-70">
                  LP tokens have been permanently burned. Liquidity cannot be removed. 
                  This is commitment to the void.
                </p>
              </div>
            </div>
          </section>
        </div>

        {/* Price Chart Placeholder */}
        <section className="terminal-window mb-8">
          <h3 className="text-xl font-bold text-warning-amber mb-4">
            PRICE CHART (24H)
          </h3>
          <div className="bg-doom-black/50 p-4 border border-terminal-green rounded min-h-[200px] flex items-center justify-center">
            <div className="text-center">
              <div className="text-4xl mb-4">📈</div>
              <p className="text-lg text-terminal-green mb-2">
                CHART VISUALIZATION
              </p>
              <p className="text-sm opacity-70">
                Real-time price chart integration coming soon.<br/>
                The collapse is best experienced in real-time.
              </p>
              <div className="mt-4 text-xs font-mono">
                Latest: ${formatPrice(marketData.price)} | 
                24h High: ${formatPrice(marketData.price * 1.2)} | 
                24h Low: ${formatPrice(marketData.price * 0.8)}
              </div>
            </div>
          </div>
        </section>

        {/* Pool Management */}
        <PoolManager />

        {/* Trading Links */}
        <section className="terminal-window">
          <h3 className="text-xl font-bold text-warning-amber mb-4">
            TRADING VENUES
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            
            <div className="bg-doom-black/50 p-4 border border-glitch-blue rounded">
              <h4 className="font-bold text-glitch-blue mb-2">Raydium</h4>
              <p className="text-xs opacity-70 mb-3">
                Primary DEX for DOOM/USDC trading
              </p>
              <button className="w-full bg-glitch-blue/20 border border-glitch-blue px-3 py-2 rounded hover:bg-glitch-blue/30 transition-colors">
                Trade on Raydium
              </button>
            </div>

            <div className="bg-doom-black/50 p-4 border border-void-purple rounded">
              <h4 className="font-bold text-void-purple mb-2">Jupiter</h4>
              <p className="text-xs opacity-70 mb-3">
                Best price aggregation across Solana
              </p>
              <button className="w-full bg-void-purple/20 border border-void-purple px-3 py-2 rounded hover:bg-void-purple/30 transition-colors">
                Trade on Jupiter
              </button>
            </div>

            <div className="bg-doom-black/50 p-4 border border-warning-amber rounded opacity-60">
              <h4 className="font-bold text-warning-amber mb-2">Orca</h4>
              <p className="text-xs opacity-70 mb-3">
                Coming soon - Additional liquidity
              </p>
              <button className="w-full bg-warning-amber/20 border border-warning-amber px-3 py-2 rounded cursor-not-allowed">
                Coming Soon
              </button>
            </div>
          </div>
        </section>

        {/* Warning */}
        <div className="mt-8 text-center">
          <div className="terminal-window bg-blood-red/10 border-blood-red max-w-2xl mx-auto">
            <p className="text-blood-red font-bold text-lg mb-2">
              ⚠️ TRADING WARNING ⚠️
            </p>
            <p className="text-sm opacity-80">
              DOOM tokens have no inherent value and serve primarily as performance art. 
              Trading is purely speculative. The protocol acknowledges the meaninglessness 
              of all financial instruments. Trade at your own existential risk.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
