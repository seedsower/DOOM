const {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  sendAndConfirmTransaction,
  SystemProgram,
  LAMPORTS_PER_SOL
} = require('@solana/web3.js');

const {
  createMint,
  getOrCreateAssociatedTokenAccount,
  mintTo,
  createSetAuthorityInstruction,
  AuthorityType,
  TOKEN_PROGRAM_ID,
  createInitializeMetadataPointerInstruction,
  createInitializeMintInstruction,
  getMintLen,
  ExtensionType,
} = require('@solana/spl-token');

const fs = require('fs');
const path = require('path');

// DOOM Token Configuration
const DOOM_CONFIG = {
  name: "DOOM Protocol Token",
  symbol: "DOOM",
  decimals: 9,
  totalSupply: 37_000_000, // 37 million tokens
  initialMint: 36_999_266, // Leave 734 for claims
  description: "Every book is a key. Every reader is a node. The protocol of collapse.",
  image: "https://doom-protocol.vercel.app/doom-logo.png"
};

async function deployDoomToken() {
  console.log('🔥 DEPLOYING DOOM PROTOCOL TOKEN ON DEVNET 🔥');
  console.log('=====================================');
  
  // Connect to devnet
  const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
  
  // Load or create keypair
  let payer;
  const keypairPath = path.join(process.env.HOME, '.config/solana/id.json');
  
  try {
    const keypairData = JSON.parse(fs.readFileSync(keypairPath, 'utf8'));
    payer = Keypair.fromSecretKey(new Uint8Array(keypairData));
    console.log(`📋 Using existing keypair: ${payer.publicKey.toString()}`);
  } catch (error) {
    console.log('⚠️  No existing keypair found, creating new one...');
    payer = Keypair.generate();
    
    // Request airdrop for new keypair
    console.log('💰 Requesting SOL airdrop...');
    const airdropSignature = await connection.requestAirdrop(
      payer.publicKey,
      2 * LAMPORTS_PER_SOL
    );
    await connection.confirmTransaction(airdropSignature);
  }
  
  // Check balance
  const balance = await connection.getBalance(payer.publicKey);
  console.log(`💳 Wallet Balance: ${balance / LAMPORTS_PER_SOL} SOL`);
  
  if (balance < 0.1 * LAMPORTS_PER_SOL) {
    throw new Error('Insufficient SOL balance. Need at least 0.1 SOL for deployment.');
  }
  
  console.log('\n🏗️  Creating DOOM token mint...');
  
  // Create the token mint
  const mint = await createMint(
    connection,
    payer,
    payer.publicKey, // mint authority
    payer.publicKey, // freeze authority
    DOOM_CONFIG.decimals
  );
  
  console.log(`✅ DOOM Token Mint Created: ${mint.toString()}`);
  
  // Create associated token account for the payer
  console.log('\n💼 Creating token account...');
  const tokenAccount = await getOrCreateAssociatedTokenAccount(
    connection,
    payer,
    mint,
    payer.publicKey
  );
  
  console.log(`✅ Token Account Created: ${tokenAccount.address.toString()}`);
  
  // Mint initial supply
  console.log(`\n🪙  Minting ${DOOM_CONFIG.initialMint.toLocaleString()} DOOM tokens...`);
  const mintAmount = DOOM_CONFIG.initialMint * Math.pow(10, DOOM_CONFIG.decimals);
  
  await mintTo(
    connection,
    payer,
    mint,
    tokenAccount.address,
    payer.publicKey,
    mintAmount
  );
  
  console.log(`✅ Minted ${DOOM_CONFIG.initialMint.toLocaleString()} DOOM tokens`);
  
  // Save deployment info
  const deploymentInfo = {
    network: 'devnet',
    mintAddress: mint.toString(),
    tokenAccount: tokenAccount.address.toString(),
    deployer: payer.publicKey.toString(),
    deployedAt: new Date().toISOString(),
    config: DOOM_CONFIG,
    totalSupply: DOOM_CONFIG.totalSupply,
    initialMinted: DOOM_CONFIG.initialMint,
    remainingForClaims: DOOM_CONFIG.totalSupply - DOOM_CONFIG.initialMint
  };
  
  // Write deployment info to file
  const deploymentPath = path.join(__dirname, '..', 'deployment-info.json');
  fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
  
  console.log('\n📄 Deployment info saved to deployment-info.json');
  
  // Update environment variables
  const envPath = path.join(__dirname, '..', '.env.local');
  const envContent = `
# DOOM Token Deployment Info (Devnet)
NEXT_PUBLIC_DOOM_MINT_ADDRESS=${mint.toString()}
NEXT_PUBLIC_DOOM_TOKEN_ACCOUNT=${tokenAccount.address.toString()}
NEXT_PUBLIC_SOLANA_NETWORK=devnet
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com
`;
  
  fs.writeFileSync(envPath, envContent);
  console.log('✅ Environment variables updated in .env.local');
  
  console.log('\n🎉 DOOM TOKEN DEPLOYMENT COMPLETE! 🎉');
  console.log('=====================================');
  console.log(`🏷️  Token Name: ${DOOM_CONFIG.name}`);
  console.log(`🔤 Symbol: ${DOOM_CONFIG.symbol}`);
  console.log(`🪙  Mint Address: ${mint.toString()}`);
  console.log(`💼 Token Account: ${tokenAccount.address.toString()}`);
  console.log(`📊 Total Supply: ${DOOM_CONFIG.totalSupply.toLocaleString()} DOOM`);
  console.log(`🎯 Initial Minted: ${DOOM_CONFIG.initialMint.toLocaleString()} DOOM`);
  console.log(`🎁 Reserved for Claims: ${(DOOM_CONFIG.totalSupply - DOOM_CONFIG.initialMint).toLocaleString()} DOOM`);
  console.log(`🌐 Network: Solana Devnet`);
  
  console.log('\n📋 Next Steps:');
  console.log('1. Update your frontend to use the new mint address');
  console.log('2. Test token transfers and claims');
  console.log('3. Deploy to mainnet when ready');
  
  return deploymentInfo;
}

// Run deployment
if (require.main === module) {
  deployDoomToken()
    .then((info) => {
      console.log('\n✅ Deployment successful!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Deployment failed:', error);
      process.exit(1);
    });
}

module.exports = { deployDoomToken, DOOM_CONFIG };
