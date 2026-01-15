# Root Directory Cleanup Plan

## Analysis Results

### ✅ Brand Apps Are Independent
- ✅ PROXE app: No imports from root `app/` or `src/`
- ✅ WINDCHASERS app: No imports from root `app/` or `src/`
- ✅ Both apps have their own `package.json`, `next.config.js`, `tsconfig.json`

## 🗑️ Files/Folders Safe to Delete

### 1. Old Root App Structure
```
app/
├── api/ (old API routes - brands have their own)
├── layout.tsx (old root layout)
├── page.tsx (old root page - commented out)
└── windchasers/page.tsx (old structure)
```
**Status:** ❌ **SAFE TO DELETE** - Not used by brand apps

### 2. Old Root Source Folder
```
src/
├── api/prompts/ (copied to each brand)
├── components/ (copied to each brand)
├── configs/ (copied to each brand)
├── contexts/ (copied to each brand)
├── hooks/ (copied to each brand)
├── lib/ (copied to each brand)
└── styles/ (copied to each brand)
```
**Status:** ❌ **SAFE TO DELETE** - All files copied to brand apps

### 3. Root Next.js Config Files
```
package.json (root)
next.config.js (root)
tsconfig.json (root)
next-env.d.ts (root)
package-lock.json (root)
```
**Status:** ❌ **SAFE TO DELETE** - Brands have their own configs

### 4. Documentation Files (Organize)
```
18 markdown files in root
```
**Status:** 📚 **ORGANIZE** - Move to `docs/` folder

## ✅ Keep These

### Essential Folders
- `proxe/` - Standalone PROXe app
- `windchasers/` - Standalone Windchasers app
- `public/` - Check if has shared assets (may be deletable)
- `.git/` - Git repository
- `.gitignore` - Git ignore rules
- `README.md` - Main project documentation

### Build Cache (Can Delete, Regenerates)
- `.next/` - Next.js build cache
- `node_modules/` - Dependencies (regenerate with npm install)

## 🗑️ Delete Commands

```bash
# Delete old root app structure
rm -rf app/

# Delete old root src folder
rm -rf src/

# Delete root config files
rm -f package.json
rm -f next.config.js
rm -f tsconfig.json
rm -f next-env.d.ts
rm -f package-lock.json

# Organize documentation (optional)
mkdir -p docs
mv *.md docs/ 2>/dev/null || true
# Keep README.md in root
mv docs/README.md . 2>/dev/null || true
```

## ⚠️ Check Before Deleting

### `public/` Folder
Check if it has shared assets that both brands need:
- If assets are duplicated in `proxe/public/` and `windchasers/public/`, root `public/` can be deleted
- If it has truly shared assets, keep it

## 📊 Summary

**Total files/folders to delete:**
- `app/` folder (~15 files)
- `src/` folder (~30 files)
- 5 root config files
- **Total: ~50 files/folders**

**Result:**
- Clean root directory
- Only brand apps and essential files remain
- Documentation organized in `docs/` folder
