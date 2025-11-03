# Vercel Root Directory Configuration - CRITICAL

## The Problem

Vercel is showing: "No Next.js version detected" because it's looking for `package.json` in the **root directory**, but your Next.js app is in the `frontend/` subdirectory.

## The Solution - MUST DO THIS IN VERCEL DASHBOARD

Vercel **CANNOT** detect the Next.js app until you set the Root Directory in the dashboard.

### Step-by-Step Instructions:

1. **Go to Vercel Dashboard**
   - Open https://vercel.com
   - Sign in and select your project

2. **Open Project Settings**
   - Click on **Settings** tab (at the top)
   - In the left sidebar, click **General**

3. **Find Root Directory Setting**
   - Scroll down to find **"Root Directory"** section
   - It should show either:
     - Empty/blank (default - looks in root)
     - OR some other value

4. **Set Root Directory**
   - Click **Edit** or **Change** button next to Root Directory
   - Type exactly: `frontend`
   - **DO NOT** include a trailing slash
   - Click **Save**

5. **Verify the Setting**
   - After saving, you should see:
     - Root Directory: `frontend`
     - Vercel will now look for `package.json` in `frontend/package.json`
     - Framework should auto-detect as "Next.js"

6. **Redeploy**
   - Go to **Deployments** tab
   - Find the latest failed deployment
   - Click **...** (three dots) → **Redeploy**
   - OR just wait for the next git push (it will auto-redeploy)

## Why This Is Required

Vercel's framework detection runs **BEFORE** build commands. It checks:
1. Looks in Root Directory (default: repository root)
2. Finds `package.json`
3. Checks if "next" is in dependencies
4. If found → detects Next.js
5. If not found → shows error

**Your `package.json` is in `frontend/`, not the root!**

## Verification Checklist

After setting Root Directory to `frontend`:

- [ ] Root Directory shows `frontend` in dashboard
- [ ] Framework Preset shows "Next.js" (auto-detected)
- [ ] Build Command shows `npm run build` (running from frontend/)
- [ ] Output Directory shows `.next` (relative to frontend/)
- [ ] Deployments tab shows a new deployment starting

## Alternative: Move package.json to Root (NOT RECOMMENDED)

If for some reason you can't set Root Directory, you could:
1. Move `frontend/package.json` to root
2. Move all frontend files to root
3. But this would break the backend/frontend separation

**Setting Root Directory in dashboard is the correct solution.**

## Still Not Working?

If you've set Root Directory but it's still failing:

1. **Double-check the spelling**: Must be exactly `frontend` (lowercase, no slash)
2. **Clear cache**: In Vercel, try "Redeploy" → "Use existing Build Cache" → OFF
3. **Check git structure**: Verify `frontend/package.json` exists in your GitHub repo
4. **Look at build logs**: Check the exact error message for more clues

## Current File Structure (Correct)

```
/
├── backend/
│   └── package.json        (Backend dependencies)
├── frontend/
│   ├── package.json         (Next.js dependencies - THIS is what Vercel needs)
│   ├── next.config.js
│   └── ...
├── vercel.json              (Points to frontend/)
└── README.md
```

Vercel must be told to look in `frontend/` via the Root Directory setting.

