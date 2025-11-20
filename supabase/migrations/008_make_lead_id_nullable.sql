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

