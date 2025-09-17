const {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  TransactionInstruction,
  sendAndConfirmTransaction,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
} = require('@solana/web3.js');

const { serialize } = require('borsh');
const fs = require('fs');
const path = require('path');

// Load deployment info
const deploymentPath = path.join(__dirname, '..', 'deployment-info.json');
const deploymentInfo = JSON.parse(fs.readFileSync(deploymentPath, 'utf8'));

const DOOM_MINT = new PublicKey(deploymentInfo.mintAddress);
const TOKEN_METADATA_PROGRAM_ID = new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s');

// Metadata URI from IPFS
const METADATA_URI = 'https://apricot-occupational-boa-893.mypinata.cloud/ipfs/bafkreiaq6czfctqttd3ldziac3bow5tsjhm7fz3zmuzwtijxybpiuzccki';

// Borsh schema for metadata instruction
class CreateMetadataAccountArgsV3 {
  constructor(fields) {
    this.instruction = 33; // CreateMetadataAccountV3 instruction
    this.data = fields.data;
    this.isMutable = fields.isMutable;
    this.collectionDetails = fields.collectionDetails;
  }
}

class DataV2 {
  constructor(fields) {
    this.name = fields.name;
    this.symbol = fields.symbol;
    this.uri = fields.uri;
    this.sellerFeeBasisPoints = fields.sellerFeeBasisPoints;
    this.creators = fields.creators;
    this.collection = fields.collection;
    this.uses = fields.uses;
  }
}

const METADATA_SCHEMA = new Map([
  [CreateMetadataAccountArgsV3, {
    kind: 'struct',
    fields: [
      ['instruction', 'u8'],
      ['data', DataV2],
      ['isMutable', 'u8'],
      ['collectionDetails', { kind: 'option', type: 'string' }],
    ],
  }],
  [DataV2, {
    kind: 'struct',
    fields: [
      ['name', 'string'],
      ['symbol', 'string'],
      ['uri', 'string'],
      ['sellerFeeBasisPoints', 'u16'],
      ['creators', { kind: 'option', type: ['string'] }],
      ['collection', { kind: 'option', type: 'string' }],
      ['uses', { kind: 'option', type: 'string' }],
    ],
  }],
]);

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
    
    // Create metadata data
    const metadataData = new DataV2({
      name: 'DOOM',
      symbol: 'DOOM',
      uri: METADATA_URI,
      sellerFeeBasisPoints: 0,
      creators: null,
      collection: null,
      uses: null,
    });
    
    // Create instruction args
    const args = new CreateMetadataAccountArgsV3({
      data: metadataData,
      isMutable: 1, // true
      collectionDetails: null,
    });
    
    // Serialize instruction data
    const instructionData = serialize(METADATA_SCHEMA, args);
    
    // Create instruction
    const createMetadataInstruction = new TransactionInstruction({
      keys: [
        { pubkey: metadataAccount, isSigner: false, isWritable: true },
        { pubkey: DOOM_MINT, isSigner: false, isWritable: false },
        { pubkey: mintAuthority.publicKey, isSigner: true, isWritable: false },
        { pubkey: mintAuthority.publicKey, isSigner: true, isWritable: true },
        { pubkey: mintAuthority.publicKey, isSigner: true, isWritable: false },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
        { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false },
      ],
      programId: TOKEN_METADATA_PROGRAM_ID,
      data: Buffer.from(instructionData),
    });
    
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
