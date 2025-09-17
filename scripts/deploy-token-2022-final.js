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

async function deployToken2022Final() {
  console.log('⚡ FINAL SOLANA GOD MODE APPROACH ⚡');
  console.log('🔥 Using correct Token-2022 metadata initialization sequence...');
  
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
    // STEP 1: Create basic Token-2022 mint with MetadataPointer
    console.log('\n🚀 STEP 1: Creating Token-2022 mint with MetadataPointer...');
    
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
        mint, // metadata stored in mint account
        TOKEN_2022_PROGRAM_ID
      ),
      createInitializeMintInstruction(
        mint,
        9, // decimals
        mintAuthority.publicKey,
        null, // freeze authority
        TOKEN_2022_PROGRAM_ID
      )
    );
    
    const step1Signature = await sendAndConfirmTransaction(
      connection,
      createMintTransaction,
      [mintAuthority, mintKeypair],
      { commitment: 'confirmed' }
    );
    
    console.log(`✅ Step 1 complete: ${step1Signature}`);
    
    // STEP 2: Initialize TokenMetadata extension
    console.log('\n🔥 STEP 2: Initializing TokenMetadata...');
    
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
    
    const step2Signature = await sendAndConfirmTransaction(
      connection,
      initMetadataTransaction,
      [mintAuthority],
      { commitment: 'confirmed' }
    );
    
    console.log(`✅ Step 2 complete: ${step2Signature}`);
    
    // STEP 3: Add individual metadata fields with proper rent handling
    console.log('\n⚡ STEP 3: Adding metadata fields...');
    
    const additionalFields = [
      ['description', 'TOKEN OF COLLAPSE'],
      ['image', 'https://ipfs.io/ipfs/bafybeibipab7satev46lxtdjro7pqtaoscou475ugywbtosezkeyhpxmai'],
      ['external_url', 'https://doom-protocol.netlify.app'],
    ];
    
    const fieldSignatures = [];
    
    for (const [key, value] of additionalFields) {
      console.log(`📝 Adding field: ${key}`);
      
      // Check current account size and calculate rent needed
      const currentInfo = await connection.getAccountInfo(mint);
      const currentSize = currentInfo.data.length;
      
      // Estimate new size (rough calculation)
      const estimatedNewSize = currentSize + key.length + value.length + 10; // padding
      const newRent = await connection.getMinimumBalanceForRentExemption(estimatedNewSize);
      const additionalRent = Math.max(0, newRent - currentInfo.lamports);
      
      const fieldTransaction = new Transaction();
      
      // Add rent if needed
      if (additionalRent > 0) {
        console.log(`💰 Adding ${additionalRent / 1e9} SOL rent for field expansion`);
        fieldTransaction.add(
          SystemProgram.transfer({
            fromPubkey: mintAuthority.publicKey,
            toPubkey: mint,
            lamports: additionalRent,
          })
        );
      }
      
      // Add the field
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
      console.log(`✅ Field added: ${fieldSignature}`);
    }
    
    // Final verification
    console.log('\n🎯 VERIFICATION:');
    const finalInfo = await connection.getAccountInfo(mint);
    console.log(`📊 Final account size: ${finalInfo.data.length} bytes`);
    console.log(`💰 Final balance: ${finalInfo.lamports / 1e9} SOL`);
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
        initMetadata: step2Signature,
        fields: fieldSignatures,
      },
      tokenProgram: 'Token-2022',
      extensions: ['MetadataPointer', 'TokenMetadata'],
      version: 'v7-final',
      timestamp: new Date().toISOString(),
      network: 'devnet',
      metadata: {
        ...METADATA_CONFIG,
        additionalFields: additionalFields,
      },
      explorerUrl: `https://explorer.solana.com/address/${mint.toString()}?cluster=devnet`,
      accountSize: finalInfo.data.length,
      rentPaid: finalInfo.lamports / 1e9
    };
    
    const deploymentPath = path.join(__dirname, '..', 'deployment-info-final.json');
    fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
    console.log(`💾 Saved: ${deploymentPath}`);
    
    return {
      success: true,
      mintAddress: mint.toString(),
      deploymentInfo
    };
    
  } catch (error) {
    console.error('❌ FINAL APPROACH FAILED:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// CLI usage
if (require.main === module) {
  deployToken2022Final()
    .then((result) => {
      if (result.success) {
        console.log('\n⚡ SOLANA GOD MODE VICTORY! ⚡');
        console.log('🔥 Token-2022 with metadata successfully deployed!');
        console.log('🎯 Metadata should now be visible in Solana Explorer!');
        process.exit(0);
      } else {
        console.log('\n❌ Final approach failed!');
        process.exit(1);
      }
    })
    .catch((error) => {
      console.error('❌ Unexpected error:', error);
      process.exit(1);
    });
}

module.exports = { deployToken2022Final, METADATA_CONFIG };
