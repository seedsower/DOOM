const { Connection, PublicKey, Keypair, Transaction } = require('@solana/web3.js');
const { 
  mintTo, 
  getOrCreateAssociatedTokenAccount,
  TOKEN_2022_PROGRAM_ID
} = require('@solana/spl-token');
const fs = require('fs');
const path = require('path');

// Mainnet configuration
const DOOM_MINT_ADDRESS = '48RRMbPXK1uuzJCo66yTVgRSZGARqSpE7FdXupwBbWoD';
const RPC_URL = 'https://api.mainnet-beta.solana.com';
const CLAIM_AMOUNT = 734; // DOOM tokens per claim

// Load mint authority keypair
function loadMintAuthority() {
  try {
    const keypairPath = path.join(process.env.HOME, '.config', 'solana', 'id.json');
    const keypairData = JSON.parse(fs.readFileSync(keypairPath, 'utf8'));
    return Keypair.fromSecretKey(new Uint8Array(keypairData));
  } catch (error) {
    throw new Error(`Failed to load mint authority keypair: ${error.message}`);
  }
}

// Mint DOOM tokens to a recipient
async function mintDoomTokens(recipientAddress, amount = CLAIM_AMOUNT) {
  try {
    console.log(`🔥 Minting ${amount} DOOM tokens to ${recipientAddress}...`);
    
    // Initialize connection and keypair
    const connection = new Connection(RPC_URL, 'confirmed');
    const mintAuthority = loadMintAuthority();
    const mintPublicKey = new PublicKey(DOOM_MINT_ADDRESS);
    const recipientPublicKey = new PublicKey(recipientAddress);
    
    console.log(`🔑 Mint Authority: ${mintAuthority.publicKey.toBase58()}`);
    console.log(`💰 Mint Address: ${DOOM_MINT_ADDRESS}`);
    
    // Check mint authority balance
    const balance = await connection.getBalance(mintAuthority.publicKey);
    console.log(`💳 Authority Balance: ${balance / 1e9} SOL`);
    
    if (balance < 1000000) { // Less than 0.001 SOL
      throw new Error('Insufficient SOL balance for transaction fees');
    }
    
    // Get or create associated token account for recipient
    console.log('🏦 Getting/creating associated token account...');
    const recipientTokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      mintAuthority, // payer
      mintPublicKey,
      recipientPublicKey,
      false, // allowOwnerOffCurve
      'confirmed',
      undefined,
      TOKEN_2022_PROGRAM_ID
    );
    
    console.log(`📍 Recipient Token Account: ${recipientTokenAccount.address.toBase58()}`);
    
    // Mint tokens
    console.log('⚡ Executing mint transaction...');
    const mintSignature = await mintTo(
      connection,
      mintAuthority, // payer
      mintPublicKey,
      recipientTokenAccount.address,
      mintAuthority, // mint authority
      amount * 1e9, // amount with decimals (9 decimals)
      [],
      'confirmed',
      TOKEN_2022_PROGRAM_ID
    );
    
    console.log(`✅ Mint successful!`);
    console.log(`🔗 Transaction: https://explorer.solana.com/tx/${mintSignature}`);
    console.log(`👤 Recipient: https://explorer.solana.com/address/${recipientAddress}`);
    
    return {
      success: true,
      signature: mintSignature,
      recipientTokenAccount: recipientTokenAccount.address.toBase58(),
      amount: amount
    };
    
  } catch (error) {
    console.error('❌ Minting failed:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

// CLI usage
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Usage: node mint-tokens-mainnet.js <recipient_address> [amount]');
    console.log('Example: node mint-tokens-mainnet.js 9uN3Vw5DouX6sdFbfJt6WDHZSrRo67P7dnKNNLuEHcnT 734');
    process.exit(1);
  }
  
  const recipientAddress = args[0];
  const amount = args[1] ? parseInt(args[1]) : CLAIM_AMOUNT;
  
  mintDoomTokens(recipientAddress, amount)
    .then(result => {
      if (result.success) {
        console.log('🎯 Minting completed successfully!');
      } else {
        console.log('💥 Minting failed!');
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('💥 Unexpected error:', error);
      process.exit(1);
    });
}

module.exports = { mintDoomTokens };
