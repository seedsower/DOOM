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
  TokenMetadata,
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

async function deployToken2022WithFullMetadata() {
  console.log('🔥 SOLANA GOD MODE: Deploying Token-2022 with FULL metadata...');
  console.log(`📋 Token: ${METADATA_CONFIG.name} (${METADATA_CONFIG.symbol})`);
  console.log(`🔗 Metadata URI: ${METADATA_CONFIG.uri}`);
  
  // Connect to devnet
  const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
  
  // Load mint authority keypair
  const keypairPath = path.join(process.env.HOME, '.config/solana/id.json');
  const keypairData = JSON.parse(fs.readFileSync(keypairPath, 'utf8'));
  const mintAuthority = Keypair.fromSecretKey(new Uint8Array(keypairData));
  const updateAuthority = mintAuthority; // Same authority for updates
  
  console.log(`🔑 Using authorities: ${mintAuthority.publicKey.toString()}`);
  
  // Generate new mint keypair
  const mintKeypair = Keypair.generate();
  const mint = mintKeypair.publicKey;
  
  console.log(`🪙 New mint address: ${mint.toString()}`);
  
  try {
    // Calculate space for mint with BOTH extensions
    const extensions = [ExtensionType.MetadataPointer];
    const mintLen = getMintLen(extensions);
    
    // Calculate additional space needed for metadata
    const metadataLen = pack({
      mint: mint,
      name: METADATA_CONFIG.name,
      symbol: METADATA_CONFIG.symbol, 
      uri: METADATA_CONFIG.uri,
      additionalMetadata: METADATA_CONFIG.additionalMetadata,
    }).length;
    
    const totalLen = mintLen + metadataLen;
    
    // Calculate rent for total space
    const lamports = await connection.getMinimumBalanceForRentExemption(totalLen);
    
    console.log(`📦 Account space: ${totalLen} bytes (${mintLen} mint + ${metadataLen} metadata)`);
    console.log(`💰 Rent required: ${lamports / 1e9} SOL`);
    
    // Build all instructions
    const instructions = [];
    
    // 1. Create account
    instructions.push(
      SystemProgram.createAccount({
        fromPubkey: mintAuthority.publicKey,
        newAccountPubkey: mint,
        space: totalLen,
        lamports,
        programId: TOKEN_2022_PROGRAM_ID,
      })
    );
    
    // 2. Initialize MetadataPointer extension
    instructions.push(
      createInitializeMetadataPointerInstruction(
        mint, // mint
        updateAuthority.publicKey, // authority  
        mint, // metadata address (same as mint)
        TOKEN_2022_PROGRAM_ID
      )
    );
    
    // 3. Initialize mint
    instructions.push(
      createInitializeMintInstruction(
        mint, // mint
        9, // decimals
        mintAuthority.publicKey, // mint authority
        null, // freeze authority
        TOKEN_2022_PROGRAM_ID
      )
    );
    
    // 4. Initialize TokenMetadata extension
    instructions.push(
      createInitializeInstruction({
        programId: TOKEN_2022_PROGRAM_ID, // Token Extension Program as Metadata Program
        metadata: mint, // Account address that holds the metadata
        updateAuthority: updateAuthority.publicKey, // Authority that can update the metadata
        mint: mint, // Mint Account address
        mintAuthority: mintAuthority.publicKey, // Designated Mint Authority
        name: METADATA_CONFIG.name,
        symbol: METADATA_CONFIG.symbol,
        uri: METADATA_CONFIG.uri,
      })
    );
    
    // 5. Add custom metadata fields
    for (const [key, value] of METADATA_CONFIG.additionalMetadata) {
      instructions.push(
        createUpdateFieldInstruction({
          programId: TOKEN_2022_PROGRAM_ID,
          metadata: mint,
          updateAuthority: updateAuthority.publicKey,
          field: key,
          value: value,
        })
      );
    }
    
    // Create and send transaction
    const transaction = new Transaction().add(...instructions);
    
    console.log(`📤 Sending transaction with ${instructions.length} instructions...`);
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
    
    console.log(`✅ DOOM Token-2022 deployed with FULL metadata!`);
    console.log(`🪙 Mint Address: ${mint.toString()}`);
    console.log(`🔗 Transaction: ${signature}`);
    console.log(`🎯 Solana Explorer: https://explorer.solana.com/address/${mint.toString()}?cluster=devnet`);
    
    // Verify metadata
    console.log(`🔍 Verifying on-chain metadata...`);
    const mintInfo = await connection.getAccountInfo(mint);
    console.log(`📊 Account size: ${mintInfo.data.length} bytes`);
    console.log(`🏷️ Extensions: MetadataPointer + TokenMetadata`);
    
    // Save deployment info
    const deploymentInfo = {
      mintAddress: mint.toString(),
      mintAuthority: mintAuthority.publicKey.toString(),
      updateAuthority: updateAuthority.publicKey.toString(),
      decimals: 9,
      totalSupply: 0,
      deploymentSignature: signature,
      tokenProgram: 'Token-2022',
      extensions: ['MetadataPointer', 'TokenMetadata'],
      version: 'v4-full-metadata',
      timestamp: new Date().toISOString(),
      network: 'devnet',
      metadata: METADATA_CONFIG,
      explorerUrl: `https://explorer.solana.com/address/${mint.toString()}?cluster=devnet`
    };
    
    const deploymentPath = path.join(__dirname, '..', 'deployment-info-token2022-full.json');
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
  deployToken2022WithFullMetadata()
    .then((result) => {
      if (result.success) {
        console.log('\n🔥 SOLANA GOD MODE SUCCESS!');
        console.log('✅ Token-2022 with FULL metadata deployed!');
        console.log('🎯 Check Solana Explorer - metadata should be visible!');
        process.exit(0);
      } else {
        console.log('\n❌ Deployment failed!');
        process.exit(1);
      }
    })
    .catch((error) => {
      console.error('❌ Unexpected error:', error);
      process.exit(1);
    });
}

module.exports = { deployToken2022WithFullMetadata, METADATA_CONFIG };
