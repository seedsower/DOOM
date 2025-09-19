#!/usr/bin/env node

// Test production environment variables
async function testProductionEnv() {
  console.log('🔍 Testing production environment...\n');
  
  // Replace with your actual Netlify URL
  const baseUrl = 'https://your-site-name.netlify.app'; // Update this!
  
  try {
    console.log('📡 Testing /api/test-env endpoint...');
    const response = await fetch(`${baseUrl}/api/test-env`);
    const data = await response.json();
    
    console.log('✅ Environment test response:');
    console.log(JSON.stringify(data, null, 2));
    
    // Check critical environment variables
    if (!data.environment.hasDatabaseUrl) {
      console.log('❌ DATABASE_URL is missing!');
    }
    
    if (!data.environment.hasSolanaKey) {
      console.log('❌ SOLANA_PRIVATE_KEY is missing!');
    } else if (data.environment.solanaKeyLength < 100) {
      console.log('⚠️ SOLANA_PRIVATE_KEY seems too short:', data.environment.solanaKeyLength);
    }
    
  } catch (error) {
    console.error('❌ Error testing production environment:', error.message);
  }
}

testProductionEnv();
