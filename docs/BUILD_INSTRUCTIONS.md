# Build Instructions for Standalone Brand Apps

## ⚠️ IMPORTANT: Build from Brand Directory

Each brand is a **standalone Next.js application**. You **MUST** build from within the brand directory, not from the root.

## ✅ Correct Build Process

### PROXe Build
```bash
cd proxe
npm install
npm run build
npm run start
```

### Windchasers Build
```bash
cd windchasers
npm install
npm run build
npm run start
```

## ❌ Incorrect Build Process

**DO NOT** run `npm run build` from the root directory. The root `app/` folder contains old imports that will cause build errors.

## Development

### PROXe Development
```bash
cd proxe
npm install
npm run dev
# Runs on http://localhost:3000
```

### Windchasers Development
```bash
cd windchasers
npm install
npm run dev
# Runs on http://localhost:3000
```

## Why This Structure?

Each brand (`proxe/` and `windchasers/`) is a **completely standalone Next.js application** with:
- Own `package.json`
- Own `next.config.js`
- Own `tsconfig.json`
- Own `src/` folder
- Own `public/` folder
- Own dependencies

They can be built and deployed **independently** without any shared code.

## Troubleshooting

If you see errors like:
```
Error: Failed to read source code from .../proxe/components/ChatWidget.tsx
```

This means you're building from the **root directory** instead of from within `proxe/` or `windchasers/`.

**Solution**: Always `cd` into the brand directory before running build commands.
