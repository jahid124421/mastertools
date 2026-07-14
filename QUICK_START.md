# 🚀 Quick Start - Custom Domain Setup

Your domain `toolstack.qd.je` is ready to be connected. Here's what you need to do:

## What You Need

1. **Cloudflare API Token** - Get it from: https://dash.cloudflare.com/profile/api-tokens
   - Create token with permissions: `Zone:Read`, `DNS:Edit`, `Pages:Edit`
   
2. **Cloudflare Account ID** - Find it in your Cloudflare dashboard (right sidebar)

## Setup Steps

### 1. Add Domain to Cloudflare
- Go to https://dash.cloudflare.com
- Add site: `toolstack.qd.je`
- Select Free plan
- Copy the nameservers Cloudflare gives you

### 2. Update Nameservers at DigitalPlat
- Go to https://dash.domain.digitalplat.org
- Find `toolstack.qd.je`
- Replace nameservers with Cloudflare's nameservers
- Save changes

### 3. Configure GitHub Secrets
- Go to: https://github.com/jahid124421/mastertools/settings/secrets/actions
- Add these secrets:
  - `CLOUDFLARE_API_TOKEN` = your token
  - `CLOUDFLARE_ACCOUNT_ID` = your account ID
  - `INDEXNOW_KEY` = `399bcfb85d253200d756fa23a6a13fc1`

### 4. Run Setup Script
```bash
# Copy the example env file
cp .env.example .env

# Edit .env and add your credentials
notepad .env

# Run the setup script
python setup_domain.py
```

### 5. Or Use GitHub Actions (Easier!)
- Go to: https://github.com/jahid124421/mastertools/actions
- Click "SEO Refresh + Deploy"
- Click "Run workflow"
- Select "setup-domain" job
- Click "Run workflow"

## That's It!

Your site will be live at: **https://toolstack.qd.je**

DNS propagation takes 5-30 minutes.

## Need Help?

See `DOMAIN_SETUP.md` for detailed instructions and troubleshooting.

## Files Created

- `setup_domain.py` - Automated domain setup script
- `.env.example` - Template for your API keys
- `.gitignore` - Updated to protect sensitive files
- `.github/workflows/seo-refresh.yml` - Automated deploy + domain setup
- `DOMAIN_SETUP.md` - Complete setup guide
- `QUICK_START.md` - This file

## What Happens When You Run It

The script will automatically:
1. Connect `toolstack.qd.je` to Cloudflare Pages
2. Create DNS records (A + CNAME)
3. Update all site files with new domain
4. Regenerate 207 SEO pages
5. Redeploy the site
6. Submit URLs to IndexNow

Everything is fully automated!