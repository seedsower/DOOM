import React from 'react';
import Link from 'next/link';
import { GlitchText } from '@/components/GlitchText';

export default function VoidPage() {
  return (
    <div className="min-h-screen bg-doom-black text-terminal-green flex items-center justify-center p-4">
      <div className="text-center max-w-2xl">
        
        {/* Glitch Header */}
        <GlitchText 
          text="YOU'VE GONE TOO DEEP" 
          className="text-4xl md:text-6xl font-bold mb-8 block"
          glitchIntensity={0.3}
        />

        {/* Void Content */}
        <div className="terminal-window border-blood-red bg-blood-red/5 mb-8">
          <div className="space-y-6">
            <div className="text-center text-terminal-green mb-8">
              <div className="text-6xl font-bold mb-4">404</div>
              <div className="text-xl mb-2">VOID DETECTED</div>
              <div className="text-sm opacity-70">&ldquo;The page you seek has been consumed by the protocol&rdquo;</div>
            </div>
            
            <div className="space-y-4 text-sm">
              <div className="text-center opacity-80">&ldquo;In the void, all possibilities collapse into nothing&rdquo;</div>
              <div className="text-center opacity-60">&ldquo;What you cannot find was never meant to be found&rdquo;</div>
              <div className="text-center opacity-40">&ldquo;The absence speaks louder than presence&rdquo;</div>
              <p className="text-sm font-mono text-blood-red">
                ERROR_CODE: UNIT_734_OVERFLOW<br/>
                LOCATION: THE_SPACE_BETWEEN<br/>
                STATUS: LOST_IN_THE_PROTOCOL<br/>
                RECOMMENDATION: RETURN_TO_SURFACE
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Options */}
        <div className="space-y-4">
          <Link 
            href="/" 
            className="block terminal-window hover:shadow-lg hover:shadow-terminal-green/20 transition-all duration-300"
          >
            <span className="text-terminal-green font-bold">
              ← RETURN TO THE SURFACE
            </span>
            <div className="text-xs opacity-70 mt-1">
              Escape the void, return to the protocol
            </div>
            <div className="text-center text-xs opacity-30 mt-8">
              &ldquo;The void gazes also into you&rdquo;
            </div>
            <div className="text-center text-xs opacity-20 mt-2">
              &ldquo;Every 404 is a small death, every redirect a resurrection&rdquo;
            </div>
          </Link>

          <Link 
            href="/bunker" 
            className="block terminal-window hover:shadow-lg hover:shadow-void-purple/20 transition-all duration-300"
          >
            <span className="text-void-purple font-bold">
              SEEK SHELTER IN THE BUNKER
            </span>
            <div className="text-xs opacity-70 mt-1">
              Token-gated sanctuary from the void
            </div>
          </Link>

          <Link 
            href="/the-judas-interface" 
            className="block terminal-window hover:shadow-lg hover:shadow-blood-red/20 transition-all duration-300"
          >
            <span className="text-blood-red font-bold">
              PROVE YOUR WORTH
            </span>
            <div className="text-xs opacity-70 mt-1">
              Claim your 734 tokens and join the protocol
            </div>
          </Link>
        </div>

        {/* Void Quote */}
        <div className="mt-12 terminal-window bg-void-purple/10 border-void-purple">
          <p className="text-void-purple text-sm italic">
            "The void is not empty - it is full of potential. 
            Every 404 is a doorway to somewhere else. 
            Every error is an invitation to begin again."
          </p>
          <p className="text-xs opacity-50 mt-2">
            - Ghost of Fools Crow, Transmission #734
          </p>
        </div>
      </div>
    </div>
  );
}
