# Debugging Chat "Service Overloaded" Error

## Current Status
- ✅ Database migration complete (`lead_id` is now nullable)
- ✅ Session creation working
- ❌ Still getting "service overloaded" error

## What to Check

### 1. Check Server Logs
Look at your **server console** (where you run `npm run dev`) for error messages. You should see:
- `[Chat API] Starting Claude stream` - confirms API route is called
- `[Chat API] Stream created successfully` - confirms Claude API connection
- Any error messages with details

### 2. Check Environment Variables
Verify `CLAUDE_API_KEY` is set:

**Local Development:**
```bash
# Check if it's in .env.local
cat .env.local | grep CLAUDE_API_KEY
```

**Vercel/Production:**
- Go to Vercel Dashboard → Your Project → Settings → Environment Variables
- Verify `CLAUDE_API_KEY` is set

### 3. Test API Key
Your API key should:
- Start with `sk-ant-api03-` or `sk-ant-`
- Be from https://console.anthropic.com/
- Have credits/quota available

### 4. Check Browser Network Tab
1. Open DevTools (F12)
2. Go to **Network** tab
3. Send a message in chat
4. Look for the `/api/chat` request
5. Check:
   - **Status Code**: Should be 200 (not 500, 401, etc.)
   - **Response**: Should be streaming (text/event-stream)
   - **Preview/Response**: Should show streaming data

### 5. Common Issues

#### Issue: API Key Not Set
**Symptoms:**
- Error: "Claude API is not configured"
- No stream created

**Solution:**
- Set `CLAUDE_API_KEY` in `.env.local` (local) or Vercel (production)
- Restart dev server after adding to `.env.local`

#### Issue: Invalid API Key
**Symptoms:**
- Error: "Authentication error"
- Status 401

**Solution:**
- Verify key at https://console.anthropic.com/
- Check for typos
- Ensure key has proper permissions

#### Issue: Rate Limiting
**Symptoms:**
- Error: "Rate limit exceeded"
- Status 429

**Solution:**
- Wait a few minutes
- Check your Anthropic account limits
- Upgrade plan if needed

#### Issue: API Overloaded
**Symptoms:**
- Error: "Service overloaded"
- Status 529

**Solution:**
- Wait a few minutes
- This is temporary from Anthropic's side
- Retry later

#### Issue: Network Error
**Symptoms:**
- Error: "Network error"
- Request fails immediately

**Solution:**
- Check internet connection
- Check if Anthropic API is accessible
- Check firewall/proxy settings

## Debug Steps

1. **Check Server Console:**
   ```bash
   # Should see logs like:
   [Chat API] Starting Claude stream { hasApiKey: true, ... }
   [Chat API] Stream created successfully
   ```

2. **Check Browser Console:**
   - Look for the actual error message
   - Check Network tab for failed requests
   - Look for CORS errors

3. **Test API Key Directly:**
   ```bash
   curl https://api.anthropic.com/v1/messages \
     -H "x-api-key: YOUR_KEY" \
     -H "anthropic-version: 2023-06-01" \
     -H "content-type: application/json" \
     -d '{"model":"claude-3-5-sonnet-20241022","max_tokens":10,"messages":[{"role":"user","content":"Hi"}]}'
   ```

4. **Check Environment Variables:**
   ```bash
   # In your terminal
   echo $CLAUDE_API_KEY
   # Should show your key (or empty if not set)
   ```

## Next Steps

After checking the above:
1. Share the **server console logs** when you send a message
2. Share the **Network tab** details for the `/api/chat` request
3. Share any **error messages** from browser console

This will help identify the exact issue.

