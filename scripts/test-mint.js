#!/usr/bin/env node

// Test minting functionality directly
const { Connection, PublicKey, Keypair } = require('@solana/web3.js');
const { mintTo, getOrCreateAssociatedTokenAccount, TOKEN_2022_PROGRAM_ID } = require('@solana/spl-token');
const fs = require('fs');
const path = require('path');

const DOOM_MINT_ADDRESS = '48RRMbPXK1uuzJCo66yTVgRSZGARqSpE7FdXupwBbWoD';
const RPC_URL = 'https://api.mainnet-beta.solana.com';

// Load mint authority keypair from environment variable or Solana CLI config
function loadMintAuthority() {
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

async function testMinting() {
  console.log('🧪 Testing token minting functionality...\n');
  
  // Test wallet address
  const testWallet = '37Ehps5vKYtJXczvPkDKLwGSex29cKbdHVxwrGef3iEm';
  const amount = 734;
  
  console.log('Test Parameters:');
  console.log('- Recipient:', testWallet);
  console.log('- Amount:', amount, 'DOOM tokens');
  console.log('- Network: Solana Mainnet');
  console.log('- Mint Address:', DOOM_MINT_ADDRESS);
  console.log('- RPC URL:', RPC_URL);
  
  try {
    console.log('\n🔑 Loading mint authority keypair...');
    const mintAuthority = loadMintAuthority();
    console.log('✅ Keypair loaded. Public key:', mintAuthority.publicKey.toBase58());
    
    console.log('\n🌐 Connecting to Solana...');
    const connection = new Connection(RPC_URL, 'confirmed');
    const mintPublicKey = new PublicKey(DOOM_MINT_ADDRESS);
    const recipientPublicKey = new PublicKey(testWallet);
    
    console.log('\n💰 Checking mint authority balance...');
    const balance = await connection.getBalance(mintAuthority.publicKey);
    console.log('Balance:', balance / 1e9, 'SOL');
    
    if (balance < 1000000) { // Less than 0.001 SOL
      throw new Error('Insufficient SOL balance for transaction fees');
    }
    
    console.log('\n🏦 Getting or creating associated token account...');
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
    console.log('Token account:', recipientTokenAccount.address.toBase58());
    
    console.log('\n🔥 Minting tokens...');
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
    
    console.log('✅ Mint successful!');
    console.log('Transaction signature:', mintSignature);
    console.log('Explorer link: https://explorer.solana.com/tx/' + mintSignature);
    
  } catch (error) {
    console.log('❌ Minting failed:');
    console.log('Error:', error.message);
    console.log('\nFull error details:');
    console.log(error);
  }
}

testMinting();
