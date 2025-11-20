# Fix lead_id NOT NULL Constraint Error

## Problem

The error `'null value in column "Lead_id" of relation "web_sessions" violates not-null constraint'` occurs because:

1. Sessions are created **before** customer data (name, email, phone) is available
2. The `lead_id` column in `web_sessions` is set to `NOT NULL`
3. We can't create an `all_leads` record without customer data
4. Therefore, we can't provide a `lead_id` when creating the session

## Solution

Make `lead_id` nullable in all channel session tables. The `lead_id` will be set later when the customer profile is updated.

## Migration SQL

Run this SQL in your Supabase SQL Editor:

```sql
-- Make lead_id nullable in web_sessions and other channel tables
-- Sessions are created before customer data is available, so lead_id should be nullable
-- It will be set later when customer profile is updated

-- Web Sessions
alter table public.web_sessions
  alter column lead_id drop not null;

-- WhatsApp Sessions
alter table public.whatsapp_sessions
  alter column lead_id drop not null;

-- Voice Sessions
alter table public.voice_sessions
  alter column lead_id drop not null;

-- Social Sessions
alter table public.social_sessions
  alter column lead_id drop not null;

-- Add comment to explain the nullable lead_id
comment on column public.web_sessions.lead_id is 'Foreign key to all_leads. Nullable because sessions are created before customer data is available. Set when customer profile is updated.';
comment on column public.whatsapp_sessions.lead_id is 'Foreign key to all_leads. Nullable because sessions are created before customer data is available. Set when customer profile is updated.';
comment on column public.voice_sessions.lead_id is 'Foreign key to all_leads. Nullable because sessions are created before customer data is available. Set when customer profile is updated.';
comment on column public.social_sessions.lead_id is 'Foreign key to all_leads. Nullable because sessions are created before customer data is available. Set when customer profile is updated.';
```

## How to Run

1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Create a new query
4. Paste the SQL above
5. Click **Run**

## Verify

After running, verify the column is nullable:

```sql
SELECT 
  table_name,
  column_name,
  is_nullable,
  data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN ('web_sessions', 'whatsapp_sessions', 'voice_sessions', 'social_sessions')
  AND column_name = 'lead_id'
ORDER BY table_name;
```

You should see `is_nullable = 'YES'` for all channel tables.

## How It Works After Fix

1. **Session Creation**: 
   - Session is created with `lead_id = NULL`
   - No customer data required yet

2. **Customer Provides Name**:
   - `updateSessionProfile()` is called
   - Still no `lead_id` (need email/phone too)

3. **Customer Provides Email/Phone**:
   - `updateSessionProfile()` is called again
   - `ensureAllLeads()` creates/updates `all_leads` record
   - `lead_id` is set on the session
   - Session is now linked to the lead

## Alternative: Using Supabase CLI

If you have Supabase CLI set up:

```bash
supabase db push
```

This will run all migrations in the `supabase/migrations/` folder.

