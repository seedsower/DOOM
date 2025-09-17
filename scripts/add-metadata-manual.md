# DOOM Token Metadata Analysis

## Current Status
- **Token Mint**: `5se2cVMggFyibMqsJycmqH4N6dUY6z8iqLB8fjxrgqnh`
- **Token Type**: Standard SPL Token (Token Program)
- **Network**: Solana Devnet
- **Metadata Status**: ❌ Cannot add on-chain metadata to standard SPL tokens

## Issue Discovered
The DOOM token was deployed as a **standard SPL token** using the Token Program (`TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA`). The Metaplex Token Metadata program is designed for **NFTs** and requires specific token standards that fungible SPL tokens don't meet.

**Error**: `Invalid mint account for specified token standard`

## Prepared Metadata (IPFS)
The metadata was prepared and uploaded to IPFS:
- **URI**: `https://apricot-occupational-boa-893.mypinata.cloud/ipfs/bafkreiaq6czfctqttd3ldziac3bow5tsjhm7fz3zmuzwtijxybpiuzccki`
- **Content**:
```json
{
  "name": "DOOM",
  "symbol": "DOOM", 
  "description": "TOKEN OF COLLAPSE",
  "image": "https://ipfs.io/ipfs/bafybeibipab7satev46lxtdjro7pqtaoscou475ugywbtosezkeyhpxmai"
}
```

## Manual Methods to Add Metadata

### Method 1: Using Solana CLI (Recommended)
```bash
# Install Solana CLI if not already installed
sh -c "$(curl -sSfL https://release.solana.com/v1.18.4/install)"

# Create metadata account
solana program deploy --program-id metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s \
  --keypair ~/.config/solana/id.json \
  --url https://api.devnet.solana.com
```

### Method 2: Using Sugar CLI
```bash
# Install Sugar CLI
bash <(curl -sSf https://sugar.metaplex.com/install.sh)

# Create metadata
sugar create-metadata \
  --mint 5se2cVMggFyibMqsJycmqH4N6dUY6z8iqLB8fjxrgqnh \
  --uri "https://apricot-occupational-boa-893.mypinata.cloud/ipfs/bafkreiaq6czfctqttd3ldziac3bow5tsjhm7fz3zmuzwtijxybpiuzccki" \
  --keypair ~/.config/solana/id.json \
  --rpc-url https://api.devnet.solana.com
```

### Method 3: Using Web Interface
1. Go to [Solana Explorer](https://explorer.solana.com/?cluster=devnet)
2. Search for mint: `5se2cVMggFyibMqsJycmqH4N6dUY6z8iqLB8fjxrgqnh`
3. Use a metadata creation tool like [Metaplex Studio](https://studio.metaplex.com/)

### Method 4: Using JavaScript (Alternative)
```javascript
// Using @metaplex-foundation/js (newer SDK)
import { Metaplex, keypairIdentity } from '@metaplex-foundation/js';
import { Connection, Keypair } from '@solana/web3.js';

const connection = new Connection('https://api.devnet.solana.com');
const wallet = Keypair.fromSecretKey(/* your secret key */);
const metaplex = Metaplex.make(connection).use(keypairIdentity(wallet));

await metaplex.nfts().create({
  uri: 'https://apricot-occupational-boa-893.mypinata.cloud/ipfs/bafkreiaq6czfctqttd3ldziac3bow5tsjhm7fz3zmuzwtijxybpiuzccki',
  name: 'DOOM',
  symbol: 'DOOM',
  sellerFeeBasisPoints: 0,
  useNewMint: new PublicKey('5se2cVMggFyibMqsJycmqH4N6dUY6z8iqLB8fjxrgqnh')
});
```

## Verification
After adding metadata, verify it worked:
```bash
# Check metadata account
solana account GKXWbRuDX4HQA2xuHBBMy7p21Gtyj2ueXfyffcPDhph6 --url https://api.devnet.solana.com

# Or check on Solana Explorer
# https://explorer.solana.com/address/5se2cVMggFyibMqsJycmqH4N6dUY6z8iqLB8fjxrgqnh?cluster=devnet
```

## Expected Metadata Account
- **Address**: `GKXWbRuDX4HQA2xuHBBMy7p21Gtyj2ueXfyffcPDhph6`
- **Program**: Token Metadata Program (`metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s`)

## Notes
- The metadata account is derived deterministically from the mint address
- Once created, the metadata will be visible in wallets and DEXs
- The image and metadata are stored on IPFS for decentralization
- Metadata can be updated later if the update authority allows it
