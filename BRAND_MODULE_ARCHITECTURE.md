# Brand-Based Module Architecture

## Overview

The Website build has been restructured to use a brand-based module architecture where each brand (PROXe and Windchasers) is completely self-contained in its own folder.

## New Structure

```
Website-PROXe/
├── proxe/                          # PROXe brand module (self-contained)
│   ├── components/
│   │   ├── ChatWidget.tsx         # PROXe chat widget
│   │   └── ChatWidget.module.css  # Widget styles
│   ├── config/
│   │   └── brand.config.ts        # PROXe configuration
│   ├── lib/
│   │   └── supabase.ts            # PROXe Supabase client
│   ├── styles/
│   │   └── theme.css              # PROXe theme CSS variables
│   └── public/                    # PROXe assets (copied to public/proxe/)
│       ├── assets/                # Images, videos, logos
│       ├── favicon.ico
│       ├── logo.svg
│       └── icon.svg
│
├── windchasers/                    # Windchasers brand module (self-contained)
│   ├── components/
│   │   ├── ChatWidget.tsx         # Windchasers chat widget
│   │   └── ChatWidget.module.css  # Widget styles
│   ├── config/
│   │   └── brand.config.ts        # Windchasers configuration
│   ├── lib/
│   │   └── supabase.ts            # Windchasers Supabase client
│   ├── styles/
│   │   └── theme.css              # Windchasers theme CSS variables
│   └── public/                    # Windchasers assets (copied to public/windchasers/)
│       ├── assets/                # Images, videos, logos
│       ├── logo.svg
│       └── icon.svg
│
├── app/                            # Next.js App Router (routing layer)
│   ├── layout.tsx                  # Root layout
│   ├── page.tsx                    # PROXe homepage (/)
│   ├── windchasers/
│   │   └── page.tsx                # Windchasers page (/windchasers)
│   └── api/
│       ├── proxe/
│       │   └── chat/
│       │       └── route.ts        # PROXe chat API (/api/proxe/chat)
│       └── windchasers/
│           └── chat/
│               └── route.ts       # Windchasers chat API (/api/windchasers/chat)
│
├── public/                         # Next.js public folder
│   ├── proxe/                      # PROXe public assets
│   │   ├── assets/                 # Images, videos
│   │   ├── favicon.ico
│   │   ├── logo.svg
│   │   └── icon.svg
│   └── windchasers/                # Windchasers public assets
│       ├── assets/
│       ├── logo.svg
│       └── icon.svg
│
├── src/                            # Shared code (minimal)
│   ├── app/                        # Shared app utilities
│   ├── components/shared/          # Shared UI components
│   ├── hooks/                      # Shared React hooks
│   ├── lib/                        # Shared libraries (chatSessions, etc.)
│   ├── contexts/                   # Shared React contexts
│   └── configs/                    # Shared type definitions
│
├── package.json
├── next.config.js
├── tsconfig.json
└── .env.local
```

## Key Principles

1. **Complete Isolation**: Each brand folder contains everything needed for that brand
2. **No Shared Widget Code**: Each brand has its own ChatWidget.tsx
3. **Brand-Specific APIs**: Each brand has its own API route
4. **Brand-Specific Supabase**: Each brand uses its own Supabase client
5. **Brand-Specific Assets**: Each brand has its own public assets folder
6. **Shared Infrastructure**: Only truly shared code (hooks, utilities) remains in `src/`

## Import Paths

### From Brand Modules:
```typescript
// PROXe imports
import { ChatWidget } from '@/proxe/components/ChatWidget';
import { proxeConfig } from '@/proxe/config/brand.config';
import { getSupabaseClient } from '@/proxe/lib/supabase';
import '@/proxe/styles/theme.css';

// Windchasers imports
import { ChatWidget } from '@/windchasers/components/ChatWidget';
import { windchasersConfig } from '@/windchasers/config/brand.config';
import { getSupabaseClient } from '@/windchasers/lib/supabase';
import '@/windchasers/styles/theme.css';
```

### Public Assets:
```typescript
// PROXe assets
<img src="/proxe/assets/Proxe-Logo.png" />
<source src="/proxe/assets/Markx.mp4" />

// Windchasers assets
<img src="/windchasers/assets/logo.png" />
```

## API Routes

- **PROXe**: `/api/proxe/chat` → `app/api/proxe/chat/route.ts`
- **Windchasers**: `/api/windchasers/chat` → `app/api/windchasers/chat/route.ts`

## Configuration

Each brand's config is in its own folder:
- `proxe/config/brand.config.ts` - PROXe configuration
- `windchasers/config/brand.config.ts` - Windchasers configuration

## Benefits

1. **Scalability**: Easy to add new brands by copying a brand folder
2. **Maintainability**: Each brand is self-contained and easy to understand
3. **No Conflicts**: Brand-specific code can't accidentally interfere
4. **Clear Structure**: Easy to find brand-specific code
5. **Independent Development**: Teams can work on different brands independently

## Migration Summary

### Files Moved:
- ✅ `src/widgets/proxe/*` → `proxe/`
- ✅ `src/widgets/windchasers/*` → `windchasers/`
- ✅ `src/lib/supabase-proxe.ts` → `proxe/lib/supabase.ts`
- ✅ `src/lib/supabase-windchasers.ts` → `windchasers/lib/supabase.ts`
- ✅ `app/api/chat/proxe/route.ts` → `app/api/proxe/chat/route.ts`
- ✅ `app/api/chat/windchasers/route.ts` → `app/api/windchasers/chat/route.ts`
- ✅ `public/brands/proxe/*` → `public/proxe/`
- ✅ `public/brands/windchasers/*` → `public/windchasers/`

### Imports Updated:
- ✅ All brand module imports use `@/proxe/` and `@/windchasers/` paths
- ✅ Public asset paths updated to `/proxe/` and `/windchasers/`
- ✅ API URLs updated in configs

## Next Steps

1. Test both brands independently
2. Verify all imports resolve correctly
3. Test API routes work with new paths
4. Clean up old `src/widgets/` folder if no longer needed
5. Update documentation with new structure
