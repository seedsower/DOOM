#!/usr/bin/env node

const { Keypair, PublicKey } = require('@solana/web3.js');
const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying Solana keypair...\n');

// Load from .env.local
const envPath = path.join(process.cwd(), '.env.local');
if (!fs.existsSync(envPath)) {
  console.error('❌ .env.local file not found');
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf8');
const privateKeyMatch = envContent.match(/SOLANA_PRIVATE_KEY='(\[.*?\])'/);

if (!privateKeyMatch) {
  console.error('❌ SOLANA_PRIVATE_KEY not found in .env.local');
  process.exit(1);
}

try {
  const privateKeyArray = JSON.parse(privateKeyMatch[1]);
  console.log('Private key array length:', privateKeyArray.length);
  
  if (privateKeyArray.length !== 64) {
    console.error('❌ Invalid private key length. Should be 64 bytes.');
    process.exit(1);
  }
  
  const keypair = Keypair.fromSecretKey(new Uint8Array(privateKeyArray));
  const publicKey = keypair.publicKey.toBase58();
  
  console.log('✅ Keypair verification successful!');
  console.log('Public Key:', publicKey);
  console.log('Key length:', publicKey.length);
  
  // Validate the public key format
  try {
    new PublicKey(publicKey);
    console.log('✅ Public key format is valid');
  } catch (error) {
    console.error('❌ Invalid public key format:', error.message);
  }
  
  console.log('\n📋 Use this address to fund with SOL:');
  console.log(publicKey);
  
} catch (error) {
  console.error('❌ Error verifying keypair:', error.message);
  process.exit(1);
}
