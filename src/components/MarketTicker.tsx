'use client';

import React, { useState, useEffect } from 'react';

interface MarketData {
  price: number;
  change24h: number;
  volume: number;
  marketCap: number;
  supply: number;
  burned: number;
}

export const MarketTicker: React.FC = () => {
  const [marketData, setMarketData] = useState<MarketData>({
    price: 0.00001337,
    change24h: -66.6,
    volume: 13370,
    marketCap: 494580,
    supply: 37000000,
    burned: 0,
  });

  const [currentTime, setCurrentTime] = useState('');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    setCurrentTime(new Date().toLocaleTimeString());
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    // Simulate real-time price updates
    const interval = setInterval(() => {
      setMarketData(prev => ({
        ...prev,
        price: prev.price * (1 + (Math.random() - 0.5) * 0.1),
        change24h: prev.change24h + (Math.random() - 0.5) * 2,
        volume: prev.volume * (1 + (Math.random() - 0.5) * 0.05),
      }));
      setCurrentTime(new Date().toLocaleTimeString());
    }, 3000);

    return () => clearInterval(interval);
  }, [isMounted]);

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

  const tickerText = `$DOOM: $${formatPrice(marketData.price)} | 24h: ${marketData.change24h > 0 ? '+' : ''}${marketData.change24h.toFixed(2)}% | VOL: $${formatNumber(marketData.volume)} | MCAP: $${formatNumber(marketData.marketCap)} | SUPPLY: ${formatNumber(marketData.supply)} | BURNED: ${formatNumber(marketData.burned)} | TIME: ${currentTime} | THE VOID CONSUMES ALL | EVERY BOOK IS A KEY | UNIT 734 APPROACHES |`;

  if (!isMounted) {
    return (
      <div className="market-ticker bg-black border-t border-b border-terminal-green py-2 relative overflow-hidden">
        <div className="ticker-content text-terminal-green font-mono text-sm whitespace-nowrap">
          $DOOM: Loading... | THE VOID CONSUMES ALL | EVERY BOOK IS A KEY | UNIT 734 APPROACHES |
        </div>
      </div>
    );
  }

  return (
    <div className="market-ticker bg-black border-t border-b border-terminal-green py-2 relative overflow-hidden">
      <div className="ticker-content text-terminal-green font-mono text-sm whitespace-nowrap">
        {tickerText.repeat(3)}
      </div>
    </div>
  );
};
