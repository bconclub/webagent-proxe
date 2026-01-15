# PROXe Environment Variables Setup

## Required Environment Variables

Create `proxe/.env.local` with the following variables:

```env
# Supabase Configuration (use standard Next.js naming for standalone app)
NEXT_PUBLIC_SUPABASE_URL=your_proxe_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_proxe_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_proxe_service_key

# Or use PROXe-specific names (also supported):
# NEXT_PUBLIC_PROXE_SUPABASE_URL=your_proxe_supabase_url
# NEXT_PUBLIC_PROXE_SUPABASE_ANON_KEY=your_proxe_anon_key
# PROXE_SUPABASE_SERVICE_KEY=your_proxe_service_key

# Claude API
CLAUDE_API_KEY=your_claude_api_key

# Google Calendar (optional)
GOOGLE_CALENDAR_ID=your_calendar_id
GOOGLE_SERVICE_ACCOUNT_EMAIL=your_service_account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY=your_private_key
```

## Quick Setup

```bash
cd proxe
cp .env.local.example .env.local
# Edit .env.local with your actual values
```

## Note

The Supabase client now supports both naming conventions:
- Standard: `NEXT_PUBLIC_SUPABASE_URL` (preferred for standalone apps)
- PROXe-specific: `NEXT_PUBLIC_PROXE_SUPABASE_URL` (for backward compatibility)
