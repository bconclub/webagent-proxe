# Environment Variable Setup Guide

## Where to Set `CLAUDE_API_KEY`

### For Local Development

1. **Create a file called `.env.local` in the root directory** (same level as `package.json`)

   ```
   Webiste PROXe/
   ├── .env.local          ← Create this file here
   ├── package.json
   ├── next.config.js
   └── ...
   ```

2. **Add your API key to the file:**

   ```env
   CLAUDE_API_KEY=sk-ant-api03-your-key-here
   ```

3. **Get your API key:**
   - Visit: https://console.anthropic.com/
   - Sign in or create an account
   - Go to API Keys section
   - Create a new API key
   - Copy it and paste into `.env.local`

4. **Restart your dev server** after creating/updating `.env.local`

### For Vercel Production Deployment

1. **Go to your Vercel Dashboard:**
   - Visit: https://vercel.com
   - Sign in and select your project

2. **Navigate to Settings:**
   - Click on your project
   - Go to **Settings** tab
   - Click **Environment Variables** in the left sidebar

3. **Add the variable:**
   - Click **Add New**
   - **Key:** `CLAUDE_API_KEY`
   - **Value:** `sk-ant-api03-your-key-here` (your actual API key)
   - **Environment:** Select all (Production, Preview, Development)
   - Click **Save**

4. **Redeploy:**
   - Vercel will automatically redeploy when you add environment variables
   - Or go to **Deployments** tab and click **Redeploy**

## File Structure

```
Webiste PROXe/
├── .env.local          ← Create this for local dev (NOT in git)
├── .gitignore         ← .env files are already ignored
├── package.json
├── next.config.js
└── app/
    └── api/
        └── chat/
            └── route.ts   ← This file reads CLAUDE_API_KEY
```

## Important Notes

- `.env.local` is gitignored (won't be committed to git) - this is correct!
- Never commit API keys to git
- The API key should start with `sk-ant-api03-`
- Restart your dev server after creating/updating `.env.local`
- For Vercel, set the variable in the dashboard (not in code)

## Verify It's Working

After setting up:
1. Restart your dev server: `npm run dev`
2. Try sending a message in the chat
3. Check the console/network tab for errors
4. The error about `CLAUDE_API_KEY not configured` should be gone

