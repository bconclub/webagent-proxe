# How to Add CLAUDE_API_KEY to Vercel - Step by Step

## Quick Steps

### Step 1: Get Your Claude API Key
1. Go to: **https://console.anthropic.com/**
2. Sign in (or create an account if you don't have one)
3. Click on **"API Keys"** in the left sidebar
4. Click **"Create Key"** or **"New Key"**
5. Give it a name (e.g., "PROXe Chat Widget")
6. **Copy the key** (it starts with `sk-ant-api03-`)
   - ⚠️ **Important**: Copy it immediately - you won't be able to see it again!

### Step 2: Add to Vercel

1. **Go to Vercel Dashboard**
   - Visit: **https://vercel.com**
   - Sign in with your account

2. **Select Your Project**
   - Find your project (likely named something like "webagent-proxe" or similar)
   - Click on the project name

3. **Navigate to Settings**
   - Click on **"Settings"** tab at the top
   - In the left sidebar, click **"Environment Variables"**

4. **Add the Environment Variable**
   - Click the **"Add New"** button (or "Add" button)
   - Fill in:
     - **Key**: `CLAUDE_API_KEY` (exactly like this, case-sensitive)
     - **Value**: Paste your API key (the one you copied from Anthropic)
     - **Environment**: Select all three:
       - ☑️ Production
       - ☑️ Preview  
       - ☑️ Development
   - Click **"Save"**

### Step 3: Redeploy

After adding the environment variable, you need to redeploy:

**Option A: Automatic Redeploy**
- Vercel may automatically redeploy when you add an environment variable
- Check the **"Deployments"** tab to see if it's deploying

**Option B: Manual Redeploy**
1. Go to **"Deployments"** tab
2. Find your latest deployment
3. Click the **"..."** (three dots) menu
4. Click **"Redeploy"**
5. Confirm the redeploy

### Step 4: Verify It's Working

1. Wait for the deployment to complete (check the **"Deployments"** tab)
2. Visit your live site URL
3. Try sending a message in the chat
4. The error should be gone!

## Visual Guide

```
Vercel Dashboard
  └── Your Project
      └── Settings (tab at top)
          └── Environment Variables (left sidebar)
              └── Add New
                  ├── Key: CLAUDE_API_KEY
                  ├── Value: sk-ant-api03-...
                  └── Environment: ☑️ Production ☑️ Preview ☑️ Development
```

## Troubleshooting

**"I don't see Environment Variables option"**
- Make sure you're in the **Settings** tab
- Check that you have permission to modify the project

**"The key isn't working after redeploy"**
- Double-check you spelled `CLAUDE_API_KEY` exactly (case-sensitive)
- Make sure you selected all environments (Production, Preview, Development)
- Wait a few minutes and try redeploying again
- Check Vercel function logs: Settings → Functions → View Logs

**"I don't have a Claude API key"**
- Go to https://console.anthropic.com/
- Sign up or sign in
- Navigate to API Keys section
- Create a new key

## After Setup

Once you've added the environment variable and redeployed:
- ✅ The chat should work without errors
- ✅ You can send messages and get AI responses
- ✅ The error message about CLAUDE_API_KEY will be gone

## Important Notes

- Environment variables take effect **after redeployment**
- Make sure to select **all three environments** (Production, Preview, Development)
- The key name must be exactly: `CLAUDE_API_KEY` (case-sensitive)
- Never share your API key publicly or commit it to git


