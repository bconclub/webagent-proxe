# Claude Model Configuration

## Available Models

You can switch Claude models by setting the `CLAUDE_MODEL` environment variable. Here are the available options:

### Recommended Models

1. **claude-3-5-sonnet-20240620** (Default)
   - Best balance of speed and quality
   - Good for general chat and conversations
   - Lower cost than Opus
   - Stable and widely available

2. **claude-3-opus-20240229**
   - Most capable model
   - Best for complex reasoning
   - Higher cost, slower

3. **claude-3-haiku-20240307**
   - Fastest and cheapest
   - Good for simple queries
   - Less capable for complex tasks

4. **claude-sonnet-4-20250514** (Original)
   - Latest Sonnet 4 model
   - May have availability issues

## How to Change Model

### Local Development

Add to your `.env.local` file:

```env
CLAUDE_MODEL=claude-3-5-sonnet-20240620
```

Or try:

```env
CLAUDE_MODEL=claude-3-opus-20240229
```

```env
CLAUDE_MODEL=claude-3-haiku-20240307
```

### Vercel/Production

1. Go to Vercel Dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. Add `CLAUDE_MODEL` with your preferred model
5. Redeploy

## Model Comparison

| Model | Speed | Quality | Cost | Best For |
|-------|-------|---------|------|----------|
| claude-3-5-sonnet-20240620 | Fast | High | Medium | **Recommended** - General use |
| claude-3-opus-20240229 | Slow | Highest | High | Complex reasoning |
| claude-3-haiku-20240307 | Fastest | Good | Low | Simple queries, high volume |
| claude-sonnet-4-20250514 | Fast | High | Medium | Latest features (may have availability issues) |

## Current Issue

If you're getting "overloaded" errors with `claude-sonnet-4-20250514`, try switching to `claude-3-5-sonnet-20240620` which is more stable and widely available.

## Quick Fix

Add this to your `.env.local`:

```env
CLAUDE_MODEL=claude-3-5-sonnet-20240620
```

Then restart your dev server.

