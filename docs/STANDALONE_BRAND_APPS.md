# Standalone Brand Applications - Complete Structure

## Overview

Each brand (PROXe and Windchasers) is now a **completely standalone Next.js application** that can be built, deployed, and run independently.

## Complete Folder Structure

```
Website-PROXe/
├── proxe/                          # Standalone PROXe Next.js App
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx          # Root layout
│   │   │   ├── page.tsx            # Homepage
│   │   │   ├── page.module.css     # Homepage styles
│   │   │   └── api/
│   │   │       ├── chat/
│   │   │       │   └── route.ts    # Chat API
│   │   │       ├── chat/summarize/
│   │   │       │   └── route.ts     # Summarize API
│   │   │       └── calendar/       # Calendar APIs
│   │   ├── components/
│   │   │   ├── ChatWidget.tsx      # PROXe chat widget
│   │   │   ├── ChatWidget.module.css
│   │   │   ├── shared/             # Shared UI components
│   │   │   └── ui/                 # UI components
│   │   ├── lib/
│   │   │   ├── supabase.ts         # PROXe Supabase client
│   │   │   ├── chatSessions.ts    # Session management
│   │   │   ├── chatLocalStorage.ts # Local storage
│   │   │   └── promptBuilder.ts   # Prompt builder
│   │   ├── hooks/
│   │   │   ├── useChat.ts
│   │   │   └── useChatStream.ts
│   │   ├── configs/
│   │   │   ├── brand.config.ts     # PROXe config
│   │   │   ├── index.ts
│   │   │   └── proxe.config.ts
│   │   ├── contexts/
│   │   │   └── DeployModalContext.tsx
│   │   ├── api/
│   │   │   └── prompts/
│   │   │       └── proxe-prompt.ts
│   │   └── styles/
│   │       ├── globals.css
│   │       ├── theme.css           # PROXe theme
│   │       └── themes/
│   ├── public/
│   │   ├── assets/                 # PROXe images, videos
│   │   ├── favicon.ico
│   │   ├── logo.svg
│   │   └── icon.svg
│   ├── package.json                # PROXe dependencies
│   ├── next.config.js              # PROXe Next.js config
│   ├── tsconfig.json               # PROXe TypeScript config
│   ├── .gitignore                  # PROXe gitignore
│   ├── .env.local.example          # PROXe env template
│   └── README.md                    # PROXe documentation
│
├── windchasers/                    # Standalone Windchasers Next.js App
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx          # Root layout
│   │   │   ├── page.tsx            # Homepage
│   │   │   └── api/
│   │   │       ├── chat/
│   │   │       │   └── route.ts    # Chat API
│   │   │       ├── chat/summarize/
│   │   │       │   └── route.ts    # Summarize API
│   │   │       └── calendar/       # Calendar APIs
│   │   ├── components/
│   │   │   ├── ChatWidget.tsx      # Windchasers chat widget
│   │   │   ├── ChatWidget.module.css
│   │   │   ├── shared/             # Shared UI components
│   │   │   └── ui/                 # UI components
│   │   ├── lib/
│   │   │   ├── supabase.ts         # Windchasers Supabase client
│   │   │   ├── chatSessions.ts     # Session management
│   │   │   ├── chatLocalStorage.ts # Local storage
│   │   │   └── promptBuilder.ts    # Prompt builder
│   │   ├── hooks/
│   │   │   ├── useChat.ts
│   │   │   └── useChatStream.ts
│   │   ├── configs/
│   │   │   ├── brand.config.ts     # Windchasers config
│   │   │   ├── index.ts
│   │   │   └── proxe.config.ts
│   │   ├── contexts/
│   │   │   └── DeployModalContext.tsx
│   │   ├── api/
│   │   │   └── prompts/
│   │   │       └── proxe-prompt.ts
│   │   └── styles/
│   │       ├── globals.css
│   │       ├── theme.css           # Windchasers theme
│   │       └── themes/
│   ├── public/
│   │   ├── assets/                 # Windchasers images
│   │   ├── logo.svg
│   │   └── icon.svg
│   ├── package.json                # Windchasers dependencies
│   ├── next.config.js              # Windchasers Next.js config
│   ├── tsconfig.json               # Windchasers TypeScript config
│   ├── .gitignore                  # Windchasers gitignore
│   ├── .env.local.example          # Windchasers env template
│   └── README.md                    # Windchasers documentation
│
└── README.md                        # Root documentation (optional)
```

## Key Features

### Complete Independence
- ✅ Each brand has its own `package.json`
- ✅ Each brand has its own `next.config.js`
- ✅ Each brand has its own `tsconfig.json`
- ✅ Each brand has its own `.env.local`
- ✅ Each brand has its own `.gitignore`
- ✅ Each brand can `npm install` independently
- ✅ Each brand can `npm run build` independently
- ✅ Each brand can deploy independently

### No Shared Code
- ✅ Each brand has its own copy of all components
- ✅ Each brand has its own copy of all hooks
- ✅ Each brand has its own copy of all lib files
- ✅ Each brand has its own copy of all styles
- ✅ No dependencies between brands

## Development

### PROXe Development
```bash
cd proxe
npm install
cp .env.local.example .env.local
# Edit .env.local with PROXe credentials
npm run dev
# Runs on http://localhost:3000
```

### Windchasers Development
```bash
cd windchasers
npm install
cp .env.local.example .env.local
# Edit .env.local with Windchasers credentials
npm run dev
# Runs on http://localhost:3000
```

## Build & Deploy

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

### Vercel Deployment

**PROXe:**
1. Connect repository to Vercel
2. Set Root Directory to `proxe/`
3. Configure PROXe environment variables
4. Deploy

**Windchasers:**
1. Connect repository to Vercel (or separate project)
2. Set Root Directory to `windchasers/`
3. Configure Windchasers environment variables
4. Deploy

## Environment Variables

### proxe/.env.local
```env
NEXT_PUBLIC_SUPABASE_URL=proxe_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=proxe_anon_key
SUPABASE_SERVICE_ROLE_KEY=proxe_service_key
CLAUDE_API_KEY=your_claude_key
GOOGLE_CALENDAR_ID=your_calendar_id
GOOGLE_SERVICE_ACCOUNT_EMAIL=your_service_account
GOOGLE_PRIVATE_KEY=your_private_key
```

### windchasers/.env.local
```env
NEXT_PUBLIC_SUPABASE_URL=windchasers_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=windchasers_anon_key
SUPABASE_SERVICE_ROLE_KEY=windchasers_service_key
CLAUDE_API_KEY=your_claude_key
GOOGLE_CALENDAR_ID=your_calendar_id
GOOGLE_SERVICE_ACCOUNT_EMAIL=your_service_account
GOOGLE_PRIVATE_KEY=your_private_key
```

## Import Paths

All imports use `@/` which maps to `src/` in each brand:

```typescript
// Components
import { ChatWidget } from '@/components/ChatWidget';
import Header from '@/components/shared/Header';

// Lib
import { getSupabaseClient } from '@/lib/supabase';
import { proxeConfig } from '@/configs/brand.config';

// Styles
import '@/styles/theme.css';
import '@/styles/globals.css';

// Hooks
import { useChat } from '@/hooks/useChat';
```

## Public Assets

Assets are served from `/` (root of public folder):

```typescript
// PROXe assets
<img src="/assets/Proxe-Logo.png" />
<source src="/assets/Markx.mp4" />

// Windchasers assets
<img src="/assets/logo.png" />
```

## Benefits

1. **Complete Isolation**: No code sharing between brands
2. **Independent Deployment**: Deploy each brand separately
3. **Independent Development**: Work on brands separately
4. **Easy Scaling**: Add new brands by copying a brand folder
5. **Clear Structure**: Everything for a brand is in one folder
6. **No Conflicts**: Brand-specific code can't interfere

## Migration Complete

✅ All files moved to brand-specific folders
✅ All imports updated to use `@/` paths
✅ All configs created (package.json, next.config.js, tsconfig.json)
✅ All environment templates created
✅ All documentation created
✅ Ready for independent builds and deployments
