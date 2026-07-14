# Create Cloudflare Pages Project

## Problem
- Domain `toolstack.dpdns.org` is working (DNS is set up)
- But there's no Cloudflare Pages project yet
- That's why you're seeing 404

## Solution: Create New Pages Project

### Step 1: Create New Project

1. Go to: **https://dash.cloudflare.com/pages**
2. Click **Create a project**
3. Click **Connect to Git** OR **Upload assets**

**Option A: Upload Assets (Easiest - Recommended)**
1. Click **Upload assets**
2. Drag & drop the entire **`mastertools-deploy`** folder
3. Click **Deploy site**
4. Wait 2-3 minutes

**Option B: Connect to Git** (if you have GitHub/GitLab)
1. Click **Connect to Git**
2. Select your repository
3. Set build settings:
   - Build command: (leave empty)
   - Build output directory: `/` (root)
4. Click **Deploy**

### Step 2: Name Your Project

When creating the project:
- **Project name**: `mastertools` (or any name you prefer)
- This will create a URL like: `mastertools.pages.dev`

### Step 3: Add Custom Domain

After deployment succeeds:

1. Go to your project dashboard
2. Click **Custom domains** tab
3. Click **Set up a custom domain**
4. Enter: `toolstack.dpdns.org`
5. Click **Continue** → **Activate domain**

### Step 4: Wait and Test

1. Wait 2-5 minutes for DNS propagation
2. Visit: **https://toolstack.dpdns.org**
3. Site should load! 🎉

---

## Visual Guide

### What You Should See:

**After Step 1:**
```
✓ Deployment successful
  - URL: https://mastertools.pages.dev
  - Status: Active
```

**After Step 3:**
```
Custom domains:
  toolstack.dpdns.org
  Status: Active ✓
  SSL: Active ✓
```

---

## Troubleshooting

### "No projects found" or "Create a project" button
- This is normal! You need to create the first project
- Follow Step 1 above

### Project creation fails
- Make sure you're uploading the `mastertools-deploy` folder
- Check that index.html exists in the root of the folder
- Try uploading again

### Custom domain not working after activation
- Wait 5-10 minutes for DNS propagation
- Clear browser cache (Ctrl+Shift+R)
- Try incognito mode

---

## Quick Summary

1. **Create project**: https://dash.cloudflare.com/pages → Create a project → Upload assets → Select `mastertools-deploy` folder → Deploy
2. **Add domain**: Custom domains tab → Set up custom domain → Enter `toolstack.dpdns.org` → Activate
3. **Wait**: 2-5 minutes
4. **Visit**: https://toolstack.dpdns.org

---

## Files to Upload

Make sure you're uploading the **contents** of the `mastertools-deploy` folder, not the folder itself.

**Correct structure after upload:**
```
/
├── index.html
├── sitemap.xml
├── css/
├── js/
├── tools/
├── build_seo_pages.py
└── ... (other files)
```

**NOT this:**
```
/
└── mastertools-deploy/
    ├── index.html
    ├── sitemap.xml
    └── ...
```

---

## Need Help?

If you're stuck:
1. Take a screenshot of the Cloudflare Pages dashboard
2. Tell me what you see
3. I'll guide you through the next step

---

**Last Updated:** 2026-07-13
**Status:** Ready to create new project