# Deploy Your Site (Choose One Method)

## ✅ What's Already Done
- All 207 tools updated with `https://toolstack.dpdns.org`
- All SEO pages regenerated
- Sitemap updated
- Configuration files updated

## 🚀 Choose Your Deployment Method

### Method 1: Wrangler CLI (Fastest)
```bash
cd mastertools-deploy

# Login to Cloudflare (opens browser)
wrangler login

# Deploy
wrangler pages deploy
```

### Method 2: Cloudflare Dashboard (Easiest)
1. Go to: https://dash.cloudflare.com/pages
2. Click your **mastertools** project
3. Click **Deployments** → **Create deployment**
4. Drag and drop the entire `mastertools-deploy` folder
5. Wait 2-3 minutes for deployment

### Method 3: Git (If connected to GitHub)
```bash
cd mastertools-deploy
git add .
git commit -m "Update domain to toolstack.dpdns.org"
git push
```

## 🔧 Add Custom Domain (REQUIRED)

After deploying, you MUST add the custom domain:

1. Go to: https://dash.cloudflare.com/pages
2. Click your **mastertools** project
3. Go to **Custom domains** tab
4. Click **Set up a custom domain**
5. Enter: `toolstack.dpdns.org`
6. Click **Continue** → **Activate domain**

## ✅ Verify Deployment

1. Wait 2-5 minutes
2. Visit: https://toolstack.dpdns.org
3. Test a few tools
4. Check SSL certificate (should show lock icon)

## 🎯 After Deployment

1. **Submit to Google Search Console**
   - Go to: https://search.google.com/search-console
   - Add property: `https://toolstack.dpdns.org`
   - Submit sitemap: `https://toolstack.dpdns.org/sitemap.xml`

2. **Test your site**
   - Visit: https://toolstack.dpdns.org
   - Test 3-5 random tools
   - Check mobile responsiveness

3. **Share your site!**
   - Your site is now live at: https://toolstack.dpdns.org
   - 207 free tools available
   - No signup required

---

**Need Help?**
- Cloudflare Pages Docs: https://developers.cloudflare.com/pages
- Wrangler Docs: https://developers.cloudflare.com/workers/wrangler