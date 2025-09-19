#!/usr/bin/env node

const { Keypair } = require('@solana/web3.js');
const fs = require('fs');
const path = require('path');

console.log('🔍 Checking all available keypairs...\n');

const EXPECTED_MINT_AUTHORITY = '9uN3Vw5DouX6sdFbfJt6WDHZSrRo67P7dnKNNLuEHcnT';
const solanaDir = path.join(process.env.HOME, '.config', 'solana');

// List of keypair files to check
const keypairFiles = [
  'id.json',
  'doom-token-keypair.json',
  'phantom1.json',
  'phantom_key3.json',
  'phantom_wallet1.json',
  'phantom_wallet2.json',
  'phantom_wallet.json'
];

let foundMatch = false;
let correctKeypair = null;

for (const filename of keypairFiles) {
  const keypairPath = path.join(solanaDir, filename);
  
  if (fs.existsSync(keypairPath)) {
    try {
      const keypairData = JSON.parse(fs.readFileSync(keypairPath, 'utf8'));
      const keypair = Keypair.fromSecretKey(new Uint8Array(keypairData));
      const publicKey = keypair.publicKey.toBase58();
      
      console.log(`📄 ${filename}:`);
      console.log(`   Public Key: ${publicKey}`);
      
      if (publicKey === EXPECTED_MINT_AUTHORITY) {
        console.log('   🎉 MATCH! This is the mint authority!');
        foundMatch = true;
        correctKeypair = keypair;
      } else {
        console.log('   ❌ Not the mint authority');
      }
      console.log('');
      
    } catch (error) {
      console.log(`📄 ${filename}: ❌ Error reading keypair - ${error.message}\n`);
    }
  } else {
    console.log(`📄 ${filename}: ❌ File not found\n`);
  }
}

if (foundMatch && correctKeypair) {
  console.log('✅ Found the correct mint authority keypair!');
  console.log('\n📋 Private key array for environment variable:');
  const privateKeyArray = Array.from(correctKeypair.secretKey);
  console.log(JSON.stringify(privateKeyArray));
  
  // Update .env.local
  const envPath = path.join(process.cwd(), '.env.local');
  let envContent = '';
  
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8');
  }
  
  // Replace or add SOLANA_PRIVATE_KEY
  const newPrivateKey = JSON.stringify(privateKeyArray);
  const privateKeyRegex = /SOLANA_PRIVATE_KEY='.*'/;
  
  if (privateKeyRegex.test(envContent)) {
    envContent = envContent.replace(privateKeyRegex, `SOLANA_PRIVATE_KEY='${newPrivateKey}'`);
  } else {
    envContent += `\n# Solana Keypair for Token Minting (Correct Mint Authority)\nSOLANA_PRIVATE_KEY='${newPrivateKey}'`;
  }
  
  fs.writeFileSync(envPath, envContent);
  console.log('✅ Updated .env.local with correct mint authority keypair');
  
} else {
  console.log('❌ No matching mint authority keypair found in local files');
  console.log('💡 The original mint authority keypair may be stored elsewhere or lost');
}
