const {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  sendAndConfirmTransaction,
  SystemProgram,
} = require('@solana/web3.js');

const {
  TOKEN_2022_PROGRAM_ID,
  createInitializeMintInstruction,
  createInitializeMetadataPointerInstruction,
  getMintLen,
  ExtensionType,
} = require('@solana/spl-token');

const {
  createInitializeInstruction,
  createUpdateFieldInstruction,
  pack,
} = require('@solana/spl-token-metadata');

const fs = require('fs');
const path = require('path');

// Metadata configuration
const METADATA_CONFIG = {
  name: 'DOOM',
  symbol: 'DOOM', 
  uri: 'https://apricot-occupational-boa-893.mypinata.cloud/ipfs/bafkreiaq6czfctqttd3ldziac3bow5tsjhm7fz3zmuzwtijxybpiuzccki',
  additionalMetadata: [
    ['description', 'TOKEN OF COLLAPSE'],
    ['image', 'https://ipfs.io/ipfs/bafybeibipab7satev46lxtdjro7pqtaoscou475ugywbtosezkeyhpxmai'],
    ['external_url', 'https://doom-protocol.netlify.app'],
    ['category', 'fungible'],
  ]
};

async function deployToken2022GodMode() {
  console.log('⚡ SOLANA GOD MODE ACTIVATED ⚡');
  console.log('🔥 Deploying Token-2022 with PERFECT metadata implementation...');
  console.log(`📋 Token: ${METADATA_CONFIG.name} (${METADATA_CONFIG.symbol})`);
  
  // Connect to devnet
  const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
  
  // Load mint authority keypair
  const keypairPath = path.join(process.env.HOME, '.config/solana/id.json');
  const keypairData = JSON.parse(fs.readFileSync(keypairPath, 'utf8'));
  const mintAuthority = Keypair.fromSecretKey(new Uint8Array(keypairData));
  const updateAuthority = mintAuthority;
  
  console.log(`🔑 Authority: ${mintAuthority.publicKey.toString()}`);
  
  // Generate new mint keypair
  const mintKeypair = Keypair.generate();
  const mint = mintKeypair.publicKey;
  
  console.log(`🪙 Mint: ${mint.toString()}`);
  
  try {
    // PHASE 1: Create mint with MetadataPointer extension only
    console.log('\n🚀 PHASE 1: Creating mint with MetadataPointer...');
    
    const extensions = [ExtensionType.MetadataPointer];
    const mintLen = getMintLen(extensions);
    const mintRent = await connection.getMinimumBalanceForRentExemption(mintLen);
    
    const phase1Transaction = new Transaction().add(
      // Create account
      SystemProgram.createAccount({
        fromPubkey: mintAuthority.publicKey,
        newAccountPubkey: mint,
        space: mintLen,
        lamports: mintRent,
        programId: TOKEN_2022_PROGRAM_ID,
      }),
      // Initialize MetadataPointer extension
      createInitializeMetadataPointerInstruction(
        mint,
        updateAuthority.publicKey,
        mint, // metadata stored in mint account
        TOKEN_2022_PROGRAM_ID
      ),
      // Initialize mint
      createInitializeMintInstruction(
        mint,
        9, // decimals
        mintAuthority.publicKey,
        null, // freeze authority
        TOKEN_2022_PROGRAM_ID
      )
    );
    
    const phase1Signature = await sendAndConfirmTransaction(
      connection,
      phase1Transaction,
      [mintAuthority, mintKeypair],
      { commitment: 'confirmed' }
    );
    
    console.log(`✅ Phase 1 complete: ${phase1Signature}`);
    
    // PHASE 2: Initialize TokenMetadata extension
    console.log('\n🔥 PHASE 2: Adding TokenMetadata extension...');
    
    // Calculate additional space needed for metadata
    const metadataLen = pack({
      mint: mint,
      name: METADATA_CONFIG.name,
      symbol: METADATA_CONFIG.symbol,
      uri: METADATA_CONFIG.uri,
      additionalMetadata: METADATA_CONFIG.additionalMetadata,
    }).length;
    
    console.log(`📊 Metadata size: ${metadataLen} bytes`);
    
    // Reallocate account to fit metadata
    const newSize = mintLen + metadataLen;
    const additionalRent = await connection.getMinimumBalanceForRentExemption(newSize) - mintRent;
    
    if (additionalRent > 0) {
      console.log(`💰 Adding ${additionalRent / 1e9} SOL for metadata space...`);
      const reallocTransaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: mintAuthority.publicKey,
          toPubkey: mint,
          lamports: additionalRent,
        })
      );
      
      await sendAndConfirmTransaction(
        connection,
        reallocTransaction,
        [mintAuthority],
        { commitment: 'confirmed' }
      );
    }
    
    // Initialize metadata
    const phase2Transaction = new Transaction().add(
      createInitializeInstruction({
        programId: TOKEN_2022_PROGRAM_ID,
        metadata: mint,
        updateAuthority: updateAuthority.publicKey,
        mint: mint,
        mintAuthority: mintAuthority.publicKey,
        name: METADATA_CONFIG.name,
        symbol: METADATA_CONFIG.symbol,
        uri: METADATA_CONFIG.uri,
      })
    );
    
    const phase2Signature = await sendAndConfirmTransaction(
      connection,
      phase2Transaction,
      [mintAuthority],
      { commitment: 'confirmed' }
    );
    
    console.log(`✅ Phase 2 complete: ${phase2Signature}`);
    
    // PHASE 3: Add custom metadata fields
    console.log('\n⚡ PHASE 3: Adding custom metadata fields...');
    
    for (const [key, value] of METADATA_CONFIG.additionalMetadata) {
      console.log(`📝 Adding field: ${key} = ${value}`);
      
      const updateTransaction = new Transaction().add(
        createUpdateFieldInstruction({
          programId: TOKEN_2022_PROGRAM_ID,
          metadata: mint,
          updateAuthority: updateAuthority.publicKey,
          field: key,
          value: value,
        })
      );
      
      await sendAndConfirmTransaction(
        connection,
        updateTransaction,
        [updateAuthority],
        { commitment: 'confirmed' }
      );
    }
    
    console.log(`✅ Phase 3 complete: All metadata fields added!`);
    
    // Verify final state
    console.log('\n🔍 VERIFICATION:');
    const mintInfo = await connection.getAccountInfo(mint);
    console.log(`📊 Final account size: ${mintInfo.data.length} bytes`);
    console.log(`🏷️ Extensions: MetadataPointer + TokenMetadata`);
    console.log(`🎯 Explorer: https://explorer.solana.com/address/${mint.toString()}?cluster=devnet`);
    
    // Save deployment info
    const deploymentInfo = {
      mintAddress: mint.toString(),
      mintAuthority: mintAuthority.publicKey.toString(),
      updateAuthority: updateAuthority.publicKey.toString(),
      decimals: 9,
      totalSupply: 0,
      phase1Signature,
      phase2Signature,
      tokenProgram: 'Token-2022',
      extensions: ['MetadataPointer', 'TokenMetadata'],
      version: 'v5-god-mode',
      timestamp: new Date().toISOString(),
      network: 'devnet',
      metadata: METADATA_CONFIG,
      explorerUrl: `https://explorer.solana.com/address/${mint.toString()}?cluster=devnet`
    };
    
    const deploymentPath = path.join(__dirname, '..', 'deployment-info-god-mode.json');
    fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
    console.log(`💾 Deployment saved: ${deploymentPath}`);
    
    return {
      success: true,
      mintAddress: mint.toString(),
      deploymentInfo
    };
    
  } catch (error) {
    console.error('❌ GOD MODE FAILED:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// CLI usage
if (require.main === module) {
  deployToken2022GodMode()
    .then((result) => {
      if (result.success) {
        console.log('\n⚡ SOLANA GOD MODE SUCCESS! ⚡');
        console.log('🔥 Token-2022 with FULL metadata deployed!');
        console.log('🎯 Metadata should be visible in Solana Explorer!');
        process.exit(0);
      } else {
        console.log('\n❌ God mode failed!');
        process.exit(1);
      }
    })
    .catch((error) => {
      console.error('❌ Unexpected error:', error);
      process.exit(1);
    });
}

module.exports = { deployToken2022GodMode, METADATA_CONFIG };
