# Automatic Deployment via GitHub

## Goal
Push code to GitHub → Auto-deploy to Cloudflare Pages → No manual work!

---

## Step 1: Create GitHub Repository (5 minutes)

### 1.1 Create New Repository

1. Go to: **https://github.com/new**
2. Repository name: `toolstack` (or `mastertools`)
3. Description: "ToolStack - 207+ Free Online Tools"
4. Set to **Private** or **Public** (your choice)
5. **DO NOT** initialize with README, .gitignore, or license
6. Click **Create repository**

### 1.2 Get Your Repository URL

After creating, you'll see a page with your repo URL. It looks like:
```
https://github.com/YOUR_USERNAME/toolstack.git
```

**Copy this URL!**

---

## Step 2: Connect Local Folder to GitHub (3 minutes)

Open Command Prompt/Terminal and run:

```bash
cd mastertools-deploy

# Initialize git repository
git init

# Add all files
git add .

# Commit files
git commit -m "Initial commit: ToolStack website with 207 tools"

# Rename branch to main
git branch -M main

# Add remote (replace with YOUR repository URL)
git remote add origin https://github.com/YOUR_USERNAME/toolstack.git

# Push to GitHub
git push -u origin main
```

**Replace `YOUR_USERNAME` with your actual GitHub username!**

---

## Step 3: Connect GitHub to Cloudflare Pages (2 minutes)

### 3.1 Connect Repository

1. Go to: **https://dash.cloudflare.com/pages**
2. Click your **mastertools** project
3. Go to **Settings** tab
4. Scroll to **Build settings** section
5. Click **Connect to Git**
6. Select **GitHub**
7. Authorize Cloudflare (if asked)
8. Select your repository: `toolstack` or `mastertools`

### 3.2 Configure Build Settings

**IMPORTANT:** Set these exact settings:

- **Build command**: (leave empty)
- **Build output directory**: `/` (just a forward slash)
- **Root directory**: `/` (just a forward slash)

**DO NOT** set any build command - your site is static HTML/CSS/JS!

### 3.3 Save and Deploy

1. Click **Save and Deploy**
2. Cloudflare will automatically deploy your site
3. Wait 2-3 minutes

---

## Step 4: Enable Automatic Deployments (1 minute)

### 4.1 Verify Webhook

1. In Cloudflare Pages, go to your project
2. Go to **Settings** → **Build settings**
3. Scroll to **Build hooks**
4. You should see a webhook URL like:
   ```
   https://api.cloudflare.com/client/v4/accounts/.../pages/projects/.../deployments
   ```

### 4.2 Test Auto-Deploy

Make a small change and push to GitHub:

```bash
cd mastertools-deploy

# Make a small change (for testing)
echo "<!-- Test -->" >> index.html

# Commit and push
git add .
git commit -m "Test auto-deploy"
git push
```

Wait 2-3 minutes and check your site - it should update automatically!

---

## Step 5: Future Updates (How It Works)

### Every time you want to update your site:

```bash
cd mastertools-deploy

# Make your changes (edit files, add tools, etc.)

# Commit and push
git add .
git commit -m "Description of changes"
git push
```

**That's it!** Cloudflare will automatically:
1. Detect the push
2. Deploy the changes
3. Update your live site

No manual uploads ever again!

---

## Step 6: Custom Domain (Already Done ✅)

Your custom domain `toolstack.dpdns.org` is already connected and will stay connected.

Every deployment will automatically use this domain.

---

## Workflow Summary

```
You make changes locally
         ↓
git commit -m "changes"
         ↓
git push
         ↓
GitHub receives code
         ↓
Cloudflare detects change
         ↓
Auto-deploys to production
         ↓
Site updates automatically
```

---

## Troubleshooting

### "Build failed" error?

**Problem:** Cloudflare is trying to build your site but there's no build command.

**Solution:**
1. Go to Cloudflare Pages → Settings → Build settings
2. Clear the **Build command** field (leave empty)
3. Set **Build output directory** to `/`
4. Save and trigger new deployment

### Changes not showing up?

**Problem:** Deployment might be stuck or failed.

**Solution:**
1. Go to Cloudflare Pages → Deployments
2. Check latest deployment status
3. If failed, click **Retry deployment**
4. Wait 2-3 minutes

### "Repository not found" error?

**Problem:** Cloudflare can't access your GitHub repo.

**Solution:**
1. Make sure repo is public, OR
2. Re-authorize Cloudflare in GitHub settings
3. Go to: https://github.com/settings/installations
4. Find Cloudflare Pages and grant access

---

## Pro Tips

### 1. Use Git Branches

```bash
# Create a branch for testing
git checkout -b test-changes

# Make changes, test locally
# When ready, merge to main
git checkout main
git merge test-changes
git push
```

### 2. View Deployment Status

```bash
# Check latest deployment
git push

# Go to Cloudflare dashboard to see progress
```

### 3. Rollback if Needed

1. Go to Cloudflare Pages → Deployments
2. Find previous working deployment
3. Click **...** → **Rollback to this deployment**

---

## What You Get

✅ **Automatic deployments** - Push to GitHub, site updates
✅ **No manual uploads** - Ever again!
✅ **Version control** - All changes tracked in Git
✅ **Rollback capability** - Revert to any previous version
✅ **Team collaboration** - Others can contribute
✅ **CI/CD** - Professional deployment pipeline

---

## Quick Reference

| Action | Command |
|--------|---------|
| Make changes | Edit files locally |
| Save changes | `git add .` |
| Commit | `git commit -m "message"` |
| Deploy | `git push` |
| Check status | `git status` |
| View history | `git log` |

---

## Need Help?

**GitHub Docs:** https://docs.github.com
**Cloudflare Pages Docs:** https://developers.cloudflare.com/pages
**Git Docs:** https://git-scm.com/doc

---

**Last Updated:** 2026-07-13
**Status:** Ready for GitHub auto-deploy setup