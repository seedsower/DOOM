import { Connection, PublicKey } from '@solana/web3.js';
import { getAssociatedTokenAddress, getAccount } from '@solana/spl-token';

// DOOM Token Configuration from deployment
export const DOOM_MINT_ADDRESS = '48RRMbPXK1uuzJCo66yTVgRSZGARqSpE7FdXupwBbWoD';
export const DOOM_TOKEN_CONFIG = {
  mintAddress: new PublicKey(DOOM_MINT_ADDRESS),
  decimals: 9,
  symbol: 'DOOM',
  name: 'DOOM Protocol Token',
  totalSupply: 37_000_000,
  claimAmount: 734,
};

// Solana connection with fallback RPC endpoints
export const getConnection = () => {
  // Use environment variable or fallback to more reliable RPC endpoints
  const rpcUrl = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 
    'https://rpc.ankr.com/solana'; // Ankr free tier (more reliable than Solana Labs)
  
  const connection = new Connection(rpcUrl, 'confirmed');
  return connection;
};

// Get token balance for a wallet with retry logic
export async function getTokenBalance(walletAddress: PublicKey): Promise<number> {
  const maxRetries = 3;
  let lastError: any;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const connection = getConnection();
      
      // Get the associated token account address
      const associatedTokenAddress = await getAssociatedTokenAddress(
        DOOM_TOKEN_CONFIG.mintAddress,
        walletAddress
      );
      
      // Get the token account info
      const tokenAccount = await getAccount(connection, associatedTokenAddress);
      
      // Convert balance from smallest unit to tokens
      const balance = Number(tokenAccount.amount) / Math.pow(10, DOOM_TOKEN_CONFIG.decimals);
      
      return balance;
    } catch (error: any) {
      lastError = error;
      console.log(`Token balance check failed (attempt ${attempt}/${maxRetries}):`, error.message);
      
      // If it's a 403 error or rate limit, wait before retry
      if (error.message?.includes('403') || error.message?.includes('rate limit')) {
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt)); // Exponential backoff
          continue;
        }
      }
      
      // If token account doesn't exist, return 0 immediately
      if (error.message?.includes('could not find account') || 
          error.message?.includes('Invalid param: could not find account')) {
        return 0;
      }
    }
  }
  
  // All retries failed
  console.error('Token balance check failed after all retries:', lastError);
  return 0;
}

// Check if wallet has minimum token balance
export async function hasMinimumBalance(walletAddress: PublicKey, minimumAmount: number): Promise<boolean> {
  const balance = await getTokenBalance(walletAddress);
  return balance >= minimumAmount;
}

// Format token amount for display
export function formatTokenAmount(amount: number): string {
  if (amount === 0) return '0';
  if (amount < 1) return amount.toFixed(4);
  return amount.toLocaleString();
}

// Get token account address for a wallet
export async function getTokenAccountAddress(walletAddress: PublicKey): Promise<PublicKey> {
  return await getAssociatedTokenAddress(
    DOOM_TOKEN_CONFIG.mintAddress,
    walletAddress
  );
}
