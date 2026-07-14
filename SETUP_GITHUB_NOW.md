# Setup GitHub Auto-Deployment (10 Minutes Total)

## Problem
- Your site still shows "ToolStack" 
- Files are renamed locally but not deployed
- You want automatic deployments (no manual uploads)

## Solution
Set up GitHub + Cloudflare auto-deploy ONCE, then never manually upload again!

---

## PART 1: Create GitHub Repository (3 minutes)

### Step 1.1: Create Repository

1. Open this link: **https://github.com/new**
2. Fill in:
   - **Repository name**: `toolstack`
   - **Description**: `ToolStack - 207+ Free Online Tools`
   - **Visibility**: Public (or Private)
3. **IMPORTANT**: Uncheck all checkboxes:
   - ❌ Add a README file
   - ❌ Add .gitignore
   - ❌ Choose a license
4. Click **Create repository**

### Step 1.2: Copy Your Repository URL

After creating, you'll see your repository URL. It looks like:
```
https://github.com/YOUR_USERNAME/toolstack.git
```

**Copy this URL!** (You'll need it in Step 2)

---

## PART 2: Push Your Code to GitHub (5 minutes)

### Step 2.1: Open Command Prompt

Press `Win + R`, type `cmd`, press Enter

### Step 2.2: Run These Commands

```bash
cd ToolStack

git init

git add .

git commit -m "Initial commit: ToolStack website with 207 tools"

git branch -M main

git remote add origin https://github.com/YOUR_USERNAME/toolstack.git
```

**⚠️ IMPORTANT**: Replace `YOUR_USERNAME` with your actual GitHub username!

Example:
```bash
git remote add origin https://github.com/johndoe/toolstack.git
```

### Step 2.3: Push to GitHub

```bash
git push -u origin main
```

It will ask for your GitHub username and password:
- **Username**: Your GitHub username
- **Password**: Use a Personal Access Token (not your GitHub password)

**If you don't have a Personal Access Token:**
1. Go to: https://github.com/settings/tokens
2. Click **Generate new token** → **Generate new token (classic)**
3. Note: `toolstack-deploy`
4. Expiration: `90 days`
5. Scopes: Check **repo**
6. Click **Generate token**
7. **Copy the token** (you'll need it for the password)

---

## PART 3: Connect GitHub to Cloudflare (2 minutes)

### Step 3.1: Go to Cloudflare Pages

1. Open: **https://dash.cloudflare.com/pages**
2. Click your **toolstack** project

### Step 3.2: Connect Git Repository

1. Click **Settings** tab
2. Scroll to **Build settings** section
3. Click **Connect to Git**
4. Select **GitHub**
5. Authorize Cloudflare (click Authorize button)
6. Select your repository: `toolstack`

### Step 3.3: Configure Build Settings

**Set these EXACT settings:**

- **Project name**: `toolstack` (or keep `toolstack`)
- **Production branch**: `main`
- **Build command**: (LEAVE EMPTY - don't type anything)
- **Build output directory**: `/` (just a forward slash)
- **Root directory**: `/` (just a forward slash)

**⚠️ CRITICAL**: Leave "Build command" EMPTY! Your site is static HTML.

### Step 3.4: Save and Deploy

1. Click **Save and Deploy**
2. Cloudflare will start deploying
3. Wait 2-3 minutes

---

## PART 4: Verify It Works (1 minute)

### Step 4.1: Check Deployment

1. In Cloudflare Pages, go to **Deployments** tab
2. You should see a deployment in progress
3. Wait for it to show **Success**

### Step 4.2: Check Your Site

1. Open: **https://toolstack.dpdns.org**
2. You should now see:
   - ✅ "ToolStack" in the title
   - ✅ "ToolStack" in the footer
   - ✅ "ToolStack" in the header
   - ✅ All 207 tools with new branding

### Step 4.3: Test Auto-Deploy

Make a test change:

```bash
cd ToolStack

# Add a test comment
echo "<!-- Auto-deploy test -->" >> index.html

# Commit and push
git add .
git commit -m "Test auto-deploy"
git push
```

Wait 2-3 minutes and refresh your site. It should update automatically!

---

## 🎉 SUCCESS! You Now Have:

✅ **Automatic deployments** - Push to GitHub, site updates
✅ **No manual uploads** - Ever again!
✅ **Version control** - All changes tracked
✅ **Rollback capability** - Revert if needed
✅ **Professional CI/CD** - Auto-deployment pipeline

---

## 📋 How to Update Your Site (From Now On)

```bash
cd ToolStack

# 1. Make your changes (edit files, add tools, etc.)

# 2. Commit changes
git add .
git commit -m "Description of what you changed"

# 3. Deploy
git push
```

**That's it!** Cloudflare automatically deploys within 2-3 minutes.

---

## 🔧 Troubleshooting

### "Build failed" Error?

**Fix:**
1. Go to Cloudflare Pages → Settings → Build settings
2. **Clear the "Build command" field** (leave it empty)
3. Set **Build output directory** to `/`
4. Click **Save**
5. Trigger new deployment

### "Repository not found"?

**Fix:**
1. Make sure repository is **Public**, OR
2. Re-authorize Cloudflare:
   - Go to: https://github.com/settings/installations
   - Find Cloudflare Pages
   - Grant access to your repository

### Changes not showing?

**Fix:**
1. Go to Cloudflare Pages → Deployments
2. Check if deployment is **In progress** or **Failed**
3. If failed, click **Retry deployment**
4. Wait 2-3 minutes
5. Clear browser cache (Ctrl+Shift+R)

### Can't push to GitHub (authentication error)?

**Fix:**
1. Use Personal Access Token as password (not GitHub password)
2. Or use SSH keys for authentication
3. Make sure you have write access to the repository

---

## 📊 Your Deployment Workflow

```
Edit files locally
         ↓
git add .
         ↓
git commit -m "changes"
         ↓
git push
         ↓
GitHub receives code
         ↓
Cloudflare detects push
         ↓
Auto-deploys (2-3 min)
         ↓
Site updates automatically
```

---

## 🎯 What You Get

| Feature | Benefit |
|---------|---------|
| Auto-deployment | Push code → Site updates |
| No manual uploads | Never drag & drop files again |
| Version control | Track all changes in Git |
| Rollback | Revert to any previous version |
| Backup | Code stored on GitHub |
| Collaboration | Others can contribute |

---

## 📚 Additional Resources

- **GitHub Docs**: https://docs.github.com
- **Cloudflare Pages Docs**: https://developers.cloudflare.com/pages
- **Git Tutorial**: https://git-scm.com/doc

---

## ✅ Checklist

- [ ] Created GitHub repository
- [ ] Pushed code to GitHub
- [ ] Connected GitHub to Cloudflare Pages
- [ ] Configured build settings (no build command!)
- [ ] First deployment successful
- [ ] Site shows "ToolStack" branding
- [ ] Test auto-deploy works

---

**Last Updated:** 2026-07-13
**Status:** Ready for one-time setup