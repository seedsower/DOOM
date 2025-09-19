#!/usr/bin/env node

const { Keypair } = require('@solana/web3.js');
const fs = require('fs');
const path = require('path');

console.log('🔍 Checking DOOM token keypair...\n');

const EXPECTED_MINT_AUTHORITY = '9uN3Vw5DouX6sdFbfJt6WDHZSrRo67P7dnKNNLuEHcnT';

try {
  // Check doom-token-keypair.json
  const doomKeypairPath = path.join(process.env.HOME, '.config', 'solana', 'doom-token-keypair.json');
  
  if (fs.existsSync(doomKeypairPath)) {
    console.log('✅ Found doom-token-keypair.json');
    
    const keypairData = JSON.parse(fs.readFileSync(doomKeypairPath, 'utf8'));
    const keypair = Keypair.fromSecretKey(new Uint8Array(keypairData));
    const publicKey = keypair.publicKey.toBase58();
    
    console.log('Public Key:', publicKey);
    console.log('Expected:', EXPECTED_MINT_AUTHORITY);
    
    if (publicKey === EXPECTED_MINT_AUTHORITY) {
      console.log('🎉 MATCH! This is the correct mint authority keypair!');
      console.log('\n📋 Private key array for .env.local:');
      console.log(JSON.stringify(Array.from(keypair.secretKey)));
      
      // Update .env.local
      const envPath = path.join(process.cwd(), '.env.local');
      let envContent = '';
      
      if (fs.existsSync(envPath)) {
        envContent = fs.readFileSync(envPath, 'utf8');
      }
      
      // Replace or add SOLANA_PRIVATE_KEY
      const newPrivateKey = JSON.stringify(Array.from(keypair.secretKey));
      const privateKeyRegex = /SOLANA_PRIVATE_KEY='.*'/;
      
      if (privateKeyRegex.test(envContent)) {
        envContent = envContent.replace(privateKeyRegex, `SOLANA_PRIVATE_KEY='${newPrivateKey}'`);
      } else {
        envContent += `\n# Solana Keypair for Token Minting\nSOLANA_PRIVATE_KEY='${newPrivateKey}'`;
      }
      
      fs.writeFileSync(envPath, envContent);
      console.log('✅ Updated .env.local with correct keypair');
      
    } else {
      console.log('❌ No match - this is not the mint authority');
    }
  } else {
    console.log('❌ doom-token-keypair.json not found');
  }
  
} catch (error) {
  console.error('❌ Error:', error.message);
}
