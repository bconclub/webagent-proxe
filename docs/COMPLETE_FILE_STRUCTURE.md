# Complete File Structure - Standalone Brand Applications

## PROXe Standalone Next.js App

```
proxe/
├── package.json                    # PROXe dependencies and scripts
├── next.config.js                  # PROXe Next.js configuration
├── tsconfig.json                   # PROXe TypeScript configuration
├── .gitignore                      # PROXe gitignore rules
├── .env.local.example              # PROXe environment variables template
├── README.md                       # PROXe documentation
│
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Root layout with PROXe branding
│   │   ├── page.tsx                # PROXe homepage
│   │   ├── page.module.css         # Homepage styles
│   │   └── api/
│   │       ├── chat/
│   │       │   ├── route.ts        # PROXe chat API endpoint
│   │       │   └── summarize/
│   │       │       └── route.ts    # Conversation summarization API
│   │       └── calendar/
│   │           ├── availability/
│   │           │   └── route.ts   # Calendar availability check
│   │           ├── book/
│   │           │   └── route.ts    # Booking creation
│   │           └── list/
│   │               └── route.ts    # Booking list
│   │
│   ├── components/
│   │   ├── ChatWidget.tsx         # PROXe chat widget (standalone)
│   │   ├── ChatWidget.module.css   # Widget styles
│   │   ├── shared/
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
│   │   ├── supabase.ts             # PROXe Supabase client (hardcoded brand)
│   │   ├── chatSessions.ts        # Session management utilities
│   │   ├── chatLocalStorage.ts    # LocalStorage utilities
│   │   └── promptBuilder.ts       # AI prompt builder
│   │
│   ├── hooks/
│   │   ├── useChat.ts             # Chat hook
│   │   └── useChatStream.ts       # Streaming chat hook
│   │
│   ├── configs/
│   │   ├── brand.config.ts        # PROXe brand configuration
│   │   ├── index.ts               # Config exports
│   │   └── proxe.config.ts        # PROXe config (legacy)
│   │
│   ├── contexts/
│   │   └── DeployModalContext.tsx # Deploy modal context
│   │
│   ├── api/
│   │   └── prompts/
│   │       └── proxe-prompt.ts    # PROXe system prompt
│   │
│   └── styles/
│       ├── globals.css            # Global styles
│       ├── theme.css              # PROXe theme CSS variables
│       └── themes/
│           └── proxe.css          # PROXe theme (legacy)
│
└── public/
    ├── assets/                    # PROXe images and videos
    │   ├── Command Center.webp
    │   ├── Markx.mp4
    │   ├── Models.webp
    │   ├── one memmory one vioce.webp
    │   ├── PROXe Favicon.png
    │   ├── Proxe-Logo.png
    │   ├── Self learning.webp
    │   └── Water.mp4
    ├── favicon.ico                 # PROXe favicon
    ├── logo.svg                   # PROXe logo
    ├── icon.svg                   # PROXe icon
    ├── PROXE.svg
    ├── PROXE-White.svg
    └── PROXE-White-Icon.svg
```

## Windchasers Standalone Next.js App

```
windchasers/
├── package.json                    # Windchasers dependencies and scripts
├── next.config.js                  # Windchasers Next.js configuration
├── tsconfig.json                   # Windchasers TypeScript configuration
├── .gitignore                      # Windchasers gitignore rules
├── .env.local.example              # Windchasers environment variables template
├── README.md                       # Windchasers documentation
│
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Root layout with Windchasers branding
│   │   ├── page.tsx                # Windchasers homepage
│   │   └── api/
│   │       ├── chat/
│   │       │   ├── route.ts        # Windchasers chat API endpoint
│   │       │   └── summarize/
│   │       │       └── route.ts    # Conversation summarization API
│   │       └── calendar/
│   │           ├── availability/
│   │           │   └── route.ts   # Calendar availability check
│   │           ├── book/
│   │           │   └── route.ts    # Booking creation
│   │           └── list/
│   │               └── route.ts   # Booking list
│   │
│   ├── components/
│   │   ├── ChatWidget.tsx         # Windchasers chat widget (aviation fields)
│   │   ├── ChatWidget.module.css  # Widget styles
│   │   ├── shared/                 # Shared UI components (copied, not shared)
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
│   │   ├── supabase.ts             # Windchasers Supabase client (hardcoded brand)
│   │   ├── chatSessions.ts        # Session management utilities
│   │   ├── chatLocalStorage.ts    # LocalStorage utilities
│   │   └── promptBuilder.ts       # AI prompt builder
│   │
│   ├── hooks/
│   │   ├── useChat.ts             # Chat hook
│   │   └── useChatStream.ts       # Streaming chat hook
│   │
│   ├── configs/
│   │   ├── brand.config.ts        # Windchasers brand configuration
│   │   ├── index.ts               # Config exports
│   │   └── proxe.config.ts        # Config types (legacy)
│   │
│   ├── contexts/
│   │   └── DeployModalContext.tsx # Deploy modal context
│   │
│   ├── api/
│   │   └── prompts/
│   │       └── proxe-prompt.ts    # System prompt (to be replaced with windchasers-prompt.ts)
│   │
│   └── styles/
│       ├── globals.css            # Global styles
│       ├── theme.css              # Windchasers theme CSS variables
│       └── themes/
│           └── proxe.css          # Theme (legacy)
│
└── public/
    ├── assets/                    # Windchasers images (to be added)
    ├── logo.svg                   # Windchasers logo (placeholder)
    └── icon.svg                   # Windchasers icon (placeholder)
```

## Key Files Summary

### PROXe App (proxe/)
- **package.json**: `"name": "proxe-website"`, dev port 3000
- **next.config.js**: Standalone output mode
- **tsconfig.json**: Paths `@/*` → `./src/*`
- **.env.local**: PROXe Supabase credentials
- **src/app/page.tsx**: PROXe homepage
- **src/app/api/chat/route.ts**: `/api/chat` endpoint
- **src/lib/supabase.ts**: PROXe Supabase client
- **src/configs/brand.config.ts**: PROXe configuration

### Windchasers App (windchasers/)
- **package.json**: `"name": "windchasers-website"`, dev port 3000
- **next.config.js**: Standalone output mode
- **tsconfig.json**: Paths `@/*` → `./src/*`
- **.env.local**: Windchasers Supabase credentials
- **src/app/page.tsx**: Windchasers homepage
- **src/app/api/chat/route.ts**: `/api/chat` endpoint
- **src/lib/supabase.ts**: Windchasers Supabase client
- **src/configs/brand.config.ts**: Windchasers configuration

## Independent Operations

### Install Dependencies
```bash
# PROXe
cd proxe && npm install

# Windchasers
cd windchasers && npm install
```

### Development
```bash
# PROXe
cd proxe && npm run dev
# Runs on http://localhost:3000

# Windchasers
cd windchasers && npm run dev
# Runs on http://localhost:3000 (different terminal)
```

### Build
```bash
# PROXe
cd proxe && npm run build

# Windchasers
cd windchasers && npm run build
```

### Deploy
Each brand can be deployed independently:
- **PROXe**: Set Vercel Root Directory to `proxe/`
- **Windchasers**: Set Vercel Root Directory to `windchasers/`

## File Count

- **PROXe**: ~80+ files (components, lib, hooks, styles, configs)
- **Windchasers**: ~80+ files (components, lib, hooks, styles, configs)
- **Total**: ~160+ files across both standalone apps

## Next Steps

1. ✅ Structure created
2. ✅ Configs created
3. ✅ Imports updated
4. ⏳ Test builds: `cd proxe && npm install && npm run build`
5. ⏳ Test builds: `cd windchasers && npm install && npm run build`
6. ⏳ Create Windchasers system prompt
7. ⏳ Add Windchasers aviation form fields to ChatWidget
8. ⏳ Add Windchasers assets
