# Vercel Setup Instructions

## Critical Step: Set Root Directory in Vercel Dashboard

Vercel checks for Next.js **before** running build commands, so you **MUST** set the Root Directory in the dashboard.

### Steps:

1. **Go to Vercel Dashboard**
   - Open [vercel.com](https://vercel.com)
   - Select your project

2. **Open Project Settings**
   - Click on **Settings** tab
   - Then click **General** in the left sidebar

3. **Set Root Directory**
   - Scroll down to **Root Directory**
   - Click **Edit**
   - Type: `frontend`
   - Click **Save**

4. **Verify Settings**
   - After saving, Vercel should automatically:
     - Detect Next.js framework
     - Set Framework Preset to "Next.js"
     - Show package.json path as `frontend/package.json`

5. **Redeploy**
   - Go to **Deployments** tab
   - Click **Redeploy** on the latest deployment
   - OR push a new commit to trigger automatic deployment

## Why This Is Needed

- Vercel does framework detection **before** running build commands
- It looks for `package.json` in the root directory by default
- Our `package.json` is in `frontend/` directory
- Setting Root Directory tells Vercel to look in `frontend/` for detection

## After Setting Root Directory

The `vercel.json` will still work, but Vercel will:
- Run all commands from `frontend/` directory
- Find `package.json` correctly
- Detect Next.js framework automatically

## Alternative: Simplify vercel.json

If you set Root Directory to `frontend` in dashboard, you can simplify `vercel.json`:

```json
{
  "framework": "nextjs"
}
```

But the current `vercel.json` will also work once Root Directory is set.

