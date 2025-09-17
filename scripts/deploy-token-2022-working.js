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
  TYPE_SIZE,
  LENGTH_SIZE,
} = require('@solana/spl-token');

const fs = require('fs');
const path = require('path');

// Metadata URI from IPFS
const METADATA_URI = 'https://apricot-occupational-boa-893.mypinata.cloud/ipfs/bafkreiaq6czfctqttd3ldziac3bow5tsjhm7fz3zmuzwtijxybpiuzccki';

async function deployToken2022WithMetadata() {
  console.log('🚀 Deploying Token-2022 with native metadata extensions...');
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
    // Calculate space for mint with metadata pointer extension
    const extensions = [ExtensionType.MetadataPointer];
    const mintLen = getMintLen(extensions);
    
    // Calculate rent
    const mintRent = await connection.getMinimumBalanceForRentExemption(mintLen);
    
    console.log(`📦 Creating mint account (${mintLen} bytes, ${mintRent / 1e9} SOL rent)...`);
    
    // Create mint account
    const createAccountInstruction = SystemProgram.createAccount({
      fromPubkey: mintAuthority.publicKey,
      newAccountPubkey: mint,
      space: mintLen,
      lamports: mintRent,
      programId: TOKEN_2022_PROGRAM_ID,
    });
    
    // Initialize metadata pointer extension
    const initializeMetadataPointerInstruction = createInitializeMetadataPointerInstruction(
      mint, // mint
      mintAuthority.publicKey, // authority
      mint, // metadata address (same as mint for Token-2022)
      TOKEN_2022_PROGRAM_ID
    );
    
    // Initialize mint
    const initializeMintInstruction = createInitializeMintInstruction(
      mint, // mint
      9, // decimals
      mintAuthority.publicKey, // mint authority
      null, // freeze authority
      TOKEN_2022_PROGRAM_ID
    );
    
    // Create transaction
    const transaction = new Transaction().add(
      createAccountInstruction,
      initializeMetadataPointerInstruction,
      initializeMintInstruction
    );
    
    console.log('📤 Sending mint creation transaction...');
    const signature = await sendAndConfirmTransaction(
      connection,
      transaction,
      [mintAuthority, mintKeypair],
      { 
        commitment: 'confirmed',
        skipPreflight: false,
        preflightCommitment: 'confirmed'
      }
    );
    
    console.log(`✅ Token-2022 mint created successfully!`);
    console.log(`🪙 Mint Address: ${mint.toString()}`);
    console.log(`🔗 Transaction: ${signature}`);
    console.log(`📋 Metadata Pointer: Enabled (points to mint account)`);
    
    // Now we need to add the actual metadata using a separate transaction
    // This requires the @solana/spl-token-metadata package which had issues
    // For now, we have a working Token-2022 mint with metadata pointer
    
    console.log(`🎉 Token-2022 deployed with metadata pointer extension!`);
    console.log(`⚠️  Note: Metadata content needs to be added separately`);
    
    // Save deployment info
    const deploymentInfo = {
      mintAddress: mint.toString(),
      mintAuthority: mintAuthority.publicKey.toString(),
      decimals: 9,
      totalSupply: 0,
      deploymentSignature: signature,
      metadataUri: METADATA_URI,
      tokenProgram: 'Token-2022',
      extensions: ['MetadataPointer'],
      version: 'v3-token2022',
      timestamp: new Date().toISOString(),
      network: 'devnet',
      metadata: {
        name: 'DOOM',
        symbol: 'DOOM',
        description: 'TOKEN OF COLLAPSE',
        image: 'https://ipfs.io/ipfs/bafybeibipab7satev46lxtdjro7pqtaoscou475ugywbtosezkeyhpxmai',
        uri: METADATA_URI
      }
    };
    
    const deploymentPath = path.join(__dirname, '..', 'deployment-info-token2022.json');
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
  deployToken2022WithMetadata()
    .then((result) => {
      if (result.success) {
        console.log('\n✅ Token-2022 deployment completed successfully!');
        console.log('🔍 Check Solana Explorer to see the Token-2022 mint with extensions');
        process.exit(0);
      } else {
        console.log('\n❌ Token-2022 deployment failed!');
        process.exit(1);
      }
    })
    .catch((error) => {
      console.error('❌ Unexpected error:', error);
      process.exit(1);
    });
}

module.exports = { deployToken2022WithMetadata, METADATA_URI };
