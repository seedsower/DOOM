const {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  sendAndConfirmTransaction,
} = require('@solana/web3.js');

const {
  TOKEN_PROGRAM_ID,
  createMintToInstruction,
  createAssociatedTokenAccountInstruction,
  getAssociatedTokenAddress,
} = require('@solana/spl-token');

const fs = require('fs');
const path = require('path');

// Load deployment info
const deploymentPath = path.join(__dirname, '..', 'deployment-info-v2.json');
const deploymentInfo = JSON.parse(fs.readFileSync(deploymentPath, 'utf8'));

const DOOM_MINT = new PublicKey(deploymentInfo.mintAddress);

async function mintDoomTokensV2(recipientAddress, amount = 734) {
  console.log('🪙 Minting DOOM tokens V2...');
  console.log(`📍 Token Mint: ${DOOM_MINT.toString()}`);
  console.log(`👤 Recipient: ${recipientAddress}`);
  console.log(`💰 Amount: ${amount} tokens`);
  
  // Connect to devnet
  const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
  
  // Load mint authority keypair
  const keypairPath = path.join(process.env.HOME, '.config/solana/id.json');
  const keypairData = JSON.parse(fs.readFileSync(keypairPath, 'utf8'));
  const mintAuthority = Keypair.fromSecretKey(new Uint8Array(keypairData));
  
  console.log(`🔑 Using mint authority: ${mintAuthority.publicKey.toString()}`);
  
  try {
    const recipient = new PublicKey(recipientAddress);
    
    // Get or create associated token account
    const recipientTokenAccount = await getAssociatedTokenAddress(
      DOOM_MINT,
      recipient,
      false,
      TOKEN_PROGRAM_ID
    );
    
    console.log(`🏦 Token Account: ${recipientTokenAccount.toString()}`);
    
    // Check if token account exists
    let accountExists = false;
    try {
      await connection.getAccountInfo(recipientTokenAccount);
      accountExists = true;
      console.log('✅ Token account already exists');
    } catch (error) {
      console.log('📦 Creating new token account...');
    }
    
    const instructions = [];
    
    // Create token account if it doesn't exist
    if (!accountExists) {
      const createAccountInstruction = createAssociatedTokenAccountInstruction(
        mintAuthority.publicKey,
        recipientTokenAccount,
        recipient,
        DOOM_MINT,
        TOKEN_PROGRAM_ID
      );
      instructions.push(createAccountInstruction);
    }
    
    // Mint tokens
    const mintInstruction = createMintToInstruction(
      DOOM_MINT,
      recipientTokenAccount,
      mintAuthority.publicKey,
      amount * Math.pow(10, deploymentInfo.decimals), // Convert to token units
      [],
      TOKEN_PROGRAM_ID
    );
    instructions.push(mintInstruction);
    
    // Create and send transaction
    const transaction = new Transaction().add(...instructions);
    
    console.log('📤 Sending mint transaction...');
    const signature = await sendAndConfirmTransaction(
      connection,
      transaction,
      [mintAuthority],
      { commitment: 'confirmed' }
    );
    
    console.log(`✅ Successfully minted ${amount} DOOM tokens!`);
    console.log(`🔗 Transaction: ${signature}`);
    console.log(`🎉 Recipient now has DOOM tokens for bunker access!`);
    
    return {
      success: true,
      signature,
      amount,
      recipient: recipientAddress,
      tokenAccount: recipientTokenAccount.toString()
    };
    
  } catch (error) {
    console.error('❌ Failed to mint tokens:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// CLI usage
if (require.main === module) {
  const recipientAddress = process.argv[2];
  const amount = parseInt(process.argv[3]) || 734;
  
  if (!recipientAddress) {
    console.error('Usage: node mint-tokens-v2.js <recipient-address> [amount]');
    process.exit(1);
  }
  
  mintDoomTokensV2(recipientAddress, amount)
    .then((result) => {
      if (result.success) {
        console.log('\n✅ Token minting completed successfully!');
        process.exit(0);
      } else {
        console.log('\n❌ Token minting failed!');
        process.exit(1);
      }
    })
    .catch((error) => {
      console.error('❌ Unexpected error:', error);
      process.exit(1);
    });
}

module.exports = { mintDoomTokensV2, DOOM_MINT };
