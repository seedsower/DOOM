const {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  sendAndConfirmTransaction,
} = require('@solana/web3.js');

// Use a simpler approach with direct instruction creation
const TOKEN_METADATA_PROGRAM_ID = new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s');

const fs = require('fs');
const path = require('path');

// Load deployment info
const deploymentPath = path.join(__dirname, '..', 'deployment-info.json');
const deploymentInfo = JSON.parse(fs.readFileSync(deploymentPath, 'utf8'));

const DOOM_MINT = new PublicKey(deploymentInfo.mintAddress);

// Metadata URI from IPFS
const METADATA_URI = 'https://apricot-occupational-boa-893.mypinata.cloud/ipfs/bafkreiaq6czfctqttd3ldziac3bow5tsjhm7fz3zmuzwtijxybpiuzccki';

async function addTokenMetadata() {
  console.log('🏷️  Adding metadata to DOOM token...');
  console.log(`📍 Token Mint: ${DOOM_MINT.toString()}`);
  console.log(`🔗 Metadata URI: ${METADATA_URI}`);
  
  // Connect to devnet
  const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
  
  // Load mint authority keypair
  const keypairPath = path.join(process.env.HOME, '.config/solana/id.json');
  const keypairData = JSON.parse(fs.readFileSync(keypairPath, 'utf8'));
  const mintAuthority = Keypair.fromSecretKey(new Uint8Array(keypairData));
  
  console.log(`🔑 Using mint authority: ${mintAuthority.publicKey.toString()}`);
  
  try {
    // Derive metadata account address
    const [metadataAccount] = PublicKey.findProgramAddressSync(
      [
        Buffer.from('metadata'),
        TOKEN_METADATA_PROGRAM_ID.toBuffer(),
        DOOM_MINT.toBuffer(),
      ],
      TOKEN_METADATA_PROGRAM_ID
    );
    
    console.log(`📋 Metadata account: ${metadataAccount.toString()}`);
    
    // Check if metadata already exists
    try {
      const existingMetadata = await connection.getAccountInfo(metadataAccount);
      if (existingMetadata) {
        console.log('⚠️  Metadata account already exists!');
        console.log('✅ Token metadata is already configured.');
        return {
          success: true,
          metadataAccount: metadataAccount.toString(),
          message: 'Metadata already exists'
        };
      }
    } catch (error) {
      // Account doesn't exist, continue with creation
    }
    
    // Create metadata instruction
    const createMetadataInstruction = createCreateMetadataAccountV3Instruction(
      {
        metadata: metadataAccount,
        mint: DOOM_MINT,
        mintAuthority: mintAuthority.publicKey,
        payer: mintAuthority.publicKey,
        updateAuthority: mintAuthority.publicKey,
      },
      {
        createMetadataAccountArgsV3: {
          data: {
            name: 'DOOM',
            symbol: 'DOOM',
            uri: METADATA_URI,
            sellerFeeBasisPoints: 0,
            creators: null,
            collection: null,
            uses: null,
          },
          isMutable: true,
          collectionDetails: null,
        },
      }
    );
    
    // Create and send transaction
    const transaction = new Transaction().add(createMetadataInstruction);
    
    console.log('📤 Sending metadata transaction...');
    const signature = await sendAndConfirmTransaction(
      connection,
      transaction,
      [mintAuthority],
      { commitment: 'confirmed' }
    );
    
    console.log(`✅ Metadata added successfully!`);
    console.log(`🔗 Transaction: ${signature}`);
    console.log(`📋 Metadata Account: ${metadataAccount.toString()}`);
    console.log(`🎉 DOOM token now has metadata with name, symbol, description, and image!`);
    
    return {
      success: true,
      signature,
      metadataAccount: metadataAccount.toString(),
      metadataUri: METADATA_URI,
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('❌ Failed to add metadata:', error);
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
