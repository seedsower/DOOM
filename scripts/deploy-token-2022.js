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
  createInitializeInstruction,
  getMintLen,
  ExtensionType,
} = require('@solana/spl-token');

const {
  createInitializeInstruction: createInitializeMetadataInstruction,
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
    // Token metadata
    const metadata = {
      updateAuthority: mintAuthority.publicKey,
      mint: mint,
      name: 'DOOM',
      symbol: 'DOOM',
      uri: METADATA_URI,
      additionalMetadata: [
        ['description', 'TOKEN OF COLLAPSE'],
      ],
    };
    
    // Calculate space needed for mint account with extensions
    const metadataLen = pack(metadata).length;
    const extensions = [ExtensionType.MetadataPointer];
    const mintLen = getMintLen(extensions) + metadataLen;
    
    // Calculate rent
    const mintRent = await connection.getMinimumBalanceForRentExemption(mintLen);
    
    console.log('📦 Creating mint account with metadata extension...');
    
    // Create mint account
    const createAccountInstruction = SystemProgram.createAccount({
      fromPubkey: mintAuthority.publicKey,
      newAccountPubkey: mint,
      space: mintLen,
      lamports: mintRent,
      programId: TOKEN_2022_PROGRAM_ID,
    });
    
    // Initialize metadata pointer (points to the mint itself)
    const initializeMetadataPointerInstruction = createInitializeMetadataPointerInstruction(
      mint,
      mintAuthority.publicKey,
      mint, // metadata address (same as mint for Token-2022)
      TOKEN_2022_PROGRAM_ID,
    );
    
    // Initialize mint
    const initializeMintInstruction = createInitializeMintInstruction(
      mint,
      9, // decimals
      mintAuthority.publicKey,
      null, // freeze authority
      TOKEN_2022_PROGRAM_ID,
    );
    
    // Initialize metadata
    const initializeMetadataInstruction = createInitializeMetadataInstruction({
      programId: TOKEN_2022_PROGRAM_ID,
      metadata: mint,
      updateAuthority: mintAuthority.publicKey,
      mint: mint,
      mintAuthority: mintAuthority.publicKey,
      name: metadata.name,
      symbol: metadata.symbol,
      uri: metadata.uri,
    });
    
    // Create transaction
    const transaction = new Transaction().add(
      createAccountInstruction,
      initializeMetadataPointerInstruction,
      initializeMintInstruction,
      initializeMetadataInstruction,
    );
    
    console.log('📤 Sending transaction...');
    const signature = await sendAndConfirmTransaction(
      connection,
      transaction,
      [mintAuthority, mintKeypair],
      { commitment: 'confirmed' }
    );
    
    console.log(`✅ DOOM Token-2022 deployed successfully!`);
    console.log(`🪙 Mint Address: ${mint.toString()}`);
    console.log(`🔗 Transaction: ${signature}`);
    console.log(`📋 Metadata: Built-in with Token-2022`);
    console.log(`🎉 Token has native metadata support!`);
    
    // Save deployment info
    const deploymentInfo = {
      mintAddress: mint.toString(),
      mintAuthority: mintAuthority.publicKey.toString(),
      decimals: 9,
      totalSupply: 0,
      deploymentSignature: signature,
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
      signature,
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
