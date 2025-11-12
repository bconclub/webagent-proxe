create extension if not exists "pgcrypto";

-- Simplified single-table schema for chat sessions
-- Captures: user profile, conversation summary, user inputs, and booking details
create table if not exists public.chat_sessions (
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

-- Indexes for performance
create unique index if not exists chat_sessions_external_id_idx
  on public.chat_sessions (external_session_id);
create index if not exists chat_sessions_brand_idx
  on public.chat_sessions (brand);
create index if not exists chat_sessions_created_at_idx
  on public.chat_sessions (created_at desc);
create index if not exists chat_sessions_booking_date_idx
  on public.chat_sessions (booking_date) where booking_date is not null;

-- Trigger to keep updated_at fresh
create or replace function public.touch_chat_session()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists touch_chat_session_trg on public.chat_sessions;
create trigger touch_chat_session_trg
  before update on public.chat_sessions
  for each row execute procedure public.touch_chat_session();
