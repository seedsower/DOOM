'use client';

import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { POOL_CONFIG } from '@/lib/pool';

interface PoolInfo {
  poolId: string;
  price: number;
  reserves: {
    doom: number;
    usdc: number;
  };
  lpSupply: number;
  liquidityBurned: boolean;
  marketCap: number;
  fullyDilutedValue: number;
  tradeSimulations: {
    buy100USDC: {
      outputAmount: number;
      priceImpact: number;
      fee: number;
    };
    buy1000USDC: {
      outputAmount: number;
      priceImpact: number;
      fee: number;
    };
    sell1MDOOM: {
      outputAmount: number;
      priceImpact: number;
      fee: number;
    };
  };
}

interface PoolCreationResult {
  success: boolean;
  poolId?: string;
  lpTokenMint?: string;
  createTxSignature?: string;
  burnTxSignature?: string;
  liquidityBurned?: boolean;
  message?: string;
  error?: string;
}

export const PoolManager: React.FC = () => {
  const { publicKey } = useWallet();
  const [poolInfo, setPoolInfo] = useState<PoolInfo | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [creationResult, setCreationResult] = useState<PoolCreationResult | null>(null);
  
  // Pool creation form state
  const [doomAmount, setDoomAmount] = useState(POOL_CONFIG.INITIAL_DOOM_LIQUIDITY);
  const [usdcAmount, setUsdcAmount] = useState(POOL_CONFIG.INITIAL_USDC_LIQUIDITY);

  const createPool = async () => {
    if (!publicKey) {
      setError('Wallet not connected');
      return;
    }

    setIsCreating(true);
    setError(null);

    try {
      const response = await fetch('/api/pool/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          doomAmount,
          usdcAmount
        }),
      });

      const result: PoolCreationResult = await response.json();
      
      if (result.success) {
        setCreationResult(result);
        // Fetch pool info after creation
        if (result.poolId) {
          await fetchPoolInfo(result.poolId);
        }
      } else {
        setError(result.error || 'Pool creation failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setIsCreating(false);
    }
  };

  const fetchPoolInfo = async (poolId?: string) => {
    if (!poolId) return;
    
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/pool/info?poolId=${poolId}`);
      const result = await response.json();
      
      if (result.success) {
        setPoolInfo(result);
      } else {
        setError(result.error || 'Failed to fetch pool info');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const formatNumber = (num: number, decimals: number = 2): string => {
    if (num === 0) return '0';
    if (num < 0.0001) return num.toExponential(2);
    return num.toLocaleString(undefined, { 
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals 
    });
  };

  const formatCurrency = (num: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 6
    }).format(num);
  };

  return (
    <div className="space-y-6">
      {/* Pool Creation Section */}
      <section className="terminal-window border-warning-amber">
        <h3 className="text-xl font-bold text-warning-amber mb-4">
          🏊 LIQUIDITY POOL CREATION
        </h3>
        
        {!creationResult ? (
          <div className="space-y-4">
            <p className="text-sm opacity-80">
              Create a DOOM/USDC liquidity pool with permanent liquidity commitment.
              LP tokens will be burned to ensure liquidity can never be removed.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-terminal-green mb-2">
                  DOOM Amount
                </label>
                <input
                  type="number"
                  value={doomAmount}
                  onChange={(e) => setDoomAmount(Number(e.target.value))}
                  className="w-full bg-doom-black/50 border border-terminal-green rounded px-3 py-2 text-terminal-green"
                  placeholder="10000000"
                />
                <p className="text-xs opacity-60 mt-1">
                  {doomAmount.toLocaleString()} DOOM tokens
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-terminal-green mb-2">
                  USDC Amount
                </label>
                <input
                  type="number"
                  value={usdcAmount}
                  onChange={(e) => setUsdcAmount(Number(e.target.value))}
                  className="w-full bg-doom-black/50 border border-terminal-green rounded px-3 py-2 text-terminal-green"
                  placeholder="100"
                />
                <p className="text-xs opacity-60 mt-1">
                  ${usdcAmount} USDC
                </p>
              </div>
            </div>
            
            <div className="bg-warning-amber/10 p-3 border border-warning-amber rounded">
              <p className="text-xs font-mono">
                <strong>Initial Price:</strong> {formatCurrency(usdcAmount / doomAmount)}<br/>
                <strong>Market Cap:</strong> {formatCurrency((usdcAmount / doomAmount) * 37_000_000)}<br/>
                <strong>⚠️ LP TOKENS WILL BE BURNED - PERMANENT LIQUIDITY</strong>
              </p>
            </div>
            
            <button
              onClick={createPool}
              disabled={isCreating || !publicKey}
              className="w-full bg-warning-amber/20 border border-warning-amber px-4 py-3 rounded hover:bg-warning-amber/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCreating ? (
                <span className="flex items-center justify-center">
                  <div className="animate-spin mr-2">⟳</div>
                  Creating Pool & Burning LP Tokens...
                </span>
              ) : (
                '🔥 CREATE POOL & BURN LP TOKENS'
              )}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-terminal-green/10 p-4 border border-terminal-green rounded">
              <h4 className="text-terminal-green font-bold mb-2">✅ POOL CREATED SUCCESSFULLY</h4>
              <div className="text-sm space-y-1">
                <p><strong>Pool ID:</strong> <code className="text-xs">{creationResult.poolId}</code></p>
                <p><strong>LP Token Mint:</strong> <code className="text-xs">{creationResult.lpTokenMint}</code></p>
                <p><strong>Create Tx:</strong> <code className="text-xs">{creationResult.createTxSignature}</code></p>
                {creationResult.burnTxSignature && (
                  <p><strong>Burn Tx:</strong> <code className="text-xs">{creationResult.burnTxSignature}</code></p>
                )}
                <p className="text-blood-red font-bold">🔥 LP TOKENS BURNED - LIQUIDITY IS PERMANENT</p>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Pool Information Section */}
      {poolInfo && (
        <section className="terminal-window border-glitch-blue">
          <h3 className="text-xl font-bold text-glitch-blue mb-4">
            📊 POOL ANALYTICS
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <div className="bg-glitch-blue/10 p-3 border border-glitch-blue rounded">
              <div className="text-xs opacity-70">DOOM Price</div>
              <div className="text-lg font-bold">{formatCurrency(poolInfo.price)}</div>
            </div>
            
            <div className="bg-terminal-green/10 p-3 border border-terminal-green rounded">
              <div className="text-xs opacity-70">Market Cap</div>
              <div className="text-lg font-bold">{formatCurrency(poolInfo.marketCap)}</div>
            </div>
            
            <div className="bg-void-purple/10 p-3 border border-void-purple rounded">
              <div className="text-xs opacity-70">FDV</div>
              <div className="text-lg font-bold">{formatCurrency(poolInfo.fullyDilutedValue)}</div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <h4 className="text-sm font-bold text-terminal-green mb-2">RESERVES</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>DOOM:</span>
                  <span>{formatNumber(poolInfo.reserves.doom, 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span>USDC:</span>
                  <span>{formatCurrency(poolInfo.reserves.usdc)}</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-bold text-blood-red mb-2">LIQUIDITY STATUS</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>LP Supply:</span>
                  <span>{poolInfo.lpSupply}</span>
                </div>
                <div className="flex justify-between">
                  <span>Status:</span>
                  <span className={poolInfo.liquidityBurned ? 'text-blood-red' : 'text-warning-amber'}>
                    {poolInfo.liquidityBurned ? '🔥 BURNED' : '⚠️ ACTIVE'}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-bold text-void-purple mb-2">TRADE SIMULATIONS</h4>
            <div className="space-y-2 text-xs">
              <div className="bg-void-purple/10 p-2 border border-void-purple rounded">
                <div className="font-bold">Buy $100 USDC worth:</div>
                <div>Output: {formatNumber(poolInfo.tradeSimulations.buy100USDC.outputAmount, 0)} DOOM</div>
                <div>Price Impact: {formatNumber(poolInfo.tradeSimulations.buy100USDC.priceImpact, 2)}%</div>
              </div>
              
              <div className="bg-void-purple/10 p-2 border border-void-purple rounded">
                <div className="font-bold">Buy $1,000 USDC worth:</div>
                <div>Output: {formatNumber(poolInfo.tradeSimulations.buy1000USDC.outputAmount, 0)} DOOM</div>
                <div>Price Impact: {formatNumber(poolInfo.tradeSimulations.buy1000USDC.priceImpact, 2)}%</div>
              </div>
              
              <div className="bg-void-purple/10 p-2 border border-void-purple rounded">
                <div className="font-bold">Sell 1M DOOM:</div>
                <div>Output: {formatCurrency(poolInfo.tradeSimulations.sell1MDOOM.outputAmount)}</div>
                <div>Price Impact: {formatNumber(poolInfo.tradeSimulations.sell1MDOOM.priceImpact, 2)}%</div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Error Display */}
      {error && (
        <div className="terminal-window border-blood-red">
          <div className="text-blood-red">
            <strong>Error:</strong> {error}
          </div>
        </div>
      )}
    </div>
  );
};
