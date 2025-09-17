const {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  sendAndConfirmTransaction,
  TransactionInstruction,
} = require('@solana/web3.js');

const {
  TOKEN_2022_PROGRAM_ID,
} = require('@solana/spl-token');

const fs = require('fs');
const path = require('path');

// Load deployment info
const deploymentPath = path.join(__dirname, '..', 'deployment-info-token2022.json');
const deploymentInfo = JSON.parse(fs.readFileSync(deploymentPath, 'utf8'));

const DOOM_MINT = new PublicKey(deploymentInfo.mintAddress);
const METADATA_URI = deploymentInfo.metadataUri;

// Manual metadata instruction creation for Token-2022
function createInitializeMetadataInstruction(params) {
  const keys = [
    { pubkey: params.metadata, isSigner: false, isWritable: true },
    { pubkey: params.updateAuthority, isSigner: false, isWritable: false },
    { pubkey: params.mint, isSigner: false, isWritable: false },
    { pubkey: params.mintAuthority, isSigner: true, isWritable: false },
  ];

  // Instruction discriminator for Initialize (33)
  const instructionData = Buffer.alloc(1000); // Allocate enough space
  let offset = 0;
  
  // Instruction type (33 = Initialize)
  instructionData.writeUInt8(33, offset);
  offset += 1;
  
  // Name length and data
  const nameBytes = Buffer.from(params.name, 'utf8');
  instructionData.writeUInt32LE(nameBytes.length, offset);
  offset += 4;
  nameBytes.copy(instructionData, offset);
  offset += nameBytes.length;
  
  // Symbol length and data
  const symbolBytes = Buffer.from(params.symbol, 'utf8');
  instructionData.writeUInt32LE(symbolBytes.length, offset);
  offset += 4;
  symbolBytes.copy(instructionData, offset);
  offset += symbolBytes.length;
  
  // URI length and data
  const uriBytes = Buffer.from(params.uri, 'utf8');
  instructionData.writeUInt32LE(uriBytes.length, offset);
  offset += 4;
  uriBytes.copy(instructionData, offset);
  offset += uriBytes.length;

  return new TransactionInstruction({
    keys,
    programId: params.programId,
    data: instructionData.slice(0, offset),
  });
}

async function addMetadataToToken2022() {
  console.log('📋 Adding metadata to Token-2022 mint...');
  console.log(`🪙 Mint: ${DOOM_MINT.toString()}`);
  console.log(`🔗 Metadata URI: ${METADATA_URI}`);
  
  // Connect to devnet
  const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
  
  // Load mint authority keypair
  const keypairPath = path.join(process.env.HOME, '.config/solana/id.json');
  const keypairData = JSON.parse(fs.readFileSync(keypairPath, 'utf8'));
  const mintAuthority = Keypair.fromSecretKey(new Uint8Array(keypairData));
  
  console.log(`🔑 Using mint authority: ${mintAuthority.publicKey.toString()}`);
  
  try {
    // For Token-2022, metadata is stored in the mint account itself
    const metadataAddress = DOOM_MINT;
    
    console.log(`📋 Metadata will be stored in mint account: ${metadataAddress.toString()}`);
    
    // Create metadata initialization instruction
    const initializeMetadataInstruction = createInitializeMetadataInstruction({
      programId: TOKEN_2022_PROGRAM_ID,
      metadata: metadataAddress,
      updateAuthority: mintAuthority.publicKey,
      mint: DOOM_MINT,
      mintAuthority: mintAuthority.publicKey,
      name: 'DOOM',
      symbol: 'DOOM',
      uri: METADATA_URI,
    });
    
    // Create transaction
    const transaction = new Transaction().add(initializeMetadataInstruction);
    
    console.log('📤 Sending metadata transaction...');
    const signature = await sendAndConfirmTransaction(
      connection,
      transaction,
      [mintAuthority],
      { 
        commitment: 'confirmed',
        skipPreflight: false,
        preflightCommitment: 'confirmed'
      }
    );
    
    console.log(`✅ Metadata added successfully!`);
    console.log(`🔗 Transaction: ${signature}`);
    console.log(`📋 Metadata stored in: ${metadataAddress.toString()}`);
    console.log(`🎉 Token should now show metadata in Solana Explorer!`);
    
    // Update deployment info
    deploymentInfo.metadataSignature = signature;
    deploymentInfo.metadataAddress = metadataAddress.toString();
    deploymentInfo.metadataComplete = true;
    
    fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
    console.log(`💾 Updated deployment info with metadata transaction`);
    
    return {
      success: true,
      signature,
      metadataAddress: metadataAddress.toString(),
      explorerUrl: `https://explorer.solana.com/address/${DOOM_MINT.toString()}?cluster=devnet`
    };
    
  } catch (error) {
    console.error('❌ Failed to add metadata:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// CLI usage
if (require.main === module) {
  addMetadataToToken2022()
    .then((result) => {
      if (result.success) {
        console.log('\n✅ Metadata addition completed successfully!');
        console.log(`🔍 View on Solana Explorer: ${result.explorerUrl}`);
        process.exit(0);
      } else {
        console.log('\n❌ Metadata addition failed!');
        process.exit(1);
      }
    })
    .catch((error) => {
      console.error('❌ Unexpected error:', error);
      process.exit(1);
    });
}

module.exports = { addMetadataToToken2022, DOOM_MINT, METADATA_URI };
