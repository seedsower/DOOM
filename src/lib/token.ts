import { Connection, PublicKey } from '@solana/web3.js';
import { getAssociatedTokenAddress, getAccount } from '@solana/spl-token';

// DOOM Token Configuration from deployment
export const DOOM_MINT_ADDRESS = 'G6ewSSUqzDhkBwMv3VK1HABybbqU5J6pHLVkzWXeiRvS';
export const DOOM_TOKEN_CONFIG = {
  mintAddress: new PublicKey(DOOM_MINT_ADDRESS),
  decimals: 9,
  symbol: 'DOOM',
  name: 'DOOM Protocol Token',
  totalSupply: 37_000_000,
  claimAmount: 734,
};

// Solana connection
export const getConnection = () => {
  const rpcUrl = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.devnet.solana.com';
  return new Connection(rpcUrl, 'confirmed');
};

// Get token balance for a wallet
export async function getTokenBalance(walletAddress: PublicKey): Promise<number> {
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
  } catch (error) {
    // Token account doesn't exist or other error
    console.log('Token balance check failed:', error);
    return 0;
  }
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
