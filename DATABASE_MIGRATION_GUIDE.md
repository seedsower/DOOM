# Neon PostgreSQL Migration Guide

## Current Status
- ✅ Neon extension installed in Netlify
- ✅ PostgreSQL dependencies installed (pg, @types/pg)
- ✅ Prisma schema updated to use PostgreSQL
- ⏳ Need to configure database connection

## Next Steps

### 1. Get Neon Database URL
In your Netlify dashboard:
1. Go to Site settings → Environment variables
2. Find the `DATABASE_URL` variable (automatically set by Neon extension)
3. Copy the connection string

### 2. Set Local Environment Variable
Create `.env.local` file with:
```
DATABASE_URL="your_neon_connection_string_here"
```

### 3. Run Migration Commands
```bash
# Generate Prisma client
npx prisma generate

# Create and apply migration
npx prisma migrate dev --name init_neon_postgresql

# Seed the database
node scripts/seed-database.js
```

### 4. Test Locally
```bash
npm run dev
# Test /api/questions endpoint
```

### 5. Deploy to Production
```bash
git add .
git commit -m "🗄️ Migrate to Neon PostgreSQL database"
git push origin main
```

## Troubleshooting

If you get connection errors:
- Verify DATABASE_URL is correct
- Check Neon dashboard for database status
- Ensure IP allowlist includes your development environment

## Schema Changes
- Migrated from SQLite to PostgreSQL
- Added proper table mappings (@map directives)
- Optimized for production use with Neon serverless PostgreSQL
