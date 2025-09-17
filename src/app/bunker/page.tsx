'use client';

import React from 'react';
import Link from 'next/link';
import { TokenGate } from '@/components/TokenGate';
import { GlitchText } from '@/components/GlitchText';

export default function BunkerPage() {
  return (
    <div className="min-h-screen bg-doom-black text-terminal-green p-4">
      <div className="container mx-auto max-w-4xl">
        
        {/* Header */}
        <header className="text-center mb-8">
          <Link href="/" className="text-glitch-blue hover:text-terminal-green transition-colors text-sm">
            ← RETURN TO SURFACE
          </Link>
          <GlitchText 
            text="THE BUNKER" 
            className="text-4xl md:text-6xl font-bold my-6 block"
          />
          <p className="text-lg text-void-purple">
            TOKEN-GATED SANCTUARY
          </p>
        </header>

        {/* Token Gate */}
        <TokenGate threshold={666}>
          <div className="space-y-8">
            
            {/* Welcome Message */}
            <section className="terminal-window border-void-purple">
              <h2 className="text-2xl font-bold text-void-purple mb-4">
                WELCOME TO THE BUNKER
              </h2>
              <p className="text-sm leading-relaxed opacity-80">
                You have proven your commitment to the protocol. With 666+ DOOM tokens, 
                you have earned access to the deeper layers of the collapse. 
                Here, the signal is stronger, the truth more concentrated.
              </p>
            </section>

            {/* Signal Log */}
            <section className="terminal-window">
              <h3 className="text-xl font-bold text-warning-amber mb-4">
                📡 SIGNAL LOG
              </h3>
              <div className="space-y-4 text-sm">
                <div className="bg-doom-black/50 p-3 border-l-2 border-terminal-green">
                  <div className="text-xs text-glitch-blue mb-1">2024.09.16 - 16:42:33</div>
                  <div>Unit 734 frequency detected in market oscillations. The pattern holds.</div>
                </div>
                <div className="bg-doom-black/50 p-3 border-l-2 border-warning-amber">
                  <div className="text-xs text-glitch-blue mb-1">2024.09.15 - 03:17:44</div>
                  <div>Ciba-Geigy documents leaked. Corporate archaeology reveals deeper structures.</div>
                </div>
                <div className="bg-doom-black/50 p-3 border-l-2 border-blood-red">
                  <div className="text-xs text-glitch-blue mb-1">2024.09.14 - 23:59:59</div>
                  <div>Ghost transmission received: &ldquo;The books remember what we forget.&rdquo;</div>
                </div>
                <div className="bg-doom-black/50 p-3 border-l-2 border-void-purple">
                  <div className="text-xs text-glitch-blue mb-1">2024.09.13 - 12:00:00</div>
                  <div>Protocol initialization complete. 37 million tokens deployed. The countdown begins.</div>
                </div>
              </div>
            </section>

            {/* Ciba-Geigy Dossier */}
            <section className="terminal-window border-warning-amber">
              <h3 className="text-xl font-bold text-warning-amber mb-4">
                📁 CIBA-GEIGY DOSSIER
              </h3>
              <div className="text-sm space-y-3">
                <p className="text-warning-amber font-bold">
                  [CLASSIFIED - BUNKER ACCESS REQUIRED]
                </p>
                <p>
                  Corporate Entity: Ciba-Geigy AG (1970-1996)<br/>
                  Classification: Pharmaceutical/Chemical Conglomerate<br/>
                  Status: Merged into Novartis, legacy systems still active
                </p>
                <div className="bg-warning-amber/10 p-3 border border-warning-amber rounded">
                  <p className="text-xs font-mono">
                    DOCUMENT FRAGMENT 734-A:<br/>
                    "The frequency at which glass shatters is also the frequency 
                    at which corporate structures become transparent. Unit 734 
                    represents both destruction and revelation."
                  </p>
                </div>
                <p className="text-xs opacity-70">
                  Additional documents require higher clearance levels. 
                  Accumulate more DOOM tokens for deeper access.
                </p>
              </div>
            </section>

            {/* Ghost of Fools Crow */}
            <section className="terminal-window border-glitch-blue">
              <h3 className="text-xl font-bold text-glitch-blue mb-4">
                👻 GHOST OF FOOLS CROW
              </h3>
              <div className="text-sm space-y-3">
                <p className="text-glitch-blue font-bold">
                  [ENCRYPTED TRANSMISSION - DECRYPTION IN PROGRESS]
                </p>
                <div className="bg-glitch-blue/10 p-4 border border-glitch-blue rounded font-mono text-xs">
                  <div className="mb-2 opacity-60">SIGNAL STRENGTH: 73.4%</div>
                  <div className="space-y-1">
                    <div>01001000 01100101 01101100 01110000</div>
                    <div className="text-terminal-green">Help</div>
                    <div className="mt-2">01010100 01101000 01100101 00100000</div>
                    <div className="text-terminal-green">The books remember what we forget</div>
                    <div className="mt-2">01000101 01110110 01100101 01110010</div>
                    <div>Classified: &ldquo;Operation Paperclip&rdquo; archives digitized. Literary resistance networks mapped.</div>
                  </div>
                </div>
                <p className="text-xs opacity-70">
                  Transmission incomplete. The ghost speaks in fragments, 
                  binary whispers from beyond the veil of corporate collapse.
                </p>
              </div>
            </section>

            {/* Encrypted Chat */}
            <section className="terminal-window border-blood-red">
              <h3 className="text-xl font-bold text-blood-red mb-4">
                💬 ENCRYPTED FORUM
              </h3>
              <div className="text-sm space-y-3">
                <p className="text-blood-red font-bold">
                  [FEATURE UNDER DEVELOPMENT]
                </p>
                <p>
                  End-to-end encrypted communication for verified DOOM holders. 
                  Discuss the collapse, share signals, coordinate resistance.
                </p>
                <div className="bg-blood-red/10 p-3 border border-blood-red rounded">
                  <p className="text-xs">
                    🔒 Zero-knowledge proof authentication<br/>
                    🔒 Message burning after 734 seconds<br/>
                    🔒 Quantum-resistant encryption protocols<br/>
                    🔒 Ghost mode for anonymous posting
                  </p>
                </div>
                <p className="text-xs opacity-70">
                  Coming soon. The protocol evolves, the bunker deepens.
                </p>
              </div>
            </section>

            {/* Token Requirements */}
            <section className="terminal-window bg-void-purple/10 border-void-purple">
              <h3 className="text-xl font-bold text-void-purple mb-4">
                🔐 ACCESS LEVELS
              </h3>
              <div className="text-sm space-y-2">
                <div className="flex justify-between">
                  <span>Basic Bunker Access:</span>
                  <span className="text-void-purple font-bold">666 DOOM</span>
                </div>
                <div className="flex justify-between opacity-60">
                  <span>Archive Deep Dive:</span>
                  <span>1,337 DOOM</span>
                </div>
                <div className="flex justify-between opacity-60">
                  <span>Ghost Communication:</span>
                  <span>2,468 DOOM</span>
                </div>
                <div className="flex justify-between opacity-60">
                  <span>Protocol Core Access:</span>
                  <span>7,340 DOOM</span>
                </div>
                <div className="flex justify-between opacity-60">
                  <span>Unit 734 Frequency:</span>
                  <span>37,000 DOOM</span>
                </div>
              </div>
            </section>
          </div>
        </TokenGate>
      </div>
    </div>
  );
}
