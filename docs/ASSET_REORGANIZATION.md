# Asset Reorganization - Brand-Specific Structure

## Summary

Reorganized public assets into brand-specific folders for cleaner structure and better multi-brand support.

## New Structure

```
public/
└── brands/
    ├── proxe/
    │   ├── logo.svg                    # PROXE.svg (copied)
    │   ├── icon.svg                    # PROXE-White-Icon.svg (copied)
    │   ├── favicon.ico                 # Moved from /assets/
    │   ├── PROXE.svg                   # Original PROXE logo
    │   ├── PROXE-White.svg             # White variant
    │   ├── PROXE-White-Icon.svg        # White icon variant
    │   └── assets/
    │       ├── Command Center.webp
    │       ├── Markx.mp4
    │       ├── Models.webp
    │       ├── one memmory one vioce.webp
    │       ├── PROXe Favicon.png
    │       ├── Proxe-Logo.png
    │       ├── Self learning.webp
    │       └── Water.mp4
    │
    └── windchasers/
        ├── logo.svg                    # Placeholder (ready for assets)
        ├── icon.svg                    # Placeholder (ready for assets)
        └── assets/                     # Empty (ready for Windchasers assets)
```

## Path Updates

### Files Updated:

1. **app/layout.tsx**
   - `/assets/favicon.ico` → `/brands/proxe/favicon.ico`

2. **app/page.tsx**
   - `/assets/proxe/Self learning.webp` → `/brands/proxe/assets/Self learning.webp`
   - `/assets/proxe/Models.webp` → `/brands/proxe/assets/Models.webp`
   - `/assets/proxe/one memmory one vioce.webp` → `/brands/proxe/assets/one memmory one vioce.webp`
   - `/assets/proxe/Command Center.webp` → `/brands/proxe/assets/Command Center.webp`

3. **src/components/shared/Header.tsx**
   - `/assets/proxe/Proxe-Logo.png` → `/brands/proxe/assets/Proxe-Logo.png`

4. **src/widgets/proxe/ChatWidget.tsx**
   - `/assets/proxe/Markx.mp4` → `/brands/proxe/assets/Markx.mp4`

5. **src/widgets/windchasers/config.ts**
   - `/assets/icons/windchasers-logo.svg` → `/brands/windchasers/logo.svg`

6. **src/widgets/windchasers/ChatWidget.tsx**
   - `/assets/proxe/Markx.mp4` → `/brands/proxe/assets/Markx.mp4` (legacy reference updated)

7. **src/components/shared/ChatWidget.tsx**
   - `/assets/proxe/Markx.mp4` → `/brands/proxe/assets/Markx.mp4` (legacy reference updated)

## Assets Moved

### PROXe Assets:
- ✅ All files from `public/assets/proxe/` → `public/brands/proxe/assets/`
- ✅ `public/assets/favicon.ico` → `public/brands/proxe/favicon.ico`
- ✅ PROXe logo SVGs → `public/brands/proxe/`
- ✅ Created `logo.svg` and `icon.svg` for standard naming

### Windchasers Assets:
- ✅ Created folder structure
- ✅ Created placeholder `logo.svg` and `icon.svg` files
- ⏳ Ready for Windchasers assets to be added

## Benefits

1. **Cleaner Structure**: Brand-specific assets are clearly organized
2. **Easy to Scale**: Adding new brands is straightforward
3. **No Conflicts**: Each brand has its own asset namespace
4. **Standard Naming**: `logo.svg` and `icon.svg` for consistent access

## Next Steps

1. Add Windchasers logo and icon files to `public/brands/windchasers/`
2. Add Windchasers brand assets to `public/brands/windchasers/assets/`
3. Update Windchasers widget to use brand-specific assets
4. Consider deleting old `src/components/shared/ChatWidget.tsx` if no longer needed

## Notes

- Shared icons (like `infinity.svg`, `browser-stroke-rounded.svg`) remain in `public/assets/icons/` as they're used across brands
- PROXe-specific icons (PROXE*.svg) moved to brand folder
- All PROXe image/video assets moved to brand-specific folder
