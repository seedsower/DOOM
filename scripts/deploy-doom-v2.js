const {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  sendAndConfirmTransaction,
  SystemProgram,
} = require('@solana/web3.js');

const {
  TOKEN_PROGRAM_ID,
  createInitializeMintInstruction,
  createMintToInstruction,
  createAssociatedTokenAccountInstruction,
  getAssociatedTokenAddress,
  getMintLen,
} = require('@solana/spl-token');

const fs = require('fs');
const path = require('path');

// Metadata URI from IPFS
const METADATA_URI = 'https://apricot-occupational-boa-893.mypinata.cloud/ipfs/bafkreiaq6czfctqttd3ldziac3bow5tsjhm7fz3zmuzwtijxybpiuzccki';

async function deployDoomTokenV2() {
  console.log('🚀 Deploying DOOM Token V2 with off-chain metadata...');
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
    // Calculate space and rent for mint account
    const mintLen = getMintLen([]);
    const mintRent = await connection.getMinimumBalanceForRentExemption(mintLen);
    
    console.log('📦 Creating mint account...');
    
    // Create mint account
    const createAccountInstruction = SystemProgram.createAccount({
      fromPubkey: mintAuthority.publicKey,
      newAccountPubkey: mint,
      space: mintLen,
      lamports: mintRent,
      programId: TOKEN_PROGRAM_ID,
    });
    
    // Initialize mint
    const initializeMintInstruction = createInitializeMintInstruction(
      mint,
      9, // decimals
      mintAuthority.publicKey,
      null, // freeze authority
      TOKEN_PROGRAM_ID,
    );
    
    // Create transaction
    const transaction = new Transaction().add(
      createAccountInstruction,
      initializeMintInstruction,
    );
    
    console.log('📤 Sending transaction...');
    const signature = await sendAndConfirmTransaction(
      connection,
      transaction,
      [mintAuthority, mintKeypair],
      { commitment: 'confirmed' }
    );
    
    console.log(`✅ DOOM Token V2 deployed successfully!`);
    console.log(`🪙 Mint Address: ${mint.toString()}`);
    console.log(`🔗 Transaction: ${signature}`);
    console.log(`📋 Metadata: Off-chain registry`);
    console.log(`🎉 Token ready for use!`);
    
    // Save deployment info
    const deploymentInfo = {
      mintAddress: mint.toString(),
      mintAuthority: mintAuthority.publicKey.toString(),
      decimals: 9,
      totalSupply: 0,
      deploymentSignature: signature,
      metadataUri: METADATA_URI,
      tokenProgram: 'SPL Token',
      version: 'v2',
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
    
    const deploymentPath = path.join(__dirname, '..', 'deployment-info-v2.json');
    fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
    console.log(`💾 Deployment info saved to: ${deploymentPath}`);
    
    // Create metadata registry file for the frontend
    const metadataRegistry = {
      [mint.toString()]: {
        name: 'DOOM',
        symbol: 'DOOM',
        description: 'TOKEN OF COLLAPSE',
        image: 'https://ipfs.io/ipfs/bafybeibipab7satev46lxtdjro7pqtaoscou475ugywbtosezkeyhpxmai',
        uri: METADATA_URI,
        decimals: 9,
        tags: ['doom', 'protocol', 'collapse', 'literary'],
        version: 'v2'
      }
    };
    
    const registryPath = path.join(__dirname, '..', 'src', 'lib', 'token-registry.json');
    fs.writeFileSync(registryPath, JSON.stringify(metadataRegistry, null, 2));
    console.log(`📋 Token registry created at: ${registryPath}`);
    
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
  deployDoomTokenV2()
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

module.exports = { deployDoomTokenV2, METADATA_URI };
