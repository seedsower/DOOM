const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Metadata URI from IPFS
const METADATA_URI = 'https://apricot-occupational-boa-893.mypinata.cloud/ipfs/bafkreiaq6czfctqttd3ldziac3bow5tsjhm7fz3zmuzwtijxybpiuzccki';

async function deployDoomTokenCLI() {
  console.log('🚀 Deploying DOOM token with metadata using Solana CLI...');
  console.log(`🔗 Metadata URI: ${METADATA_URI}`);
  
  try {
    // Generate new keypair for the token
    console.log('🔑 Generating new token keypair...');
    const keypairOutput = execSync('solana-keygen new --no-bip39-passphrase --silent --outfile /tmp/doom-token.json', { encoding: 'utf8' });
    
    // Get the public key
    const pubkeyOutput = execSync('solana-keygen pubkey /tmp/doom-token.json', { encoding: 'utf8' });
    const mintAddress = pubkeyOutput.trim();
    
    console.log(`🪙 New mint address: ${mintAddress}`);
    
    // Create token with metadata using spl-token CLI
    console.log('📦 Creating token with Token-2022 program...');
    const createOutput = execSync(`spl-token create-token --program-id TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb --decimals 9 /tmp/doom-token.json --url https://api.devnet.solana.com`, { encoding: 'utf8' });
    
    console.log('✅ Token created successfully!');
    console.log(createOutput);
    
    // Initialize metadata
    console.log('📋 Adding metadata to token...');
    const metadataOutput = execSync(`spl-token initialize-metadata ${mintAddress} "DOOM" "DOOM" "${METADATA_URI}" --url https://api.devnet.solana.com`, { encoding: 'utf8' });
    
    console.log('✅ Metadata added successfully!');
    console.log(metadataOutput);
    
    console.log(`🎉 DOOM Token-2022 deployed with metadata!`);
    console.log(`🪙 Mint Address: ${mintAddress}`);
    console.log(`📋 Metadata URI: ${METADATA_URI}`);
    
    // Save deployment info
    const deploymentInfo = {
      mintAddress: mintAddress,
      decimals: 9,
      totalSupply: 0,
      metadataUri: METADATA_URI,
      tokenProgram: 'Token-2022',
      timestamp: new Date().toISOString(),
      network: 'devnet'
    };
    
    const deploymentPath = path.join(__dirname, '..', 'deployment-info-2022.json');
    fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
    console.log(`💾 Deployment info saved to: ${deploymentPath}`);
    
    // Clean up temporary keypair
    fs.unlinkSync('/tmp/doom-token.json');
    
    return {
      success: true,
      mintAddress: mintAddress,
      deploymentInfo
    };
    
  } catch (error) {
    console.error('❌ Failed to deploy token:', error.message);
    
    // Clean up temporary keypair if it exists
    try {
      fs.unlinkSync('/tmp/doom-token.json');
    } catch (e) {
      // Ignore cleanup errors
    }
    
    return {
      success: false,
      error: error.message
    };
  }
}

// CLI usage
if (require.main === module) {
  deployDoomTokenCLI()
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

module.exports = { deployDoomTokenCLI, METADATA_URI };
