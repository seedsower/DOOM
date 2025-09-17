import { DoomscrollInterface } from "@/components/DoomscrollInterface";
import { MarketTicker } from "@/components/MarketTicker";

export default function Home() {
  return (
    <div className="min-h-screen bg-doom-black text-terminal-green relative overflow-hidden">
      {/* Market Ticker at top */}
      <MarketTicker />
      
      {/* Main Content */}
      <main className="relative z-10">
        <DoomscrollInterface />
      </main>
      
      {/* Scan lines overlay */}
      <div className="scan-lines fixed inset-0 pointer-events-none z-20" />
    </div>
  );
}
