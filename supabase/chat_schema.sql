create extension if not exists "pgcrypto";

-- Migration: Rename chat_sessions to sessions if it exists
-- This handles existing databases that may have the old table name
do $$
begin
  if exists (select 1 from information_schema.tables where table_schema = 'public' and table_name = 'chat_sessions') then
    if not exists (select 1 from information_schema.tables where table_schema = 'public' and table_name = 'sessions') then
      alter table public.chat_sessions rename to sessions;
    end if;
  end if;
end $$;

-- Master sessions table
-- Captures: user profile, conversation summary, user inputs, and booking details
create table if not exists public.sessions (
  -- Primary identifiers
  id uuid primary key default gen_random_uuid(),
  external_session_id text not null unique, -- client-generated ID for local storage reference
  
  -- User profile data
  user_name text,
  email text,
  phone text,
  website_url text,
  
  -- Conversation summary (compressed memory - AI-generated)
  conversation_summary text, -- Focused summary of user intent, pain points, and behavior patterns
  last_message_at timestamptz, -- timestamp of last message
  
  -- User inputs summary (key questions, intents, pain points)
  user_inputs_summary jsonb default '[]'::jsonb, -- array of {input: string, intent: string, created_at: string}
  message_count integer default 0, -- total message count
  
  -- Booking details (if booking was made)
  booking_date date, -- YYYY-MM-DD format
  booking_time text, -- "11:00 AM" format
  booking_status text check (booking_status in ('pending', 'confirmed', 'cancelled')) default 'confirmed',
  google_event_id text, -- Google Calendar event ID
  booking_created_at timestamptz, -- when booking was made
  
  -- Metadata
  brand text check (brand in ('proxe', 'windchasers')) default 'proxe',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Add channel and channel_data columns (for existing tables)
alter table public.sessions
  add column if not exists channel text,
  add column if not exists channel_data jsonb default '{}'::jsonb;

-- Add check constraint for channel (if it doesn't exist)
do $$
begin
  if not exists (
    select 1 from pg_constraint 
    where conname = 'sessions_channel_check'
  ) then
    alter table public.sessions
      add constraint sessions_channel_check 
      check (channel in ('web', 'whatsapp', 'voice', 'social'));
  end if;
end $$;

-- Migration: Set channel to 'web' for all existing sessions
-- This is a one-time migration for existing data
update public.sessions
set channel = 'web'
where channel is null;

-- Now make channel not null after migration
alter table public.sessions
  alter column channel set not null;

-- Migration: Rename old indexes if they exist
do $$
begin
  -- Rename old indexes to new names
  if exists (select 1 from pg_indexes where indexname = 'chat_sessions_external_id_idx') then
    if not exists (select 1 from pg_indexes where indexname = 'sessions_external_id_idx') then
      alter index if exists public.chat_sessions_external_id_idx rename to sessions_external_id_idx;
    end if;
  end if;
  if exists (select 1 from pg_indexes where indexname = 'chat_sessions_brand_idx') then
    if not exists (select 1 from pg_indexes where indexname = 'sessions_brand_idx') then
      alter index if exists public.chat_sessions_brand_idx rename to sessions_brand_idx;
    end if;
  end if;
  if exists (select 1 from pg_indexes where indexname = 'chat_sessions_created_at_idx') then
    if not exists (select 1 from pg_indexes where indexname = 'sessions_created_at_idx') then
      alter index if exists public.chat_sessions_created_at_idx rename to sessions_created_at_idx;
    end if;
  end if;
  if exists (select 1 from pg_indexes where indexname = 'chat_sessions_booking_date_idx') then
    if not exists (select 1 from pg_indexes where indexname = 'sessions_booking_date_idx') then
      alter index if exists public.chat_sessions_booking_date_idx rename to sessions_booking_date_idx;
    end if;
  end if;
  if exists (select 1 from pg_indexes where indexname = 'chat_sessions_channel_idx') then
    if not exists (select 1 from pg_indexes where indexname = 'sessions_channel_idx') then
      alter index if exists public.chat_sessions_channel_idx rename to sessions_channel_idx;
    end if;
  end if;
end $$;

-- Indexes for performance
create unique index if not exists sessions_external_id_idx
  on public.sessions (external_session_id);
create index if not exists sessions_brand_idx
  on public.sessions (brand);
create index if not exists sessions_created_at_idx
  on public.sessions (created_at desc);
create index if not exists sessions_booking_date_idx
  on public.sessions (booking_date) where booking_date is not null;
create index if not exists sessions_channel_idx
  on public.sessions (channel);

-- Trigger to keep updated_at fresh
create or replace function public.touch_session()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists touch_session_trg on public.sessions;
create trigger touch_session_trg
  before update on public.sessions
  for each row execute procedure public.touch_session();

-- Channel-specific session tables
-- NOTE: Full structure includes all 4 channels (web, whatsapp, voice, social)
-- Current build (goproxe.com) only uses: 'web' and 'voice'
-- WhatsApp and Social tables are ready for future implementation
-- These tables reference the main sessions table and can store channel-specific metadata

-- Web Sessions
create table if not exists public.web_sessions (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions(id) on delete cascade,
  -- Web-specific fields can be added here as needed
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(session_id)
);

-- WhatsApp Sessions
-- NOTE: Ready for future implementation (not used in current build)
create table if not exists public.whatsapp_sessions (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions(id) on delete cascade,
  -- WhatsApp-specific fields can be added here as needed
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(session_id)
);

-- Voice Sessions
create table if not exists public.voice_sessions (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions(id) on delete cascade,
  -- Voice-specific fields can be added here as needed
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(session_id)
);

-- Social Sessions
-- NOTE: Ready for future implementation (not used in current build)
create table if not exists public.social_sessions (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions(id) on delete cascade,
  -- Social-specific fields can be added here as needed
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(session_id)
);

-- Indexes for channel-specific tables
create index if not exists web_sessions_session_id_idx on public.web_sessions(session_id);
create index if not exists whatsapp_sessions_session_id_idx on public.whatsapp_sessions(session_id);
create index if not exists voice_sessions_session_id_idx on public.voice_sessions(session_id);
create index if not exists social_sessions_session_id_idx on public.social_sessions(session_id);

-- Triggers to keep updated_at fresh for channel-specific tables
create or replace function public.touch_channel_session()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists touch_web_session_trg on public.web_sessions;
create trigger touch_web_session_trg
  before update on public.web_sessions
  for each row execute procedure public.touch_channel_session();

drop trigger if exists touch_whatsapp_session_trg on public.whatsapp_sessions;
create trigger touch_whatsapp_session_trg
  before update on public.whatsapp_sessions
  for each row execute procedure public.touch_channel_session();

drop trigger if exists touch_voice_session_trg on public.voice_sessions;
create trigger touch_voice_session_trg
  before update on public.voice_sessions
  for each row execute procedure public.touch_channel_session();

drop trigger if exists touch_social_session_trg on public.social_sessions;
create trigger touch_social_session_trg
  before update on public.social_sessions
  for each row execute procedure public.touch_channel_session();

-- Unified Leads View
-- Integrates sessions table (master) with channel-specific session tables
-- Uses sessions.channel column for source filtering
create or replace view public.unified_leads as
select 
  -- Primary identifiers from sessions table
  s.id as session_id,
  s.external_session_id,
  
  -- User profile data from sessions
  s.user_name,
  s.email,
  s.phone,
  s.website_url,
  
  -- Conversation data from sessions
  s.conversation_summary,
  s.last_message_at,
  s.user_inputs_summary,
  s.message_count,
  
  -- Booking details from sessions
  s.booking_date,
  s.booking_time,
  s.booking_status,
  s.google_event_id,
  s.booking_created_at,
  
  -- Channel and brand information
  s.channel as source, -- Channel used as source for filtering
  s.channel_data,
  s.brand,
  
  -- Timestamps
  s.created_at,
  s.updated_at,
  
  -- Channel-specific session metadata
  ws.id as web_session_id,
  ws.created_at as web_session_created_at,
  ws.updated_at as web_session_updated_at,
  
  whatsapp.id as whatsapp_session_id,
  whatsapp.created_at as whatsapp_session_created_at,
  whatsapp.updated_at as whatsapp_session_updated_at,
  
  vs.id as voice_session_id,
  vs.created_at as voice_session_created_at,
  vs.updated_at as voice_session_updated_at,
  
  ss.id as social_session_id,
  ss.created_at as social_session_created_at,
  ss.updated_at as social_session_updated_at

from public.sessions s
  -- Left joins to channel-specific tables (allows sessions without channel-specific records)
  left join public.web_sessions ws on s.id = ws.session_id
  left join public.whatsapp_sessions whatsapp on s.id = whatsapp.session_id
  left join public.voice_sessions vs on s.id = vs.session_id
  left join public.social_sessions ss on s.id = ss.session_id;

-- Grant permissions on the view (adjust as needed for your RLS policies)
grant select on public.unified_leads to authenticated;
grant select on public.unified_leads to anon;
