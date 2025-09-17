# DOOMSCROLL | The Protocol of Collapse

> *"Every book is a key. Every reader is a node. The DOOM token weaponizes the absurdity of tokenomics against itself."*

## Overview

The DOOM Protocol is performance art masquerading as cryptocurrency, social commentary disguised as tokenomics. It's a literary verification system that rewards readers with tokens while acknowledging the fundamental meaninglessness of all economic systems.

### Core Philosophy

- **Anti-Investment Aesthetic**: The site feels like a warning, not a pitch
- **Literary Gatekeeping**: Only true readers can claim their tokens
- **Transparency Through Opacity**: Show everything while explaining nothing
- **Memetic Virality**: Built for screenshots and sharing

## Technical Architecture

### Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Web3**: Solana Web3.js, Wallet Adapter, SPL Token
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: SQLite (development), PostgreSQL (production)
- **Animations**: Framer Motion, Custom CSS glitch effects
- **Styling**: Terminal/CRT aesthetic with glitch animations

### Token Mechanics

- **Total Supply**: 37,000,000 DOOM tokens
- **Airdrop Amount**: 734 DOOM per verified reader
- **Access Threshold**: 666 DOOM for bunker entry
- **Verification**: Literary knowledge required for claims

## Getting Started

### Prerequisites

- Node.js 18+ (Note: Some Solana packages prefer Node 20+)
- npm or yarn
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd doom-protocol
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up the database**
   ```bash
   npx prisma migrate dev --name init
   npx prisma generate
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
doom-protocol/
├── src/
│   ├── app/                    # Next.js 14 App Router
│   │   ├── api/               # API endpoints
│   │   │   ├── claim/         # Token claim verification
│   │   │   └── metrics/       # Protocol metrics
│   │   ├── bunker/            # Token-gated content
│   │   ├── market/            # Market data and trading
│   │   ├── protocol/          # Protocol documentation
│   │   ├── the-judas-interface/ # Claim portal
│   │   ├── void/              # 404 page
│   │   ├── globals.css        # Global styles and animations
│   │   ├── layout.tsx         # Root layout with wallet provider
│   │   └── page.tsx           # Landing page
│   ├── components/            # React components
│   │   ├── DoomscrollInterface.tsx
│   │   ├── GlitchBackground.tsx
│   │   ├── GlitchText.tsx
│   │   ├── MarketTicker.tsx
│   │   ├── TokenCounter.tsx
│   │   ├── TokenGate.tsx
│   │   ├── VerificationQuiz.tsx
│   │   └── WalletContextProvider.tsx
│   └── lib/                   # Utility libraries
│       ├── prisma.ts          # Database client
│       └── verification.ts    # Question verification logic
├── prisma/                    # Database schema and migrations
├── public/                    # Static assets
└── tailwind.config.ts         # Tailwind configuration
```

## Key Features

### 🎭 Performance Art Interface
- Terminal/CRT aesthetic with scan lines and glitch effects
- Matrix-style falling characters background
- Typing animations and glitch text effects
- Anti-investment warning messages

### 📚 Literary Verification System
- Pool of questions based on source material
- SHA-256 hashed answers for security
- One-time claim per wallet address
- Verification attempt logging

### 🔐 Token-Gated Content
- Bunker access requires 666+ DOOM tokens
- Tiered access levels for different content
- Real-time balance verification
- Mock Solana token integration

### 📊 Market Simulation
- Real-time price updates (simulated)
- Trading venue integration placeholders
- Protocol metrics dashboard
- Liquidity pool information

### 🌐 Web3 Integration
- Solana wallet adapter support
- Multiple wallet compatibility (Phantom, Solflare, etc.)
- Message signing for verification
- Token balance checking (mocked for demo)

## API Endpoints

### POST `/api/claim`
Verify literary knowledge and process token claims.

**Request Body:**
```json
{
  "walletAddress": "string",
  "questionId": "string", 
  "answer": "string",
  "signature": "number[]",
  "timestamp": "number"
}
```

### GET `/api/metrics`
Retrieve current protocol metrics and market data.

**Response:**
```json
{
  "totalSupply": 37000000,
  "circulatingSupply": 36999266,
  "totalClaimed": 147400,
  "uniqueHolders": 200,
  "marketData": {
    "price": 0.00001337,
    "change24h": -66.6
  }
}
```

## Database Schema

The application uses Prisma ORM with the following models:

- **TokenClaim**: Tracks successful token claims
- **VerificationAttempt**: Logs all verification attempts
- **ProtocolMetrics**: Stores protocol-wide statistics
- **Question**: Manages verification questions
- **BunkerAccess**: Tracks token-gated access levels

## Deployment

### Environment Variables

Create a `.env` file with:

```env
DATABASE_URL="file:./doom.db"
NEXT_PUBLIC_SOLANA_RPC_URL="https://api.devnet.solana.com"
```

### Production Deployment

1. **Database Setup**
   ```bash
   # For production, use PostgreSQL
   DATABASE_URL="postgresql://user:password@host:port/database"
   npx prisma migrate deploy
   ```

2. **Build the application**
   ```bash
   npm run build
   ```

3. **Deploy to Vercel/Netlify**
   - Connect your Git repository
   - Set environment variables
   - Deploy automatically on push

## Smart Contract Integration

The current implementation includes mock Solana integration. For production:

1. **Deploy DOOM token contract**
   - Use Solana Token Program
   - Set up 37M token supply
   - Configure mint authority

2. **Implement claim mechanism**
   - Replace mock transactions with real SPL token transfers
   - Set up program-derived addresses for claims
   - Implement proper signature verification

3. **Create liquidity pool**
   - Deploy on Raydium/Orca
   - Burn LP tokens for permanent liquidity
   - Set up price oracles

## Contributing

This is performance art. Contributions should maintain the aesthetic and philosophical integrity of the project.

### Guidelines

- Preserve the terminal/doom aesthetic
- Maintain the anti-investment messaging
- Keep the literary verification theme
- Ensure all text maintains the dystopian tone

## Security Considerations

- All answers are hashed with SHA-256
- Wallet signatures required for claims
- Rate limiting on verification attempts
- Input validation on all endpoints
- No private keys ever requested

## License

This project exists in the void between meaning and meaninglessness. Use it, modify it, but remember: all economic systems eventually collapse.

## Disclaimer

⚠️ **WARNING** ⚠️

This is not financial advice. This is performance art masquerading as tokenomics. The DOOM token has no inherent value, no utility beyond its own acknowledgment of worthlessness. By participating, you acknowledge that all economic systems are temporary, all currencies eventually fail, and entropy always wins.

---

*"In the beginning was the Word, and the Word was DOOM."*
