# Fix PROXe Chat 404 Error

## Quick Fix Steps

### 1. Stop the dev server (Ctrl+C)

### 2. Clear Next.js cache
```bash
cd proxe
rm -rf .next
```

### 3. Restart dev server from proxe/ directory
```bash
cd proxe
npm run dev
```

### 4. Verify the route is working
Open browser console and check:
- Network tab should show `/api/chat` requests
- Should return 200 (not 404)

## Common Causes

1. **Running from wrong directory**: Must run from `proxe/`, not root
2. **Stale cache**: `.next` folder needs to be cleared
3. **Port conflict**: Make sure port 3000 is free

## Verify Route Structure

The route should be at:
```
proxe/src/app/api/chat/route.ts
```

And should export:
```typescript
export async function POST(request: NextRequest) {
  // ...
}
```

## Test the Route

After restarting, test with:
```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"test"}'
```

Should return a response (not 404).
