# Brand-Separated Structure Verification Report

## ✅ 1. IMPORTS CHECK

### PROXE Imports
- ✅ All `@/` imports resolve correctly
- ✅ No imports pointing to old `src/widgets/`
- ✅ No imports pointing to old `src/lib/supabase-proxe.ts`
- ✅ ChatWidget imports work: `@/components/ChatWidget`
- ✅ API routes import correctly: `@/lib/supabase`, `@/configs/brand.config`

### WINDCHASERS Imports
- ✅ All `@/` imports resolve correctly
- ✅ No imports pointing to old structure
- ✅ ChatWidget imports work: `@/components/ChatWidget`
- ✅ API routes import correctly: `@/lib/supabase`, `@/configs/brand.config`

## ✅ 2. TSCONFIG.JSON VERIFICATION

### PROXE (`proxe/tsconfig.json`)
```json
"paths": {
  "@/*": ["./src/*"]
}
```
✅ Correct - `@/*` maps to `./src/*`

### WINDCHASERS (`windchasers/tsconfig.json`)
```json
"paths": {
  "@/*": ["./src/*"]
}
```
✅ Correct - `@/*` maps to `./src/*`

## ✅ 3. NEXT.CONFIG.JS VERIFICATION

### PROXE (`proxe/next.config.js`)
```js
output: 'standalone',
reactStrictMode: true,
```
✅ Correct

### WINDCHASERS (`windchasers/next.config.js`)
```js
output: 'standalone',
reactStrictMode: true,
```
✅ Correct

## ⚠️ 4. BUILD STATUS

### PROXE Build
```bash
cd proxe && npm run build
```
✅ **BUILD SUCCESSFUL** - Compiled successfully

### WINDCHASERS Build
```bash
cd windchasers && npm run build
```
⚠️ **TYPE ERRORS FOUND** - Need to fix brand type definitions

**Issues:**
- `addUserInput` function expects `brand: 'proxe'` but receives `'windchasers'`
- `ensureAllLeads` function has similar type constraint
- Multiple functions in `chatSessions.ts` need brand type updated to `'proxe' | 'windchasers'`

**Fix Applied:**
- Updated `getSupabaseClient()` calls to not pass brand parameter (each app has its own client)
- Need to update function signatures to accept both brands

## 📋 5. OLD FILES TO DELETE

### Safe to Delete (Not Referenced):

1. **Old Widget Structure:**
   ```
   src/widgets/
   ├── proxe/
   │   ├── ChatWidget.module.css
   │   ├── ChatWidget.tsx
   │   ├── config.ts
   │   └── theme.css
   └── windchasers/
       ├── ChatWidget.module.css
       ├── ChatWidget.tsx
       ├── config.ts
       └── theme.css
   ```
   ✅ **SAFE TO DELETE** - No references found

2. **Old Supabase Files:**
   ```
   src/lib/supabase-proxe.ts
   src/lib/supabase-windchasers.ts
   src/lib/supabaseClient.ts
   ```
   ✅ **SAFE TO DELETE** - Each brand has its own `supabase.ts` in `proxe/src/lib/` and `windchasers/src/lib/`

3. **Old Shared ChatWidget:**
   ```
   src/components/shared/ChatWidget.tsx
   src/components/shared/ChatWidget.module.css
   ```
   ⚠️ **CHECK FIRST** - May be used by other components, but each brand has its own copy

### Keep (Still Used):
- `src/components/shared/` - Other shared components (Header, DarkVeil, etc.) are used by both brands
- `src/hooks/` - Shared hooks (useChat, useChatStream) are copied to each brand
- `src/lib/chatSessions.ts` - Shared logic (but each brand has its own copy)
- `src/lib/chatLocalStorage.ts` - Shared logic (but each brand has its own copy)
- `src/lib/promptBuilder.ts` - Shared logic (but each brand has its own copy)

## 🔧 6. FIXES NEEDED

### Windchasers Type Errors
1. Update `chatSessions.ts` function signatures to accept `'proxe' | 'windchasers'`
2. Update `ensureAllLeads` to accept windchasers brand
3. Update all brand type definitions

## 📝 SUMMARY

### ✅ Working:
- Import paths in both apps
- TypeScript configs
- Next.js configs
- PROXE build

### ⚠️ Needs Fix:
- Windchasers build (type errors)
- Brand type definitions in chatSessions.ts

### 📋 Safe to Delete:
- `src/widgets/` (entire folder)
- `src/lib/supabase-proxe.ts`
- `src/lib/supabase-windchasers.ts`
- `src/lib/supabaseClient.ts`
- `src/components/shared/ChatWidget.tsx` (verify not used first)
- `src/components/shared/ChatWidget.module.css` (verify not used first)
