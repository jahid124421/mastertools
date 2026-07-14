# Manual Setup Required (2 minutes)

The automated script updated all your files, but you need to manually add the custom domain in Cloudflare Pages.

## Step 1: Add Custom Domain to Cloudflare Pages

1. Go to: https://dash.cloudflare.com/pages
2. Find your project: **mastertools**
3. Click on it
4. Go to **Custom domains** tab
5. Click **Set up a custom domain**
6. Enter: `toolstack.dpdns.org`
7. Click **Continue** → **Activate domain**

Cloudflare will automatically:
- Create the DNS record
- Issue SSL certificate
- Enable HTTPS

## Step 2: Deploy the Updated Site

The files are already updated with the new domain. Now you need to deploy:

### Option A: Using Wrangler CLI (Recommended)
```bash
cd mastertools-deploy
wrangler pages project list
wrangler pages deploy
```

### Option B: Using Git (If connected to GitHub)
```bash
cd mastertools-deploy
git add .
git commit -m "Update domain to toolstack.dpdns.org"
git push
```

### Option C: Using the Deploy Button
1. Go to: https://dash.cloudflare.com/pages
2. Find your project
3. Click **Deployments** → **Create deployment**
4. Upload the updated files

## Step 3: Verify Everything Works

1. Wait 2-5 minutes for DNS propagation
2. Visit: https://toolstack.dpdns.org
3. Check that the site loads correctly
4. Test a few tools to make sure they work

## Step 4: Update SEO (Optional but Recommended)

1. Go to: https://search.google.com/search-console
2. Add property: `https://toolstack.dpdns.org`
3. Submit sitemap: `https://toolstack.dpdns.org/sitemap.xml`
4. Request indexing for important pages

## What Was Already Done

✅ Updated `build_seo_pages.py` with new domain
✅ Updated `sitemap.xml` with new domain
✅ Updated `index.html` canonical URL
✅ Regenerated all 207 SEO pages with `https://toolstack.dpdns.org`
✅ All tool pages now reference the new domain

## Troubleshooting

**Domain not loading?**
- Wait 5-30 minutes for DNS propagation
- Check Cloudflare Pages dashboard for deployment status
- Verify custom domain is active in Cloudflare Pages

**SSL certificate not working?**
- Cloudflare automatically provisions SSL certificates
- Wait 10-15 minutes after activating domain
- Check SSL/TLS settings in Cloudflare dashboard

**Tools not working?**
- All tools are client-side JavaScript
- They should work immediately once the site loads
- Check browser console for errors (F12)

## Need Help?

- Cloudflare Pages Docs: https://developers.cloudflare.com/pages
- Wrangler CLI Docs: https://developers.cloudflare.com/workers/wrangler
- Your site: https://toolstack.dpdns.org

---

**Last Updated:** 2026-07-13
**Status:** Files updated, manual Cloudflare Pages setup required