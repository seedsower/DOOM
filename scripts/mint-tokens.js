const {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  sendAndConfirmTransaction,
} = require('@solana/web3.js');

const {
  mintTo,
  getOrCreateAssociatedTokenAccount,
  createAssociatedTokenAccountInstruction,
  getAssociatedTokenAddress,
} = require('@solana/spl-token');

const fs = require('fs');
const path = require('path');

// Load deployment info
const deploymentPath = path.join(__dirname, '..', 'deployment-info.json');
const deploymentInfo = JSON.parse(fs.readFileSync(deploymentPath, 'utf8'));

const DOOM_MINT = new PublicKey(deploymentInfo.mintAddress);
const CLAIM_AMOUNT = 734; // DOOM tokens per claim
const DECIMALS = 9;

async function mintTokensToWallet(recipientWallet, amount = CLAIM_AMOUNT) {
  console.log(`🪙 Minting ${amount} DOOM tokens to ${recipientWallet}`);
  
  // Connect to devnet
  const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
  
  // Load mint authority keypair
  const keypairPath = path.join(process.env.HOME, '.config/solana/id.json');
  const keypairData = JSON.parse(fs.readFileSync(keypairPath, 'utf8'));
  const mintAuthority = Keypair.fromSecretKey(new Uint8Array(keypairData));
  
  console.log(`🔑 Using mint authority: ${mintAuthority.publicKey.toString()}`);
  
  // Convert recipient address to PublicKey
  const recipientPublicKey = new PublicKey(recipientWallet);
  
  try {
    // Get or create associated token account for recipient
    console.log('📋 Getting/creating token account...');
    const recipientTokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      mintAuthority, // payer
      DOOM_MINT,
      recipientPublicKey
    );
    
    console.log(`✅ Token account: ${recipientTokenAccount.address.toString()}`);
    
    // Calculate mint amount (convert to smallest unit)
    const mintAmount = amount * Math.pow(10, DECIMALS);
    
    // Mint tokens
    console.log(`🏭 Minting ${amount} DOOM tokens...`);
    const signature = await mintTo(
      connection,
      mintAuthority,
      DOOM_MINT,
      recipientTokenAccount.address,
      mintAuthority.publicKey,
      mintAmount
    );
    
    console.log(`✅ Mint successful! Transaction: ${signature}`);
    console.log(`🎉 ${amount} DOOM tokens minted to ${recipientWallet}`);
    
    return {
      success: true,
      signature,
      recipientWallet,
      tokenAccount: recipientTokenAccount.address.toString(),
      amount,
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('❌ Minting failed:', error);
    return {
      success: false,
      error: error.message,
      recipientWallet,
      amount,
      timestamp: new Date().toISOString()
    };
  }
}

// CLI usage
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Usage: node mint-tokens.js <recipient-wallet> [amount]');
    console.log('Example: node mint-tokens.js 9uN3Vw5DouX6sdFbfJt6WDHZSrRo67P7dnKNNLuEHcnT 734');
    process.exit(1);
  }
  
  const recipientWallet = args[0];
  const amount = args[1] ? parseInt(args[1]) : CLAIM_AMOUNT;
  
  mintTokensToWallet(recipientWallet, amount)
    .then((result) => {
      if (result.success) {
        console.log('\n✅ Minting completed successfully!');
        process.exit(0);
      } else {
        console.log('\n❌ Minting failed!');
        process.exit(1);
      }
    })
    .catch((error) => {
      console.error('❌ Unexpected error:', error);
      process.exit(1);
    });
}

module.exports = { mintTokensToWallet, DOOM_MINT, CLAIM_AMOUNT };
