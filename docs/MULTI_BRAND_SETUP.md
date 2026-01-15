# Multi-Brand Widget System - Complete Setup

## Overview

The PROXe Website build now supports complete separation between brands with independent widget implementations.

## Architecture

- **Complete Separation**: Each brand has its own widget folder, Supabase client, API routes, and configuration
- **No Shared Widget Code**: Each brand's ChatWidget.tsx is completely independent
- **Brand-Specific Supabase**: Each brand uses its own Supabase project with separate credentials

## File Structure

```
src/
├── widgets/
│   ├── proxe/
│   │   ├── ChatWidget.tsx          # PROXe widget (moved from shared)
│   │   ├── ChatWidget.module.css   # PROXe widget styles
│   │   ├── config.ts                # PROXe configuration
│   │   └── theme.css                # PROXe theme CSS variables
│   └── windchasers/
│       ├── ChatWidget.tsx          # Windchasers widget (NEW)
│       ├── ChatWidget.module.css   # Windchasers widget styles
│       ├── config.ts                # Windchasers configuration
│       └── theme.css                # Windchasers theme CSS variables
├── lib/
│   ├── supabase-proxe.ts           # PROXe Supabase client
│   └── supabase-windchasers.ts     # Windchasers Supabase client
└── app/
    ├── api/
    │   └── chat/
    │       ├── proxe/
    │       │   └── route.ts         # PROXe chat API (moved from /api/chat)
    │       └── windchasers/
    │           └── route.ts         # Windchasers chat API (NEW)
    └── windchasers/
        └── page.tsx                 # Windchasers brand page (NEW)
```

## Brand Configurations

### PROXe
- **Brand**: `proxe`
- **API Route**: `/api/chat/proxe`
- **Supabase**: Uses `PROXE_SUPABASE_URL` and `PROXE_SUPABASE_ANON_KEY`
- **Theme**: Purple (#5B1A8C)
- **Fields**: Name, Email, Phone
- **Page**: Homepage (`/`)

### Windchasers
- **Brand**: `windchasers`
- **API Route**: `/api/chat/windchasers`
- **Supabase**: Uses `WINDCHASERS_SUPABASE_URL` and `WINDCHASERS_SUPABASE_ANON_KEY`
- **Theme**: Aviation Blue (#1E40AF)
- **Fields**: 
  - Name (text)
  - Phone (tel)
  - Email (email)
  - City (text)
  - Course Interest (dropdown: DGCA Ground Classes, Type Rating, Cabin Crew, Drone Training, etc.)
  - Training Type (dropdown: Online, Offline, Hybrid)
  - Student Type (dropdown: Student, Parent, Professional)
  - Class 12 Science (radio: Yes/No)
  - Plan to Fly (dropdown: ASAP, 1-3 months, 6+ months, 1 year+)
- **Page**: `/windchasers`

## Environment Variables

Add to `.env.local`:

```env
# PROXe (existing)
PROXE_SUPABASE_URL=your_proxe_supabase_url
PROXE_SUPABASE_ANON_KEY=your_proxe_anon_key
PROXE_SUPABASE_SERVICE_KEY=your_proxe_service_key

# Windchasers (NEW)
WINDCHASERS_SUPABASE_URL=your_windchasers_supabase_url
WINDCHASERS_SUPABASE_ANON_KEY=your_windchasers_anon_key
WINDCHASERS_SUPABASE_SERVICE_KEY=your_windchasers_service_key
```

## Usage

### PROXe Widget (Homepage)
```tsx
import { ChatWidget } from '@/src/widgets/proxe/ChatWidget';
import '@/src/widgets/proxe/theme.css';

<ChatWidget />
```

### Windchasers Widget
```tsx
import { ChatWidget } from '@/src/widgets/windchasers/ChatWidget';
import '@/src/widgets/windchasers/theme.css';

<ChatWidget />
```

## Key Changes

1. **System Prompt**: Added critical rules section after "HOW TO RESPOND"
2. **PROXe Widget**: Moved from `src/components/shared/ChatWidget.tsx` to `src/widgets/proxe/ChatWidget.tsx`
3. **Homepage**: Updated to use new PROXe widget directly
4. **API Routes**: 
   - Existing `/api/chat` moved to `/api/chat/proxe`
   - New `/api/chat/windchasers` created
5. **Supabase Clients**: Separate clients for each brand with hardcoded brand values
6. **No Brand Parameter**: Widgets no longer accept brand parameter - it's hardcoded in each widget

## Next Steps

1. Add Windchasers environment variables to `.env.local`
2. Implement Windchasers-specific form fields in the widget
3. Create Windchasers system prompt (`src/api/prompts/windchasers-prompt.ts`)
4. Test both widgets independently
5. Delete old `src/components/shared/ChatWidget.tsx` after confirming everything works

## Notes

- Each widget is completely standalone
- No shared widget code between brands
- Each brand uses its own Supabase project
- API routes are brand-specific
- Configuration is brand-specific
