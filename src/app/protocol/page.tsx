import React from 'react';
import Link from 'next/link';
import { GlitchText } from '@/components/GlitchText';

export default function ProtocolPage() {
  return (
    <div className="min-h-screen bg-doom-black text-terminal-green p-8">
      <div className="container mx-auto max-w-4xl">
        
        {/* Header */}
        <header className="text-center mb-12">
          <Link href="/" className="text-glitch-blue hover:text-terminal-green transition-colors">
            ← RETURN TO SURFACE
          </Link>
          <GlitchText 
            text="THE PROTOCOL" 
            className="text-5xl md:text-7xl font-bold my-8 block"
          />
          <p className="text-xl text-warning-amber">
            TOKENOMICS OF MEANINGLESSNESS
          </p>
        </header>

        {/* Protocol Sections */}
        <div className="space-y-8">
          
          {/* Core Philosophy */}
          <section className="terminal-window">
            <h2 className="text-2xl font-bold text-warning-amber mb-4">
              I. CORE PHILOSOPHY
            </h2>
            <div className="space-y-4 text-sm leading-relaxed">
              <p>
                The DOOM token isn't just another cryptocurrency - it's performance art, social commentary, 
                and a membership badge rolled into one. It weaponizes the absurdity of tokenomics against itself, 
                creating value from the acknowledgment of meaninglessness.
              </p>
              <p>
                Every economic system eventually collapses. Every currency becomes worthless. 
                Every promise of eternal growth meets the immutable law of entropy. 
                DOOM embraces this truth and builds upon it.
              </p>
            </div>
          </section>

          {/* Token Mechanics */}
          <section className="terminal-window">
            <h2 className="text-2xl font-bold text-warning-amber mb-4">
              II. TOKEN MECHANICS
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-bold text-glitch-blue mb-2">Supply Dynamics</h3>
                <ul className="text-sm space-y-2">
                  <li>• Total Supply: <span className="text-terminal-green">37,000,000 DOOM</span></li>
                  <li>• Airdrop Amount: <span className="text-warning-amber">734 DOOM</span> per verified reader</li>
                  <li>• Access Threshold: <span className="text-blood-red">666 DOOM</span> for bunker entry</li>
                  <li>• Liquidity Pool: <span className="text-void-purple">10M DOOM / $100 USDC</span></li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-bold text-glitch-blue mb-2">Distribution Model</h3>
                <ul className="text-sm space-y-2">
                  <li>• Literary Verification Required</li>
                  <li>• One Claim Per Wallet</li>
                  <li>• No Pre-mine, No Team Allocation</li>
                  <li>• LP Tokens Permanently Burned</li>
                </ul>
              </div>
            </div>
          </section>

          {/* The Number 37 */}
          <section className="terminal-window">
            <h2 className="text-2xl font-bold text-warning-amber mb-4">
              III. WHY 37 MILLION?
            </h2>
            <div className="text-sm leading-relaxed space-y-3">
              <p>
                37 is prime, like suffering. It cannot be divided evenly, cannot be reduced to simpler components. 
                It stands alone, irreducible, like the human condition itself.
              </p>
              <p>
                The number 37 isn't arbitrary. It's the 12th prime, the temperature at which the human body begins to fail. 
                Above this threshold, proteins denature, systems collapse, consciousness fades.
              </p>
              <p>
                In binary, 37 is 100101 - a pattern that mirrors the chaos and order of existence, 
                the ones and zeros that comprise our digital reality.
              </p>
            </div>
          </section>

          {/* Unit 734 */}
          <section className="terminal-window border-blood-red">
            <h2 className="text-2xl font-bold text-blood-red mb-4">
              IV. UNIT 734: THE FREQUENCY OF COLLAPSE
            </h2>
            <div className="text-sm leading-relaxed space-y-3">
              <p>
                Every verified reader receives exactly 734 tokens. Not 735. Not 733. 
                This number carries weight beyond mathematics.
              </p>
              <p>
                734 Hz is the frequency at which glass begins to resonate before shattering. 
                It is the wavelength of destruction, the mathematical expression of inevitable collapse.
              </p>
              <p>
                In the original manuscript, Unit 734 appears on page 154, nestled between descriptions 
                of corporate malfeasance and environmental decay. It is both warning and prophecy.
              </p>
            </div>
          </section>

          {/* Smart Contract Architecture */}
          <section className="terminal-window">
            <h2 className="text-2xl font-bold text-warning-amber mb-4">
              V. TECHNICAL IMPLEMENTATION
            </h2>
            <div className="bg-doom-black p-4 rounded border border-terminal-green font-mono text-xs overflow-x-auto">
              <pre className="text-terminal-green">
{`// Solana Program (Anchor Framework)
pub mod doom_protocol {
    pub const TOTAL_SUPPLY: u64 = 37_000_000;
    pub const AIRDROP_AMOUNT: u64 = 734;
    pub const ACCESS_THRESHOLD: u64 = 666;
    
    pub fn verify_and_claim(
        ctx: Context<ClaimTokens>,
        answer_hash: [u8; 32],
    ) -> Result<()> {
        // Verify literary knowledge
        // Prevent double claiming
        // Transfer 734 tokens
    }
    
    pub fn verify_bunker_access(
        ctx: Context<VerifyAccess>,
    ) -> Result<bool> {
        // Check balance >= 666 DOOM
    }
}`}
              </pre>
            </div>
          </section>

          {/* Warning */}
          <section className="terminal-window bg-blood-red/10 border-blood-red">
            <h2 className="text-2xl font-bold text-blood-red mb-4">
              ⚠️ DISCLAIMER ⚠️
            </h2>
            <div className="text-sm leading-relaxed">
              <p>
                This is not financial advice. This is performance art masquerading as tokenomics. 
                This is a warning disguised as an opportunity. The DOOM token has no inherent value, 
                no utility beyond its own acknowledgment of worthlessness.
              </p>
              <p className="mt-3 text-blood-red font-bold">
                By participating, you acknowledge that all economic systems are temporary, 
                all currencies eventually fail, and entropy always wins.
              </p>
            </div>
          </section>
        </div>

        {/* Navigation */}
        <div className="mt-12 text-center">
          <Link 
            href="/the-judas-interface" 
            className="terminal-window inline-block hover:shadow-lg hover:shadow-blood-red/20 transition-all duration-300"
          >
            <span className="text-blood-red font-bold">
              PROCEED TO VERIFICATION →
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
