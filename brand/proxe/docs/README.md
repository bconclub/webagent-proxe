# PROXe Documentation

This directory contains documentation specific to the PROXe brand application.

## Available Documentation

- `README.md` - This file
- `ENV_SETUP.md` - Environment variable setup instructions
- `FIX_CHAT_404.md` - Troubleshooting guide for chat 404 errors

## Application Location

The PROXe Next.js application is located in `../build/`

## ⚠️ Important: Working Directory

**You must be in the `build/` directory to run npm commands!**

The `package.json` is located in `brand/proxe/build/`, not in `brand/proxe/`.

## Quick Start

```bash
# Navigate to the build directory (IMPORTANT!)
cd ../build

# Verify you're in the right place
ls package.json  # Should show package.json exists

# Install dependencies
npm install

# Run development server
npm run dev
```

## Troubleshooting

If you get an error like:
```
npm ERR! enoent ENOENT: no such file or directory, open 'package.json'
```

**Solution**: Make sure you're in the `build/` subdirectory:
```bash
cd brand/proxe/build
```

## Database

Database schemas and migrations are located in `../supabase/`
