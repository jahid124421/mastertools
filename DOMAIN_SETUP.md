# 🌐 Custom Domain Setup Guide

This guide will help you connect your custom domain `toolstack.qd.je` to your MasterTools website.

## Prerequisites

- [x] Cloudflare account (you already have this)
- [x] GitHub repository (jahid124421/mastertools)
- [x] DigitalPlat domain registered (toolstack.qd.je)
- [ ] Cloudflare API token (we'll create this)
- [ ] Cloudflare Account ID (we'll find this)

---

## Step 1: Get Cloudflare API Token

1. Go to https://dash.cloudflare.com/profile/api-tokens
2. Click **Create Token**
3. Select **Edit zone DNS** template (or create custom with these permissions):
   - Zone:Read
   - DNS:Edit
   - Pages:Edit
4. Under **Zone Resources**, select:
   - Include: **Specific zone** → `toolstack.qd.je`
   - Include: **Specific account** → your account
5. Click **Continue to summary** → **Create Token**
6. **Copy the token** (you won't see it again!)

---

## Step 2: Get Cloudflare Account ID

1. Go to https://dash.cloudflare.com
2. Look at the **right sidebar** of any page
3. You'll see: **Account ID:** `1234567890abcdef...`
4. **Copy this ID**

---

## Step 3: Configure GitHub Secrets

1. Go to your GitHub repo: https://github.com/jahid124421/mastertools
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret** and add these:

   | Name | Value |
   |------|-------|
   | `CLOUDFLARE_API_TOKEN` | Your token from Step 1 |
   | `CLOUDFLARE_ACCOUNT_ID` | Your Account ID from Step 2 |
   | `INDEXNOW_KEY` | `399bcfb85d253200d756fa23a6a13fc1` (already set) |

---

## Step 4: Add Domain to Cloudflare

1. Go to https://dash.cloudflare.com
2. Click **Add a site**
3. Enter: `toolstack.qd.je`
4. Select **Free** plan
5. Click **Continue**
6. Cloudflare will scan for existing DNS records (none for new domain)
7. Click **Continue** → **Done**

Cloudflare will show you two nameservers like:
```
alice.ns.cloudflare.com
bob.ns.cloudflare.com
```

---

## Step 5: Update Nameservers at DigitalPlat

1. Go to https://dash.domain.digitalplat.org
2. Log in to your account
3. Find your domain: `toolstack.qd.je`
4. Click **Manage** → **Nameservers**
5. Replace the current nameservers with the Cloudflare ones from Step 4
6. Click **Save**

**Important:** DNS propagation can take 5 minutes to 24 hours.

---

## Step 6: Run Automated Setup

Once the nameservers are updated and Cloudflare shows your domain as **Active**:

### Option A: Run Locally (Recommended for first time)

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and add your credentials:
   ```
   CLOUDFLARE_API_TOKEN=your_token_here
   CLOUDFLARE_ACCOUNT_ID=your_account_id_here
   ```

3. Run the setup script:
   ```bash
   python setup_domain.py
   ```

This will automatically:
- Connect your domain to Cloudflare Pages
- Create DNS records
- Update all site configuration files
- Regenerate SEO pages with new domain
- Redeploy the site

### Option B: Run via GitHub Actions (Automated)

1. Go to your GitHub repo: https://github.com/jahid124421/mastertools
2. Click **Actions** → **SEO Refresh + Deploy**
3. Click **Run workflow** → **Run workflow**
4. The workflow will automatically set up your domain

---

## Step 7: Verify Setup

1. **Check Cloudflare Pages:**
   - Go to https://dash.cloudflare.com/pages
   - Find `mastertools` project
   - Click **Custom domains**
   - You should see: `toolstack.qd.je` (status: Active)

2. **Test your site:**
   - Visit: https://toolstack.qd.je
   - Wait for DNS propagation if not working yet
   - Try: https://www.toolstack.qd.je

3. **Verify DNS records:**
   ```bash
   nslookup toolstack.qd.je
   ```
   Should return Cloudflare IPs.

---

## Step 8: Update Search Engines

### Google Search Console
1. Go to https://search.google.com/search-console
2. Click **Add Property** → **URL prefix**
3. Enter: `https://toolstack.qd.je`
4. Verify ownership (use DNS TXT record method)
5. Submit sitemap: `https://toolstack.qd.je/sitemap.xml`

### Bing Webmaster Tools
1. Go to https://www.bing.com/webmasters
2. Import from Google Search Console (easiest)
3. Or add site manually

### IndexNow (Already Done!)
- Your URLs were already submitted to IndexNow
- The key file is at: `https://toolstack.qd.je/399bcfb85d253200d756fa23a6a13fc1.txt`

---

## What Gets Updated Automatically

The setup script will update these files with your new domain:

- `build_seo_pages.py` - SITE URL constant
- `sitemap.xml` - All URLs
- `index.html` - Canonical URLs
- All 207 tool SEO pages - Regenerated with new domain

---

## Troubleshooting

### Domain not working after 24 hours?
- Check nameservers at DigitalPlat dashboard
- Verify Cloudflare shows domain as **Active**
- Try flushing DNS: `ipconfig /flushdns`

### "Domain not found in Cloudflare" error?
- Make sure you added the domain to Cloudflare first (Step 4)
- Wait for nameserver propagation
- Check for typos in domain name

### SSL/TLS errors?
- Go to Cloudflare dashboard → **SSL/TLS**
- Set to **Full** or **Flexible**
- Enable **Always Use HTTPS**

### GitHub Actions failing?
- Check that all secrets are set correctly
- Verify API token has required permissions
- Check workflow logs for specific errors

---

## Maintenance

### Updating the domain later?
Just edit `setup_domain.py` and change the `DOMAIN` variable, then run it again.

### Adding more domains?
Duplicate the `create_dns_records()` function in `setup_domain.py` for each domain.

### Changing SEO settings?
Edit `build_seo_pages.py` and run `python build_seo_pages.py` to regenerate.

---

## Support

- **DigitalPlat Support:** https://discord.gg/ma4RZzMmVW
- **Cloudflare Docs:** https://developers.cloudflare.com
- **GitHub Issues:** https://github.com/jahid124421/mastertools/issues

---

## Quick Reference

| Item | Value |
|------|-------|
| Domain | `toolstack.qd.je` |
| Site URL | `https://toolstack.qd.je` |
| Cloudflare Pages Project | `mastertools` |
| IndexNow Key | `399bcfb85d253200d756fa23a6a13fc1` |
| GitHub Repo | `jahid124421/mastertools` |

---

**Last Updated:** 2026-07-13
**Status:** Ready for setup ✅