# Complete Standalone Brand Applications - Final Structure

## ✅ Restructure Complete

Each brand (PROXe and Windchasers) is now a **completely standalone Next.js application** that can be built, deployed, and run independently.

## 📁 Complete File Structure

### PROXe Standalone App (`proxe/`)

```
proxe/
├── package.json                    # PROXe dependencies (name: "proxe-website")
├── next.config.js                  # PROXe Next.js config (standalone output)
├── tsconfig.json                   # PROXe TypeScript config (@/* → ./src/*)
├── .gitignore                      # PROXe gitignore
├── .env.local.example              # PROXe environment template
├── README.md                       # PROXe documentation
│
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Root layout (PROXe branding)
│   │   ├── page.tsx                # PROXe homepage
│   │   ├── page.module.css         # Homepage styles
│   │   └── api/
│   │       ├── chat/
│   │       │   ├── route.ts        # /api/chat endpoint
│   │       │   └── summarize/
│   │       │       └── route.ts    # /api/chat/summarize
│   │       └── calendar/
│   │           ├── availability/
│   │           │   └── route.ts
│   │           ├── book/
│   │           │   └── route.ts
│   │           └── list/
│   │               └── route.ts
│   │
│   ├── components/
│   │   ├── ChatWidget.tsx          # PROXe chat widget (standalone)
│   │   ├── ChatWidget.module.css
│   │   ├── shared/                 # Shared UI (copied, not shared)
│   │   │   ├── AnalyticsScripts.tsx
│   │   │   ├── BlobBackground.tsx
│   │   │   ├── BlobBackground.module.css
│   │   │   ├── BlurText.tsx
│   │   │   ├── BookingCalendarWidget.tsx
│   │   │   ├── BookingCalendarWidget.module.css
│   │   │   ├── ChatWidget.tsx (legacy)
│   │   │   ├── ChatWidget.module.css
│   │   │   ├── DarkVeil.tsx
│   │   │   ├── DarkVeil.css
│   │   │   ├── DeployFormInline.tsx
│   │   │   ├── DeployModal.tsx
│   │   │   ├── DeployModal.module.css
│   │   │   ├── FadeInElement.tsx
│   │   │   ├── FadeInSection.tsx
│   │   │   ├── Header.tsx
│   │   │   ├── Header.module.css
│   │   │   ├── InfinityLoader.tsx
│   │   │   ├── InfinityLoader.module.css
│   │   │   ├── LoadingBar.tsx
│   │   │   ├── LoadingBar.module.css
│   │   │   └── icons/
│   │   │       ├── HugeIcons.tsx
│   │   │       ├── ai-voice-stroke-rounded.svg
│   │   │       ├── browser-stroke-rounded.svg
│   │   │       ├── video-ai-stroke-rounded.svg
│   │   │       └── whatsapp-business-stroke-rounded.svg
│   │   └── ui/
│   │       ├── FeaturedSectionStats.tsx
│   │       └── FeaturedSectionStats.module.css
│   │
│   ├── lib/
│   │   ├── supabase.ts             # PROXe Supabase client (hardcoded brand='proxe')
│   │   ├── chatSessions.ts         # Session management
│   │   ├── chatLocalStorage.ts     # LocalStorage utilities
│   │   └── promptBuilder.ts        # AI prompt builder
│   │
│   ├── hooks/
│   │   ├── useChat.ts              # Chat hook
│   │   └── useChatStream.ts        # Streaming chat hook
│   │
│   ├── configs/
│   │   ├── brand.config.ts         # PROXe brand configuration
│   │   ├── index.ts                # Config exports
│   │   └── proxe.config.ts        # PROXe config (legacy)
│   │
│   ├── contexts/
│   │   └── DeployModalContext.tsx  # Deploy modal context
│   │
│   ├── api/
│   │   └── prompts/
│   │       └── proxe-prompt.ts     # PROXe system prompt
│   │
│   └── styles/
│       ├── globals.css             # Global styles
│       ├── theme.css               # PROXe theme CSS variables
│       └── themes/
│           └── proxe.css            # PROXe theme (legacy)
│
└── public/
    ├── assets/                     # PROXe images and videos
    │   ├── Command Center.webp
    │   ├── Markx.mp4
    │   ├── Models.webp
    │   ├── one memmory one vioce.webp
    │   ├── PROXe Favicon.png
    │   ├── Proxe-Logo.png
    │   ├── Self learning.webp
    │   └── Water.mp4
    ├── favicon.ico
    ├── logo.svg
    ├── icon.svg
    ├── PROXE.svg
    ├── PROXE-White.svg
    └── PROXE-White-Icon.svg
```

### Windchasers Standalone App (`windchasers/`)

```
windchasers/
├── package.json                    # Windchasers dependencies (name: "windchasers-website")
├── next.config.js                  # Windchasers Next.js config (standalone output)
├── tsconfig.json                   # Windchasers TypeScript config (@/* → ./src/*)
├── .gitignore                      # Windchasers gitignore
├── .env.local.example              # Windchasers environment template
├── README.md                       # Windchasers documentation
│
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Root layout (Windchasers branding)
│   │   ├── page.tsx                # Windchasers homepage
│   │   └── api/
│   │       ├── chat/
│   │       │   ├── route.ts        # /api/chat endpoint
│   │       │   └── summarize/
│   │       │       └── route.ts   # /api/chat/summarize
│   │       └── calendar/
│   │           ├── availability/
│   │           │   └── route.ts
│   │           ├── book/
│   │           │   └── route.ts
│   │           └── list/
│   │               └── route.ts
│   │
│   ├── components/
│   │   ├── ChatWidget.tsx          # Windchasers chat widget (aviation fields)
│   │   ├── ChatWidget.module.css
│   │   ├── shared/                 # Shared UI (copied, not shared)
│   │   │   ├── AnalyticsScripts.tsx
│   │   │   ├── BlobBackground.tsx
│   │   │   ├── BlobBackground.module.css
│   │   │   ├── BlurText.tsx
│   │   │   ├── BookingCalendarWidget.tsx
│   │   │   ├── BookingCalendarWidget.module.css
│   │   │   ├── ChatWidget.tsx (legacy)
│   │   │   ├── ChatWidget.module.css
│   │   │   ├── DarkVeil.tsx
│   │   │   ├── DarkVeil.css
│   │   │   ├── DeployFormInline.tsx
│   │   │   ├── DeployModal.tsx
│   │   │   ├── DeployModal.module.css
│   │   │   ├── FadeInElement.tsx
│   │   │   ├── FadeInSection.tsx
│   │   │   ├── Header.tsx
│   │   │   ├── Header.module.css
│   │   │   ├── InfinityLoader.tsx
│   │   │   ├── InfinityLoader.module.css
│   │   │   ├── LoadingBar.tsx
│   │   │   ├── LoadingBar.module.css
│   │   │   └── icons/
│   │   │       ├── HugeIcons.tsx
│   │   │       ├── ai-voice-stroke-rounded.svg
│   │   │       ├── browser-stroke-rounded.svg
│   │   │       ├── video-ai-stroke-rounded.svg
│   │   │       └── whatsapp-business-stroke-rounded.svg
│   │   └── ui/
│   │       ├── FeaturedSectionStats.tsx
│   │       └── FeaturedSectionStats.module.css
│   │
│   ├── lib/
│   │   ├── supabase.ts             # Windchasers Supabase client (hardcoded brand='windchasers')
│   │   ├── chatSessions.ts         # Session management
│   │   ├── chatLocalStorage.ts     # LocalStorage utilities
│   │   └── promptBuilder.ts        # AI prompt builder
│   │
│   ├── hooks/
│   │   ├── useChat.ts              # Chat hook
│   │   └── useChatStream.ts        # Streaming chat hook
│   │
│   ├── configs/
│   │   ├── brand.config.ts         # Windchasers brand configuration
│   │   ├── index.ts                # Config exports
│   │   └── proxe.config.ts         # Config types (legacy)
│   │
│   ├── contexts/
│   │   └── DeployModalContext.tsx  # Deploy modal context
│   │
│   ├── api/
│   │   └── prompts/
│   │       └── proxe-prompt.ts     # System prompt (to be replaced)
│   │
│   └── styles/
│       ├── globals.css             # Global styles
│       ├── theme.css               # Windchasers theme CSS variables
│       └── themes/
│           └── proxe.css           # Theme (legacy)
│
└── public/
    ├── assets/                     # Windchasers images (to be added)
    ├── logo.svg                    # Windchasers logo (placeholder)
    └── icon.svg                    # Windchasers icon (placeholder)
```

## 📊 File Count

- **PROXe**: 71 files
- **Windchasers**: 58 files
- **Total**: 129+ files across both standalone apps

## 🚀 Independent Operations

### Development

```bash
# PROXe
cd proxe
npm install
cp .env.local.example .env.local
# Edit .env.local with PROXe credentials
npm run dev
# Runs on http://localhost:3000

# Windchasers (in separate terminal)
cd windchasers
npm install
cp .env.local.example .env.local
# Edit .env.local with Windchasers credentials
npm run dev
# Runs on http://localhost:3000
```

### Build

```bash
# PROXe
cd proxe
npm install
npm run build
npm run start

# Windchasers
cd windchasers
npm install
npm run build
npm run start
```

### Deploy

Each brand deploys independently:

**PROXe:**
- Vercel Root Directory: `proxe/`
- Environment variables: PROXe Supabase credentials

**Windchasers:**
- Vercel Root Directory: `windchasers/`
- Environment variables: Windchasers Supabase credentials

## ✅ Key Features

1. **Complete Independence**: Each brand has its own package.json, next.config.js, tsconfig.json
2. **No Shared Code**: All components, hooks, lib files are copied to each brand
3. **Independent Builds**: Each can `npm install` and `npm run build` independently
4. **Independent Deployment**: Each can deploy to its own domain
5. **Brand-Specific Configs**: Each has its own brand.config.ts
6. **Brand-Specific Supabase**: Each has its own supabase.ts client

## 📝 Environment Variables

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

## 🎯 Import Paths

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

## 📦 Public Assets

Assets are served from `/` (root of public folder):

```typescript
// PROXe assets
<img src="/assets/Proxe-Logo.png" />
<source src="/assets/Markx.mp4" />

// Windchasers assets
<img src="/assets/logo.png" />
```

## ✨ Benefits

1. **Complete Isolation**: No code sharing between brands
2. **Independent Deployment**: Deploy each brand separately
3. **Independent Development**: Work on brands separately
4. **Easy Scaling**: Add new brands by copying a brand folder
5. **Clear Structure**: Everything for a brand is in one folder
6. **No Conflicts**: Brand-specific code can't interfere

## 🎉 Migration Complete

✅ Standalone Next.js app structure created for both brands
✅ All configs created (package.json, next.config.js, tsconfig.json)
✅ All imports updated to use `@/` paths
✅ All shared components copied to each brand (no sharing)
✅ Public assets organized
✅ Environment templates created
✅ Documentation created
✅ Ready for independent builds and deployments
