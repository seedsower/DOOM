const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Load deployment info
const deploymentPath = path.join(__dirname, '..', 'deployment-info.json');
const deploymentInfo = JSON.parse(fs.readFileSync(deploymentPath, 'utf8'));

const DOOM_MINT = deploymentInfo.mintAddress;
const METADATA_URI = 'https://apricot-occupational-boa-893.mypinata.cloud/ipfs/bafkreiaq6czfctqttd3ldziac3bow5tsjhm7fz3zmuzwtijxybpiuzccki';

async function addTokenMetadata() {
  console.log('🏷️  Adding metadata to DOOM token using Metaboss CLI...');
  console.log(`📍 Token Mint: ${DOOM_MINT}`);
  console.log(`🔗 Metadata URI: ${METADATA_URI}`);
  
  try {
    // Check if metaboss is installed
    try {
      execSync('metaboss --version', { stdio: 'pipe' });
      console.log('✅ Metaboss CLI found');
    } catch (error) {
      console.log('📦 Installing Metaboss CLI...');
      execSync('cargo install metaboss', { stdio: 'inherit' });
    }
    
    // Create metadata using metaboss
    console.log('📤 Creating metadata account...');
    const command = `metaboss create metadata -m ${DOOM_MINT} -u "${METADATA_URI}" --keypair ~/.config/solana/id.json --rpc https://api.devnet.solana.com`;
    
    const output = execSync(command, { 
      encoding: 'utf8',
      stdio: 'pipe'
    });
    
    console.log('✅ Metadata added successfully!');
    console.log('Output:', output);
    console.log(`🎉 DOOM token now has metadata with name, symbol, description, and image!`);
    
    return {
      success: true,
      output,
      metadataUri: METADATA_URI,
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('❌ Failed to add metadata:', error.message);
    
    // If metaboss fails, provide manual instructions
    console.log('\n📋 Manual Instructions:');
    console.log('1. Install Metaboss: cargo install metaboss');
    console.log(`2. Run: metaboss create metadata -m ${DOOM_MINT} -u "${METADATA_URI}" --keypair ~/.config/solana/id.json --rpc https://api.devnet.solana.com`);
    
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
