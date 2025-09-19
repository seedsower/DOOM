#!/usr/bin/env node

const { Connection, PublicKey } = require('@solana/web3.js');
const { getMint, TOKEN_2022_PROGRAM_ID } = require('@solana/spl-token');

const DOOM_MINT_ADDRESS = '48RRMbPXK1uuzJCo66yTVgRSZGARqSpE7FdXupwBbWoD';
const RPC_URL = 'https://api.mainnet-beta.solana.com';

async function checkMintAuthority() {
  console.log('🔍 Checking DOOM token mint authority...\n');
  
  try {
    const connection = new Connection(RPC_URL, 'confirmed');
    const mintPublicKey = new PublicKey(DOOM_MINT_ADDRESS);
    
    console.log('Mint Address:', DOOM_MINT_ADDRESS);
    
    // Get mint info
    const mintInfo = await getMint(
      connection,
      mintPublicKey,
      'confirmed',
      TOKEN_2022_PROGRAM_ID
    );
    
    console.log('\n📊 Mint Information:');
    console.log('- Supply:', mintInfo.supply.toString());
    console.log('- Decimals:', mintInfo.decimals);
    console.log('- Mint Authority:', mintInfo.mintAuthority?.toBase58() || 'None');
    console.log('- Freeze Authority:', mintInfo.freezeAuthority?.toBase58() || 'None');
    console.log('- Is Initialized:', mintInfo.isInitialized);
    
    if (mintInfo.mintAuthority) {
      console.log('\n🔑 Current mint authority:', mintInfo.mintAuthority.toBase58());
      console.log('🔑 Our keypair public key: 37Ehps5vKYtJXczvPkDKLwGSex29cKbdHVxwrGef3iEm');
      
      if (mintInfo.mintAuthority.toBase58() === '37Ehps5vKYtJXczvPkDKLwGSex29cKbdHVxwrGef3iEm') {
        console.log('✅ Our keypair matches the mint authority!');
      } else {
        console.log('❌ Our keypair does NOT match the mint authority!');
        console.log('❌ This is why minting is failing.');
      }
    } else {
      console.log('❌ No mint authority set - minting is disabled');
    }
    
  } catch (error) {
    console.error('❌ Error checking mint authority:', error.message);
  }
}

checkMintAuthority();
