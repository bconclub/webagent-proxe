# Port Configuration for Standalone Brand Apps

## Port Assignment

To run both brand apps simultaneously, they use different ports:

- **PROXe**: Port `3000`
- **Windchasers**: Port `3001`

## Running Both Apps

### Terminal 1 - PROXe
```bash
cd proxe
npm run dev
# Runs on http://localhost:3000
```

### Terminal 2 - Windchasers
```bash
cd windchasers
npm run dev
# Runs on http://localhost:3001
```

## Port Conflict Resolution

If you get `EADDRINUSE` error:

1. **Kill existing process on port 3000:**
   ```bash
   lsof -ti:3000 | xargs kill -9
   ```

2. **Or use a different port:**
   ```bash
   cd proxe
   npm run dev -- -p 3002
   ```

3. **Check what's using the port:**
   ```bash
   lsof -i:3000
   ```

## Configuration Files

- `proxe/package.json`: `"dev": "next dev -p 3000"`
- `windchasers/package.json`: `"dev": "next dev -p 3001"`
