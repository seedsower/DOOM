'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { GlitchText } from '@/components/GlitchText';
import { TokenCounter } from '@/components/TokenCounter';

export const DoomscrollInterface: React.FC = () => {
  const { publicKey } = useWallet();
  const [currentSection, setCurrentSection] = useState(0);
  const [isTyping, setIsTyping] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const manifestoSections = [
    {
      title: "THE PROTOCOL OF COLLAPSE",
      content: "In the beginning was the Word, and the Word was DOOM. Not the game, not the metal band, but the inexorable march toward entropy that governs all systems, all markets, all meaning."
    },
    {
      title: "EVERY BOOK IS A KEY",
      content: "Literature is the original blockchain - immutable records of human consciousness, distributed across time and space. Each reader becomes a node in the network, validating truth through interpretation."
    },
    {
      title: "THE TOKENOMICS OF MEANINGLESSNESS", 
      content: "37 million tokens. Why 37? Because it's prime, like suffering. Because it's the temperature at which the human body begins to fail. Because Unit 734 demands it."
    },
    {
      title: "UNIT 734 APPROACHES",
      content: "Every verified reader receives exactly 734 tokens. Not 735. Not 733. The number carries weight beyond mathematics - it is the frequency of collapse, the wavelength of doom."
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSection((prev) => (prev + 1) % manifestoSections.length);
      setIsTyping(true);
      setTimeout(() => setIsTyping(false), 3000);
    }, 8000);

    return () => clearInterval(interval);
  }, [manifestoSections.length]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <header className="text-center mb-12">
        <GlitchText 
          text="DOOMSCROLL" 
          className="text-6xl md:text-8xl font-bold mb-4"
        />
        <p className="text-xl md:text-2xl text-glitch-blue mb-8">
          THE PROTOCOL OF COLLAPSE
        </p>
        
        {/* Token Counter */}
        <TokenCounter />
        
        {/* Wallet Connection */}
        <div className="mt-8">
          {isMounted && (
            <WalletMultiButton className="!bg-transparent !border-2 !border-terminal-green hover:!bg-terminal-green hover:!text-black !text-terminal-green !font-mono !px-6 !py-3 !rounded-none !transition-all !duration-300 glitch-hover" />
          )}
        </div>
      </header>

      {/* Manifesto Section */}
      <section className="terminal-window mb-12">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-warning-amber mb-4">
            {manifestoSections[currentSection].title}
          </h2>
          <p className={`text-lg leading-relaxed ${isTyping ? 'typing' : ''}`}>
            {manifestoSections[currentSection].content}
          </p>
        </div>
      </section>

      {/* Navigation Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        
        {/* Protocol Info */}
        <Link href="/protocol" className="terminal-window hover:shadow-lg hover:shadow-terminal-green/20 transition-all duration-300 group">
          <h3 className="text-xl font-bold text-warning-amber mb-3 group-hover:animate-glitch">
            THE PROTOCOL
          </h3>
          <p className="text-sm opacity-80">
            Dive deeper into the tokenomics of meaninglessness. Understand the architecture of collapse.
          </p>
        </Link>

        {/* Claim Portal */}
        <Link href="/the-judas-interface" className="terminal-window hover:shadow-lg hover:shadow-blood-red/20 transition-all duration-300 group">
          <h3 className="text-xl font-bold text-blood-red mb-3 group-hover:animate-glitch">
            PROVE YOUR READERSHIP
          </h3>
          <p className="text-sm opacity-80">
            Every book is a key. Demonstrate your literary credentials to claim your 734 tokens.
          </p>
        </Link>

        {/* Bunker Access */}
        <Link href="/bunker" className="terminal-window hover:shadow-lg hover:shadow-void-purple/20 transition-all duration-300 group">
          <h3 className="text-xl font-bold text-void-purple mb-3 group-hover:animate-glitch">
            THE BUNKER
          </h3>
          <p className="text-sm opacity-80">
            Token-gated content for holders. Requires 666 $DOOM for access. The signal awaits.
          </p>
        </Link>

        {/* Market Data */}
        <Link href="/market" className="terminal-window hover:shadow-lg hover:shadow-glitch-blue/20 transition-all duration-300 group">
          <h3 className="text-xl font-bold text-glitch-blue mb-3 group-hover:animate-glitch">
            MARKET DYNAMICS
          </h3>
          <p className="text-sm opacity-80">
            Real-time $DOOM metrics. Watch the collapse in real-time. Liquidity is an illusion.
          </p>
        </Link>

        {/* Ghost of Fools Crow */}
        <div className="terminal-window opacity-60">
          <h3 className="text-xl font-bold text-terminal-green mb-3">
            GHOST OF FOOLS CROW
          </h3>
          <p className="text-sm opacity-60">
            [ENCRYPTED] Signal strength insufficient. Acquire more tokens to decrypt this transmission.
          </p>
        </div>

        {/* Ciba-Geigy Dossier */}
        <div className="terminal-window opacity-60">
          <h3 className="text-xl font-bold text-terminal-green mb-3">
            CIBA-GEIGY DOSSIER
          </h3>
          <p className="text-sm opacity-60">
            [CLASSIFIED] Corporate archaeology requires clearance level 666. Access denied.
          </p>
        </div>
      </section>

      {/* Warning Footer */}
      <footer className="text-center">
        <div className="terminal-window bg-blood-red/10 border-blood-red">
          <p className="text-blood-red font-bold text-lg mb-2">
            ⚠️ WARNING ⚠️
          </p>
          <p className="text-sm">
            This is not financial advice. This is performance art. This is social commentary. 
            This is a warning disguised as an invitation. The void stares back.
          </p>
        </div>
      </footer>
    </div>
  );
};
