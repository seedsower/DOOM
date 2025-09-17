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
  TokenMetadata,
} = require('@solana/spl-token-metadata');

const fs = require('fs');
const path = require('path');

// Metadata URI from IPFS
const METADATA_URI = 'https://apricot-occupational-boa-893.mypinata.cloud/ipfs/bafkreiaq6czfctqttd3ldziac3bow5tsjhm7fz3zmuzwtijxybpiuzccki';

async function deployDoomToken2022() {
  console.log('🚀 Deploying DOOM token with Token-2022 and metadata...');
  console.log(`🔗 Metadata URI: ${METADATA_URI}`);
  
  // Connect to devnet
  const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
  
  // Load mint authority keypair
  const keypairPath = path.join(process.env.HOME, '.config/solana/id.json');
  const keypairData = JSON.parse(fs.readFileSync(keypairPath, 'utf8'));
  const mintAuthority = Keypair.fromSecretKey(new Uint8Array(keypairData));
  
  console.log(`🔑 Using mint authority: ${mintAuthority.publicKey.toString()}`);
  
  // Generate new mint keypair
  const mintKeypair = Keypair.generate();
  const mint = mintKeypair.publicKey;
  
  console.log(`🪙 New mint address: ${mint.toString()}`);
  
  try {
    // Step 1: Create mint account with metadata pointer extension
    const extensions = [ExtensionType.MetadataPointer];
    const mintLen = getMintLen(extensions);
    const mintRent = await connection.getMinimumBalanceForRentExemption(mintLen);
    
    console.log('📦 Creating mint account with metadata pointer...');
    
    const createAccountInstruction = SystemProgram.createAccount({
      fromPubkey: mintAuthority.publicKey,
      newAccountPubkey: mint,
      space: mintLen,
      lamports: mintRent,
      programId: TOKEN_2022_PROGRAM_ID,
    });
    
    const initializeMetadataPointerInstruction = createInitializeMetadataPointerInstruction(
      mint,
      mintAuthority.publicKey,
      mint, // metadata address (same as mint)
      TOKEN_2022_PROGRAM_ID,
    );
    
    const initializeMintInstruction = createInitializeMintInstruction(
      mint,
      9, // decimals
      mintAuthority.publicKey,
      null, // freeze authority
      TOKEN_2022_PROGRAM_ID,
    );
    
    const transaction1 = new Transaction().add(
      createAccountInstruction,
      initializeMetadataPointerInstruction,
      initializeMintInstruction,
    );
    
    console.log('📤 Sending mint creation transaction...');
    const signature1 = await sendAndConfirmTransaction(
      connection,
      transaction1,
      [mintAuthority, mintKeypair],
      { commitment: 'confirmed' }
    );
    
    console.log(`✅ Mint created: ${signature1}`);
    
    // Step 2: Initialize metadata
    console.log('📋 Adding metadata to token...');
    
    const initializeMetadataInstruction = createInitializeInstruction({
      programId: TOKEN_2022_PROGRAM_ID,
      metadata: mint,
      updateAuthority: mintAuthority.publicKey,
      mint: mint,
      mintAuthority: mintAuthority.publicKey,
      name: 'DOOM',
      symbol: 'DOOM',
      uri: METADATA_URI,
    });
    
    const transaction2 = new Transaction().add(initializeMetadataInstruction);
    
    console.log('📤 Sending metadata transaction...');
    const signature2 = await sendAndConfirmTransaction(
      connection,
      transaction2,
      [mintAuthority],
      { commitment: 'confirmed' }
    );
    
    console.log(`✅ DOOM Token-2022 deployed successfully!`);
    console.log(`🪙 Mint Address: ${mint.toString()}`);
    console.log(`🔗 Mint Transaction: ${signature1}`);
    console.log(`🔗 Metadata Transaction: ${signature2}`);
    console.log(`📋 Metadata: Built-in with Token-2022`);
    console.log(`🎉 Token has native metadata support!`);
    
    // Save deployment info
    const deploymentInfo = {
      mintAddress: mint.toString(),
      mintAuthority: mintAuthority.publicKey.toString(),
      decimals: 9,
      totalSupply: 0,
      mintSignature: signature1,
      metadataSignature: signature2,
      metadataUri: METADATA_URI,
      tokenProgram: 'Token-2022',
      timestamp: new Date().toISOString(),
      network: 'devnet'
    };
    
    const deploymentPath = path.join(__dirname, '..', 'deployment-info-2022.json');
    fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
    console.log(`💾 Deployment info saved to: ${deploymentPath}`);
    
    return {
      success: true,
      mintAddress: mint.toString(),
      mintSignature: signature1,
      metadataSignature: signature2,
      deploymentInfo
    };
    
  } catch (error) {
    console.error('❌ Failed to deploy token:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// CLI usage
if (require.main === module) {
  deployDoomToken2022()
    .then((result) => {
      if (result.success) {
        console.log('\n✅ Token deployment completed successfully!');
        process.exit(0);
      } else {
        console.log('\n❌ Token deployment failed!');
        process.exit(1);
      }
    })
    .catch((error) => {
      console.error('❌ Unexpected error:', error);
      process.exit(1);
    });
}

module.exports = { deployDoomToken2022, METADATA_URI };
