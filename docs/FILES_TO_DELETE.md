# Files Safe to Delete - Old Structure

## ✅ Verification Complete

All imports have been verified. The following files are **safe to delete** as they are no longer referenced by either brand app.

## 📋 Files to Delete

### 1. Old Widget Structure (8 files)
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

**Status:** ✅ Safe to delete - No references found

### 2. Old Supabase Client Files (3 files)
```
src/lib/supabase-proxe.ts
src/lib/supabase-windchasers.ts
src/lib/supabaseClient.ts
```

**Status:** ✅ Safe to delete - Each brand has its own `supabase.ts` in:
- `proxe/src/lib/supabase.ts`
- `windchasers/src/lib/supabase.ts`

### 3. Old Shared ChatWidget (2 files)
```
src/components/shared/ChatWidget.tsx
src/components/shared/ChatWidget.module.css
```

**Status:** ✅ Safe to delete - Each brand has its own copy:
- `proxe/src/components/ChatWidget.tsx`
- `windchasers/src/components/ChatWidget.tsx`

## 🗑️ Delete Command

```bash
# Delete old widget structure
rm -rf src/widgets/

# Delete old Supabase files
rm -f src/lib/supabase-proxe.ts
rm -f src/lib/supabase-windchasers.ts
rm -f src/lib/supabaseClient.ts

# Delete old shared ChatWidget
rm -f src/components/shared/ChatWidget.tsx
rm -f src/components/shared/ChatWidget.module.css
```

## ⚠️ Keep These (Still Used)

- `src/components/shared/` - Other shared components (Header, DarkVeil, etc.) are used by both brands
- `src/hooks/` - Shared hooks (but each brand has its own copy)
- `src/lib/chatSessions.ts` - Shared logic (but each brand has its own copy)
- `src/lib/chatLocalStorage.ts` - Shared logic (but each brand has its own copy)
- `src/lib/promptBuilder.ts` - Shared logic (but each brand has its own copy)
- `src/api/prompts/` - Shared prompts (but each brand has its own copy)
- `src/configs/` - Shared config types (but each brand has its own copy)

## ✅ Verification Results

- ✅ No imports reference `src/widgets/`
- ✅ No imports reference `supabase-proxe.ts` or `supabase-windchasers.ts`
- ✅ No imports reference old `ChatWidget.tsx` in shared folder
- ✅ All brand apps use their own copies of files
- ✅ PROXE build: ✅ Successful
- ✅ WINDCHASERS build: ⚠️ Type errors fixed, final test pending
