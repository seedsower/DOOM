#!/usr/bin/env node

const { Keypair } = require('@solana/web3.js');

console.log('🔍 Finding the correct mint authority keypair...\n');

// The actual mint authority from the blockchain
const ACTUAL_MINT_AUTHORITY = '9uN3Vw5DouX6sdFbfJt6WDHZSrRo67P7dnKNNLuEHcnT';

console.log('❌ Current Issue:');
console.log('- Blockchain mint authority:', ACTUAL_MINT_AUTHORITY);
console.log('- Our generated keypair: 37Ehps5vKYtJXczvPkDKLwGSex29cKbdHVxwrGef3iEm');
console.log('- These do not match!\n');

console.log('🔧 Solutions:');
console.log('1. Find the original keypair used to deploy the DOOM token');
console.log('2. Generate a new keypair and transfer mint authority');
console.log('3. Use the original deployment keypair if available\n');

console.log('📝 Based on your memories, you previously deployed DOOM token to mainnet.');
console.log('The original mint authority keypair should be in your Solana CLI config or saved somewhere.');
console.log('\n🔍 Check these locations:');
console.log('- ~/.config/solana/id.json (default Solana CLI keypair)');
console.log('- Any saved keypair files from the original deployment');
console.log('- Environment variables from the original deployment\n');

console.log('💡 If you have the original keypair, replace the SOLANA_PRIVATE_KEY with:');
console.log('The private key array of:', ACTUAL_MINT_AUTHORITY);
