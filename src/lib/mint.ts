import { Connection, PublicKey, Keypair, Transaction } from '@solana/web3.js';
import { 
  createMintToInstruction, 
  getAssociatedTokenAddressSync, 
  createAssociatedTokenAccountInstruction, 
  getAccount,
  TOKEN_2022_PROGRAM_ID,
  getOrCreateAssociatedTokenAccount,
  mintTo
} from '@solana/spl-token';
import fs from 'fs';
import path from 'path';

const DOOM_MINT_ADDRESS = '48RRMbPXK1uuzJCo66yTVgRSZGARqSpE7FdXupwBbWoD';
const RPC_URL = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 
  'https://rpc.ankr.com/solana';

// Load mint authority keypair from environment variable or Solana CLI config
function loadMintAuthority(): Keypair {
  try {
    // First try to load from environment variable (for production)
    if (process.env.SOLANA_PRIVATE_KEY) {
      const privateKeyArray = JSON.parse(process.env.SOLANA_PRIVATE_KEY);
      return Keypair.fromSecretKey(new Uint8Array(privateKeyArray));
    }
    
    // Fallback to Solana CLI config (for local development)
    const keypairPath = path.join(process.env.HOME || '', '.config', 'solana', 'id.json');
    if (fs.existsSync(keypairPath)) {
      const keypairData = JSON.parse(fs.readFileSync(keypairPath, 'utf8'));
      return Keypair.fromSecretKey(new Uint8Array(keypairData));
    }
    
    throw new Error('No keypair found. Set SOLANA_PRIVATE_KEY environment variable or configure Solana CLI.');
  } catch (error) {
    throw new Error(`Failed to load mint authority keypair: ${error}`);
  }
}

// Server-side token minting function
export async function mintDoomTokens(recipientWallet: string, amount: number = 734): Promise<{
  success: boolean;
  signature?: string;
  error?: string;
}> {
  try {
    console.log(`🔥 Minting ${amount} DOOM tokens to ${recipientWallet}...`);
    
    // Initialize connection and keypair
    const connection = new Connection(RPC_URL, 'confirmed');
    const mintAuthority = loadMintAuthority();
    const mintPublicKey = new PublicKey(DOOM_MINT_ADDRESS);
    const recipientPublicKey = new PublicKey(recipientWallet);
    
    // Check mint authority balance
    const balance = await connection.getBalance(mintAuthority.publicKey);
    if (balance < 1000000) { // Less than 0.001 SOL
      throw new Error('Insufficient SOL balance for transaction fees');
    }
    
    // Get or create associated token account for recipient
    const recipientTokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      mintAuthority, // payer
      mintPublicKey,
      recipientPublicKey,
      false, // allowOwnerOffCurve
      'confirmed',
      undefined,
      TOKEN_2022_PROGRAM_ID
    );
    
    // Mint tokens
    const mintSignature = await mintTo(
      connection,
      mintAuthority, // payer
      mintPublicKey,
      recipientTokenAccount.address,
      mintAuthority, // mint authority
      amount * 1e9, // amount with decimals (9 decimals)
      [],
      { commitment: 'confirmed' },
      TOKEN_2022_PROGRAM_ID
    );
    
    console.log(`✅ Mint successful! Signature: ${mintSignature}`);
    
    return {
      success: true,
      signature: mintSignature
    };
  } catch (error) {
    console.error('Token minting failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}
