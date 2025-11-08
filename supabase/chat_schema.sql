create extension if not exists "pgcrypto";

-- Chat session metadata
create table if not exists public.chat_sessions (
  id uuid primary key default gen_random_uuid(),
  external_session_id text not null, -- client generated id for local storage reference
  user_name text,
  phone text,
  email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists chat_sessions_external_id_idx
  on public.chat_sessions (external_session_id);

-- Individual chat messages tied to a session
create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.chat_sessions (id) on delete cascade,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  created_at timestamptz not null default now()
);

create index if not exists chat_messages_session_id_idx
  on public.chat_messages (session_id, created_at);

-- Rolling summaries / memory compression
create table if not exists public.chat_message_summaries (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.chat_sessions (id) on delete cascade,
  summary text not null,
  last_message_created_at timestamptz not null,
  created_at timestamptz not null default now()
);

create unique index if not exists chat_message_summaries_session_id_idx
  on public.chat_message_summaries (session_id);

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

