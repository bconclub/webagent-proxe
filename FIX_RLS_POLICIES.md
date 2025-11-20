# Fix RLS Policies for web_sessions

## Problem
The chat widget is getting these errors:
- `401 (Unauthorized)` when trying to access `web_sessions`
- `42501: new row violates row-level security policy for table "web_sessions"`

This means the RLS (Row Level Security) policies are missing or not configured correctly.

## Solution

Run this SQL migration in your Supabase SQL Editor:

```sql
-- Add missing RLS policies for web_sessions and other channel tables
-- This allows anonymous users to insert, select, and update their sessions

-- First, ensure INSERT policies exist (recreate to ensure they're correct)
drop policy if exists "Allow anonymous insert on web_sessions" on public.web_sessions;
drop policy if exists "Allow anonymous insert on whatsapp_sessions" on public.whatsapp_sessions;
drop policy if exists "Allow anonymous insert on voice_sessions" on public.voice_sessions;
drop policy if exists "Allow anonymous insert on social_sessions" on public.social_sessions;

-- Drop existing SELECT and UPDATE policies if they exist (to avoid conflicts)
drop policy if exists "Allow anonymous select on web_sessions" on public.web_sessions;
drop policy if exists "Allow anonymous update on web_sessions" on public.web_sessions;
drop policy if exists "Allow anonymous select on whatsapp_sessions" on public.whatsapp_sessions;
drop policy if exists "Allow anonymous update on whatsapp_sessions" on public.whatsapp_sessions;
drop policy if exists "Allow anonymous select on voice_sessions" on public.voice_sessions;
drop policy if exists "Allow anonymous update on voice_sessions" on public.voice_sessions;
drop policy if exists "Allow anonymous select on social_sessions" on public.social_sessions;
drop policy if exists "Allow anonymous update on social_sessions" on public.social_sessions;

-- Recreate INSERT policies (to ensure they're correct)
create policy "Allow anonymous insert on web_sessions"
  on public.web_sessions
  for insert
  to anon
  with check (true);

create policy "Allow anonymous insert on whatsapp_sessions"
  on public.whatsapp_sessions
  for insert
  to anon
  with check (true);

create policy "Allow anonymous insert on voice_sessions"
  on public.voice_sessions
  for insert
  to anon
  with check (true);

create policy "Allow anonymous insert on social_sessions"
  on public.social_sessions
  for insert
  to anon
  with check (true);

-- Web Sessions Policies
-- Allow anonymous users to select web_sessions
create policy "Allow anonymous select on web_sessions"
  on public.web_sessions
  for select
  to anon
  using (true);

-- Allow anonymous users to update web_sessions
create policy "Allow anonymous update on web_sessions"
  on public.web_sessions
  for update
  to anon
  using (true)
  with check (true);

-- WhatsApp Sessions Policies
create policy "Allow anonymous select on whatsapp_sessions"
  on public.whatsapp_sessions
  for select
  to anon
  using (true);

create policy "Allow anonymous update on whatsapp_sessions"
  on public.whatsapp_sessions
  for update
  to anon
  using (true)
  with check (true);

-- Voice Sessions Policies
create policy "Allow anonymous select on voice_sessions"
  on public.voice_sessions
  for select
  to anon
  using (true);

create policy "Allow anonymous update on voice_sessions"
  on public.voice_sessions
  for update
  to anon
  using (true)
  with check (true);

-- Social Sessions Policies
create policy "Allow anonymous select on social_sessions"
  on public.social_sessions
  for select
  to anon
  using (true);

create policy "Allow anonymous update on social_sessions"
  on public.social_sessions
  for update
  to anon
  using (true)
  with check (true);
```

## How to Run

1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Create a new query
4. Paste the SQL above
5. Click **Run**

## Verify

After running, verify the policies exist:

```sql
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename IN ('web_sessions', 'whatsapp_sessions', 'voice_sessions', 'social_sessions')
ORDER BY tablename, policyname;
```

You should see policies for:
- `Allow anonymous insert on web_sessions` (should already exist)
- `Allow anonymous select on web_sessions` (new)
- `Allow anonymous update on web_sessions` (new)
- Similar policies for other channel tables

## Alternative: Using Supabase CLI

If you have Supabase CLI set up:

```bash
supabase db push
```

This will run all migrations in the `supabase/migrations/` folder.

