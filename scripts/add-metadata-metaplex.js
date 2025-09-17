const { Connection, Keypair, PublicKey } = require('@solana/web3.js');
const { Metaplex, keypairIdentity } = require('@metaplex-foundation/js');
const fs = require('fs');
const path = require('path');

// Load deployment info
const deploymentPath = path.join(__dirname, '..', 'deployment-info.json');
const deploymentInfo = JSON.parse(fs.readFileSync(deploymentPath, 'utf8'));

const DOOM_MINT = new PublicKey(deploymentInfo.mintAddress);
const METADATA_URI = 'https://apricot-occupational-boa-893.mypinata.cloud/ipfs/bafkreiaq6czfctqttd3ldziac3bow5tsjhm7fz3zmuzwtijxybpiuzccki';

async function addTokenMetadata() {
  console.log('🏷️  Adding metadata to DOOM token using Metaplex JS SDK...');
  console.log(`📍 Token Mint: ${DOOM_MINT.toString()}`);
  console.log(`🔗 Metadata URI: ${METADATA_URI}`);
  
  try {
    // Connect to devnet
    const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
    
    // Load mint authority keypair
    const keypairPath = path.join(process.env.HOME, '.config/solana/id.json');
    const keypairData = JSON.parse(fs.readFileSync(keypairPath, 'utf8'));
    const mintAuthority = Keypair.fromSecretKey(new Uint8Array(keypairData));
    
    console.log(`🔑 Using mint authority: ${mintAuthority.publicKey.toString()}`);
    
    // Set up Metaplex
    const metaplex = Metaplex.make(connection)
      .use(keypairIdentity(mintAuthority));
    
    // Check if metadata already exists
    try {
      const existingNft = await metaplex.nfts().findByMint({ mintAddress: DOOM_MINT });
      if (existingNft) {
        console.log('⚠️  Metadata already exists for this token!');
        console.log('✅ Token metadata is already configured.');
        console.log(`📋 Existing metadata: ${JSON.stringify(existingNft.json, null, 2)}`);
        return {
          success: true,
          message: 'Metadata already exists',
          existing: true,
          metadata: existingNft.json
        };
      }
    } catch (error) {
      // Metadata doesn't exist, continue with creation
      console.log('📝 No existing metadata found, creating new metadata...');
    }
    
    // Create metadata for existing token
    console.log('📤 Creating metadata account...');
    const { nft } = await metaplex.nfts().create({
      uri: METADATA_URI,
      name: 'DOOM',
      symbol: 'DOOM',
      sellerFeeBasisPoints: 0,
      useExistingMint: DOOM_MINT,
      updateAuthority: mintAuthority,
      mintAuthority: mintAuthority,
    });
    
    console.log(`✅ Metadata added successfully!`);
    console.log(`🔗 Transaction: ${nft.address.toString()}`);
    console.log(`📋 Metadata Account: ${nft.metadataAddress.toString()}`);
    console.log(`🎉 DOOM token now has metadata with name, symbol, description, and image!`);
    
    return {
      success: true,
      nftAddress: nft.address.toString(),
      metadataAddress: nft.metadataAddress.toString(),
      metadataUri: METADATA_URI,
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('❌ Failed to add metadata:', error.message);
    console.error('Full error:', error);
    
    return {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

// CLI usage
if (require.main === module) {
  addTokenMetadata()
    .then((result) => {
      if (result.success) {
        console.log('\n✅ Metadata operation completed successfully!');
        process.exit(0);
      } else {
        console.log('\n❌ Metadata operation failed!');
        process.exit(1);
      }
    })
    .catch((error) => {
      console.error('❌ Unexpected error:', error);
      process.exit(1);
    });
}

module.exports = { addTokenMetadata, DOOM_MINT, METADATA_URI };
