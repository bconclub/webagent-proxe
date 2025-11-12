# Simplified Supabase Schema Plan

## Goal
Consolidate all chat-related data into **one master table**: `chat_sessions`

---

## Current State
- ❌ 3 separate tables: `chat_sessions`, `chat_messages`, `chat_message_summaries`
- ❌ Bookings only stored in Google Calendar (not in Supabase)
- ❌ Complex joins needed to get complete session data

---

## New Simplified Schema

### Single Table: `chat_sessions`

```sql
create table if not exists public.chat_sessions (
  -- Primary identifiers
  id uuid primary key default gen_random_uuid(),
  external_session_id text not null unique, -- client-generated ID
  
  -- User profile data
  user_name text,
  email text,
  phone text,
  website_url text,
  
  -- Chat summary (compressed memory)
  conversation_summary text, -- AI-generated summary
  last_message_at timestamptz, -- timestamp of last message
  
  -- Booking details (if booking was made)
  booking_date date, -- YYYY-MM-DD format
  booking_time text, -- "11:00 AM" format
  booking_status text check (booking_status in ('pending', 'confirmed', 'cancelled')) default 'confirmed',
  google_event_id text, -- Google Calendar event ID
  booking_created_at timestamptz, -- when booking was made
  
  -- User inputs summary (key questions, intents, pain points)
  user_inputs_summary jsonb default '[]'::jsonb, -- array of {input: string, intent: string, created_at: string}
  message_count integer default 0, -- total message count
  
  -- Metadata
  brand text check (brand in ('proxe', 'windchasers')) default 'proxe',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Indexes for performance
create index if not exists chat_sessions_external_id_idx on public.chat_sessions (external_session_id);
create index if not exists chat_sessions_brand_idx on public.chat_sessions (brand);
create index if not exists chat_sessions_created_at_idx on public.chat_sessions (created_at desc);
create index if not exists chat_sessions_booking_date_idx on public.chat_sessions (booking_date) where booking_date is not null;
```

---

## Data Capture Strategy

### 1. **User Profile Data**
- Captured when user provides: `name`, `email`, `phone`, `website_url`
- Updated via `updateSessionProfile()`

### 2. **Chat Summary**
- Generated every 5 interactions
- Stored in `conversation_summary` field
- `last_message_at` tracks when summary was last updated

### 3. **Booking Details**
- Captured when booking is completed via calendar widget
- Fields: `booking_date`, `booking_time`, `google_event_id`
- `booking_status` tracks booking state
- `booking_created_at` records when booking was made

### 4. **User Inputs Summary**
- Store key user inputs (questions, intents, pain points) as JSONB
- Format: `[{input: "What is PROXe?", intent: "exploring_features", created_at: "2024-01-01T10:00:00Z"}, ...]`
- Focus on capturing user intent and specific questions, not full conversation
- `message_count` tracks total message count

---

## Benefits

✅ **Simplified queries** - No joins needed  
✅ **Single source of truth** - All session data in one place  
✅ **Booking tracking** - Bookings stored alongside chat data  
✅ **Fast context restoration** - Recent messages in JSONB  
✅ **Easy analytics** - All data queryable from one table  

---

## Migration Path

1. Create new schema
2. Migrate existing data (if any)
3. Update code to use new schema
4. Drop old tables after verification

---

## Code Changes Required

1. **`supabase/chat_schema.sql`** - New simplified schema
2. **`src/lib/chatSessions.ts`** - Update all functions
3. **`src/components/shared/ChatWidget.tsx`** - Store booking data
4. **Remove** - Old `chat_messages` and `chat_message_summaries` tables

---

## Questions to Consider

1. **Message History**: Keep only recent messages in JSONB, or also maintain full message history?
   - **Recommendation**: Recent messages (10-20) in JSONB for quick access, full history optional

2. **Booking History**: Track multiple bookings per session?
   - **Recommendation**: Single booking per session (most recent), or add `bookings` JSONB array for multiple

3. **Message Count Limit**: How many messages to keep in `recent_messages`?
   - **Recommendation**: 20 messages (10 user + 10 assistant turns)

