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
} = require('@solana/spl-token-metadata');

const fs = require('fs');
const path = require('path');

// Metadata configuration
const METADATA_CONFIG = {
  name: 'DOOM',
  symbol: 'DOOM', 
  uri: 'https://apricot-occupational-boa-893.mypinata.cloud/ipfs/bafkreiaq6czfctqttd3ldziac3bow5tsjhm7fz3zmuzwtijxybpiuzccki',
};

async function deployToken2022Perfected() {
  console.log('⚡ PERFECTED SOLANA GOD MODE ⚡');
  console.log('🔥 Token-2022 with pre-calculated rent for metadata expansion...');
  
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
    // STEP 1: Create Token-2022 mint with MetadataPointer
    console.log('\n🚀 STEP 1: Creating Token-2022 mint...');
    
    const extensions = [ExtensionType.MetadataPointer];
    const mintLen = getMintLen(extensions);
    const mintRent = await connection.getMinimumBalanceForRentExemption(mintLen);
    
    const createMintTransaction = new Transaction().add(
      SystemProgram.createAccount({
        fromPubkey: mintAuthority.publicKey,
        newAccountPubkey: mint,
        space: mintLen,
        lamports: mintRent,
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
    
    const step1Signature = await sendAndConfirmTransaction(
      connection,
      createMintTransaction,
      [mintAuthority, mintKeypair],
      { commitment: 'confirmed' }
    );
    
    console.log(`✅ Step 1: ${step1Signature}`);
    
    // STEP 2: Add rent for metadata expansion FIRST
    console.log('\n💰 STEP 2: Pre-funding account for metadata...');
    
    // Estimate metadata size (conservative estimate)
    const estimatedMetadataSize = 
      32 + // mint pubkey
      4 + METADATA_CONFIG.name.length + // name
      4 + METADATA_CONFIG.symbol.length + // symbol  
      4 + METADATA_CONFIG.uri.length + // uri
      100; // padding for additional fields
    
    const newSize = mintLen + estimatedMetadataSize;
    const newRent = await connection.getMinimumBalanceForRentExemption(newSize);
    const currentInfo = await connection.getAccountInfo(mint);
    const additionalRent = newRent - currentInfo.lamports;
    
    console.log(`📊 Current size: ${currentInfo.data.length}, New size: ${newSize}`);
    console.log(`💰 Additional rent needed: ${additionalRent / 1e9} SOL`);
    
    if (additionalRent > 0) {
      const rentTransaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: mintAuthority.publicKey,
          toPubkey: mint,
          lamports: additionalRent,
        })
      );
      
      const rentSignature = await sendAndConfirmTransaction(
        connection,
        rentTransaction,
        [mintAuthority],
        { commitment: 'confirmed' }
      );
      
      console.log(`✅ Rent added: ${rentSignature}`);
    }
    
    // STEP 3: Initialize TokenMetadata
    console.log('\n🔥 STEP 3: Initializing TokenMetadata...');
    
    const initMetadataTransaction = new Transaction().add(
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
    
    const step3Signature = await sendAndConfirmTransaction(
      connection,
      initMetadataTransaction,
      [mintAuthority],
      { commitment: 'confirmed' }
    );
    
    console.log(`✅ Step 3: ${step3Signature}`);
    
    // STEP 4: Add essential metadata fields
    console.log('\n⚡ STEP 4: Adding metadata fields...');
    
    const essentialFields = [
      ['description', 'TOKEN OF COLLAPSE'],
      ['image', 'https://ipfs.io/ipfs/bafybeibipab7satev46lxtdjro7pqtaoscou475ugywbtosezkeyhpxmai'],
    ];
    
    const fieldSignatures = [];
    
    for (const [key, value] of essentialFields) {
      console.log(`📝 Adding: ${key}`);
      
      // Add extra rent for field expansion
      const currentInfo = await connection.getAccountInfo(mint);
      const fieldRent = Math.ceil((key.length + value.length + 20) * 0.00000348 * 1e9); // rough calculation
      
      const fieldTransaction = new Transaction();
      
      if (fieldRent > 0) {
        fieldTransaction.add(
          SystemProgram.transfer({
            fromPubkey: mintAuthority.publicKey,
            toPubkey: mint,
            lamports: fieldRent,
          })
        );
      }
      
      fieldTransaction.add(
        createUpdateFieldInstruction({
          programId: TOKEN_2022_PROGRAM_ID,
          metadata: mint,
          updateAuthority: updateAuthority.publicKey,
          field: key,
          value: value,
        })
      );
      
      const fieldSignature = await sendAndConfirmTransaction(
        connection,
        fieldTransaction,
        [mintAuthority],
        { commitment: 'confirmed' }
      );
      
      fieldSignatures.push(fieldSignature);
      console.log(`✅ Added: ${fieldSignature}`);
    }
    
    // Final verification
    console.log('\n🎯 FINAL STATUS:');
    const finalInfo = await connection.getAccountInfo(mint);
    console.log(`📊 Account size: ${finalInfo.data.length} bytes`);
    console.log(`💰 Account balance: ${finalInfo.lamports / 1e9} SOL`);
    console.log(`🌐 Explorer: https://explorer.solana.com/address/${mint.toString()}?cluster=devnet`);
    
    // Save deployment info
    const deploymentInfo = {
      mintAddress: mint.toString(),
      mintAuthority: mintAuthority.publicKey.toString(),
      updateAuthority: updateAuthority.publicKey.toString(),
      decimals: 9,
      totalSupply: 0,
      signatures: {
        createMint: step1Signature,
        initMetadata: step3Signature,
        fields: fieldSignatures,
      },
      tokenProgram: 'Token-2022',
      extensions: ['MetadataPointer', 'TokenMetadata'],
      version: 'v8-perfected',
      timestamp: new Date().toISOString(),
      network: 'devnet',
      metadata: {
        ...METADATA_CONFIG,
        additionalFields: essentialFields,
      },
      explorerUrl: `https://explorer.solana.com/address/${mint.toString()}?cluster=devnet`,
      accountSize: finalInfo.data.length,
      rentPaid: finalInfo.lamports / 1e9
    };
    
    const deploymentPath = path.join(__dirname, '..', 'deployment-info-perfected.json');
    fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
    console.log(`💾 Saved: ${deploymentPath}`);
    
    return {
      success: true,
      mintAddress: mint.toString(),
      deploymentInfo
    };
    
  } catch (error) {
    console.error('❌ PERFECTED APPROACH FAILED:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// CLI usage
if (require.main === module) {
  deployToken2022Perfected()
    .then((result) => {
      if (result.success) {
        console.log('\n⚡ SOLANA GOD MODE PERFECTED! ⚡');
        console.log('🔥 Token-2022 with metadata SUCCESSFULLY deployed!');
        console.log('🎯 Check Solana Explorer - metadata should be fully visible!');
        process.exit(0);
      } else {
        console.log('\n❌ Perfected approach failed!');
        process.exit(1);
      }
    })
    .catch((error) => {
      console.error('❌ Unexpected error:', error);
      process.exit(1);
    });
}

module.exports = { deployToken2022Perfected, METADATA_CONFIG };
