# DOOM Protocol - Netlify Deployment Guide

## Quick Deploy to Netlify

### Option 1: GitHub Integration (Recommended)
1. Connect your GitHub repository to Netlify
2. Set build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `out`
   - **Node version**: `18`

### Option 2: Manual Deploy
1. Run `npm run build` locally
2. Upload the `out` folder to Netlify

## Environment Variables

Set these in your Netlify dashboard under Site Settings > Environment Variables:

```
NEXT_PUBLIC_SOLANA_NETWORK=devnet
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com
NEXT_PUBLIC_DOOM_MINT_ADDRESS=5se2cVMggFyibMqsJycmqH4N6dUY6z8iqLB8fjxrgqnh
DATABASE_URL=file:./doom.db
NODE_MODULES_CACHE=false
```

**Important**: The `NODE_MODULES_CACHE=false` environment variable disables Netlify's dependency caching, which prevents npm cache issues during builds.

## Important Notes

### Database Limitations
- Netlify Functions are stateless
- SQLite database won't persist between deployments
- For production, consider:
  - PlanetScale (MySQL)
  - Supabase (PostgreSQL)
  - MongoDB Atlas

### API Routes
- API routes are converted to Netlify Functions
- Located in `netlify/functions/`
- Automatically deployed with your site

### Static Export
- Next.js configured for static export (`output: 'export'`)
- All pages pre-rendered at build time
- Client-side routing for dynamic content

## Build Process

The build process:
1. `next build` - Builds the Next.js application
2. `next export` - Exports static files to `out/` directory
3. Netlify serves static files from `out/`
4. API calls routed to Netlify Functions

## Troubleshooting

### Build Failures
- Check Node.js version (should be 18+)
- Verify all dependencies are installed
- Review build logs for specific errors

### NPM Cache Issues
If you encounter npm cache or `/dev/null` errors:
1. **Environment Variable**: Set `NODE_MODULES_CACHE=false` in Netlify
2. **Build Command**: Uses `npm cache clean --force && npm install && npm run build`
3. **Clean .npmrc**: Avoid `/dev/null` references in npm configuration

### Alternative Package Managers
If npm issues persist, try switching to pnpm:
```bash
# In netlify.toml
[build]
  command = "corepack enable && pnpm install && pnpm run build"
```

### Runtime Issues
- Check browser console for client-side errors
- Verify environment variables are set correctly
- Test API endpoints individually

### Database Issues
- Remember: SQLite is ephemeral on Netlify
- Claims won't persist between deployments
- Consider upgrading to cloud database for production

## Production Considerations

For mainnet deployment:
1. Update environment variables to mainnet
2. Set up persistent database
3. Implement proper error handling
4. Add monitoring and analytics
5. Configure custom domain
6. Enable HTTPS (automatic on Netlify)

## Support

If you encounter issues:
1. Check Netlify build logs
2. Review browser console errors
3. Verify environment variables
4. Test locally first with `npm run build`
