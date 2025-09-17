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

async function deployToken2022Ultimate() {
  console.log('⚡ ULTIMATE SOLANA GOD MODE ⚡');
  console.log('🔥 Deploying Token-2022 with PERFECT rent-calculated metadata...');
  
  const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
  
  // Load keypair
  const keypairPath = path.join(process.env.HOME, '.config/solana/id.json');
  const keypairData = JSON.parse(fs.readFileSync(keypairPath, 'utf8'));
  const mintAuthority = Keypair.fromSecretKey(new Uint8Array(keypairData));
  const updateAuthority = mintAuthority;
  
  console.log(`🔑 Authority: ${mintAuthority.publicKey.toString()}`);
  
  const mintKeypair = Keypair.generate();
  const mint = mintKeypair.publicKey;
  console.log(`🪙 Mint: ${mint.toString()}`);
  
  try {
    // Calculate TOTAL space needed upfront
    const extensions = [ExtensionType.MetadataPointer];
    const mintLen = getMintLen(extensions);
    
    // Calculate metadata size with ALL fields
    const fullMetadataLen = pack({
      mint: mint,
      name: METADATA_CONFIG.name,
      symbol: METADATA_CONFIG.symbol,
      uri: METADATA_CONFIG.uri,
      additionalMetadata: METADATA_CONFIG.additionalMetadata,
    }).length;
    
    const totalLen = mintLen + fullMetadataLen;
    const totalRent = await connection.getMinimumBalanceForRentExemption(totalLen);
    
    console.log(`📦 Total space: ${totalLen} bytes (${mintLen} + ${fullMetadataLen})`);
    console.log(`💰 Total rent: ${totalRent / 1e9} SOL`);
    
    // PHASE 1: Create mint with full space allocated
    console.log('\n🚀 PHASE 1: Creating mint with full space...');
    
    const phase1Transaction = new Transaction().add(
      SystemProgram.createAccount({
        fromPubkey: mintAuthority.publicKey,
        newAccountPubkey: mint,
        space: totalLen, // Allocate FULL space upfront
        lamports: totalRent, // Pay FULL rent upfront
        programId: TOKEN_2022_PROGRAM_ID,
      }),
      createInitializeMetadataPointerInstruction(
        mint,
        updateAuthority.publicKey,
        mint,
        TOKEN_2022_PROGRAM_ID
      ),
      createInitializeMintInstruction(
        mint,
        9,
        mintAuthority.publicKey,
        null,
        TOKEN_2022_PROGRAM_ID
      )
    );
    
    const phase1Signature = await sendAndConfirmTransaction(
      connection,
      phase1Transaction,
      [mintAuthority, mintKeypair],
      { commitment: 'confirmed' }
    );
    
    console.log(`✅ Phase 1: ${phase1Signature}`);
    
    // PHASE 2: Initialize metadata
    console.log('\n🔥 PHASE 2: Initializing metadata...');
    
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
    
    console.log(`✅ Phase 2: ${phase2Signature}`);
    
    // PHASE 3: Add all custom fields in single transaction
    console.log('\n⚡ PHASE 3: Adding all metadata fields...');
    
    const phase3Transaction = new Transaction();
    
    for (const [key, value] of METADATA_CONFIG.additionalMetadata) {
      console.log(`📝 Adding: ${key} = ${value.substring(0, 50)}...`);
      phase3Transaction.add(
        createUpdateFieldInstruction({
          programId: TOKEN_2022_PROGRAM_ID,
          metadata: mint,
          updateAuthority: updateAuthority.publicKey,
          field: key,
          value: value,
        })
      );
    }
    
    const phase3Signature = await sendAndConfirmTransaction(
      connection,
      phase3Transaction,
      [updateAuthority],
      { commitment: 'confirmed' }
    );
    
    console.log(`✅ Phase 3: ${phase3Signature}`);
    
    // Final verification
    console.log('\n🎯 FINAL VERIFICATION:');
    const mintInfo = await connection.getAccountInfo(mint);
    console.log(`📊 Account size: ${mintInfo.data.length} bytes`);
    console.log(`💰 Account balance: ${mintInfo.lamports / 1e9} SOL`);
    console.log(`🏷️ Extensions: MetadataPointer + TokenMetadata`);
    console.log(`🌐 Explorer: https://explorer.solana.com/address/${mint.toString()}?cluster=devnet`);
    
    // Save deployment info
    const deploymentInfo = {
      mintAddress: mint.toString(),
      mintAuthority: mintAuthority.publicKey.toString(),
      updateAuthority: updateAuthority.publicKey.toString(),
      decimals: 9,
      totalSupply: 0,
      signatures: {
        phase1: phase1Signature,
        phase2: phase2Signature,
        phase3: phase3Signature,
      },
      tokenProgram: 'Token-2022',
      extensions: ['MetadataPointer', 'TokenMetadata'],
      version: 'v6-ultimate',
      timestamp: new Date().toISOString(),
      network: 'devnet',
      metadata: METADATA_CONFIG,
      explorerUrl: `https://explorer.solana.com/address/${mint.toString()}?cluster=devnet`,
      accountSize: mintInfo.data.length,
      rentPaid: totalRent / 1e9
    };
    
    const deploymentPath = path.join(__dirname, '..', 'deployment-info-ultimate.json');
    fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
    console.log(`💾 Saved: ${deploymentPath}`);
    
    return {
      success: true,
      mintAddress: mint.toString(),
      deploymentInfo
    };
    
  } catch (error) {
    console.error('❌ ULTIMATE MODE FAILED:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// CLI usage
if (require.main === module) {
  deployToken2022Ultimate()
    .then((result) => {
      if (result.success) {
        console.log('\n⚡ ULTIMATE SUCCESS! ⚡');
        console.log('🔥 Token-2022 with COMPLETE metadata deployed!');
        console.log('🎯 Check Solana Explorer for full metadata visibility!');
        process.exit(0);
      } else {
        console.log('\n❌ Ultimate mode failed!');
        process.exit(1);
      }
    })
    .catch((error) => {
      console.error('❌ Unexpected error:', error);
      process.exit(1);
    });
}

module.exports = { deployToken2022Ultimate, METADATA_CONFIG };
