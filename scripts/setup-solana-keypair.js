#!/usr/bin/env node

const { Keypair } = require('@solana/web3.js');
const fs = require('fs');
const path = require('path');

console.log('🔑 Setting up Solana keypair for DOOM token minting...\n');

// Generate a new keypair
const keypair = Keypair.generate();
const privateKeyArray = Array.from(keypair.secretKey);

console.log('Generated new Solana keypair:');
console.log('Public Key:', keypair.publicKey.toBase58());
console.log('Private Key Array:', JSON.stringify(privateKeyArray));

// Create .env.local entry
const envEntry = `\n# Solana Keypair for Token Minting\nSOLANA_PRIVATE_KEY='${JSON.stringify(privateKeyArray)}'`;

console.log('\n📝 Add this to your .env.local file:');
console.log(envEntry);

// Try to append to .env.local if it exists
const envPath = path.join(process.cwd(), '.env.local');
try {
  if (fs.existsSync(envPath)) {
    fs.appendFileSync(envPath, envEntry);
    console.log('\n✅ Added SOLANA_PRIVATE_KEY to .env.local');
  } else {
    fs.writeFileSync(envPath, envEntry.trim());
    console.log('\n✅ Created .env.local with SOLANA_PRIVATE_KEY');
  }
} catch (error) {
  console.log('\n⚠️  Could not write to .env.local automatically. Please add manually.');
}

console.log('\n🚨 IMPORTANT SECURITY NOTES:');
console.log('1. This keypair controls token minting - keep it secure!');
console.log('2. Never commit the private key to version control');
console.log('3. For production, set SOLANA_PRIVATE_KEY as an environment variable');
console.log('4. Fund this wallet with SOL for transaction fees');
console.log('\n💰 Wallet address to fund:', keypair.publicKey.toBase58());
