# Supabase Simplification Summary

## ✅ Completed Changes

### 1. **New Simplified Schema** (`supabase/chat_schema.sql`)
- ✅ Single master table: `chat_sessions`
- ✅ Consolidates all data: user profile, conversation summary, user inputs, and booking details
- ✅ Removed separate tables: `chat_messages` and `chat_message_summaries`

### 2. **Updated Library Functions** (`src/lib/chatSessions.ts`)
- ✅ `ensureSession()` - Creates/fetches session with brand support
- ✅ `updateSessionProfile()` - Updates user profile data
- ✅ `addUserInput()` - Stores key user inputs (questions, intents) instead of full messages
- ✅ `upsertSummary()` - Updates conversation summary in session table
- ✅ `fetchSummary()` - Retrieves conversation summary from session table
- ✅ `storeBooking()` - **NEW** - Stores booking details (date, time, Google event ID)

### 3. **Updated Chat Widget** (`src/components/shared/ChatWidget.tsx`)
- ✅ Changed `recordMessage()` → `recordUserInput()` - Only stores user inputs, not assistant messages
- ✅ Removed `fetchRecentMessages()` - Now uses `userInputsSummary` from session record
- ✅ Updated `handleBookingComplete()` - Now stores booking data in Supabase
- ✅ Updated summary storage to use `externalSessionId` instead of `sessionRecord.id`

### 4. **Updated Booking Widget** (`src/components/shared/BookingCalendarWidget.tsx`)
- ✅ Added `googleEventId` to `BookingData` interface
- ✅ Passes Google Calendar event ID when booking completes

---

## 📊 Data Captured in Single Table

### **User Profile**
- `user_name`, `email`, `phone`, `website_url`

### **Conversation Summary**
- `conversation_summary` - AI-generated summary focused on user intent and behavior
- `last_message_at` - Timestamp of last message

### **User Inputs** (JSONB array)
- Stores key user questions/intents, not full conversation
- Format: `[{input: "What is PROXe?", intent?: "exploring_features", created_at: "..."}]`
- Keeps last 20 user inputs

### **Booking Details**
- `booking_date` - YYYY-MM-DD format
- `booking_time` - "11:00 AM" format
- `booking_status` - 'pending' | 'confirmed' | 'cancelled'
- `google_event_id` - Google Calendar event ID
- `booking_created_at` - When booking was made

### **Metadata**
- `brand` - 'proxe' | 'windchasers'
- `message_count` - Total message count
- `created_at`, `updated_at` - Timestamps

---

## 🔄 Migration Notes

### **Old Schema** (3 tables)
- `chat_sessions` - User profile only
- `chat_messages` - All messages (user + assistant)
- `chat_message_summaries` - Conversation summaries

### **New Schema** (1 table)
- `chat_sessions` - Everything in one place

### **What Changed**
1. ❌ No longer storing full assistant messages
2. ✅ Focus on user inputs and conversation summaries
3. ✅ Booking details now stored in Supabase (was only in Google Calendar)
4. ✅ Simplified queries - no joins needed

---

## 🚀 Next Steps

1. **Apply Schema**: Run `supabase/chat_schema.sql` in your Supabase project
2. **Migrate Existing Data** (if any):
   - Copy user profiles from old `chat_sessions`
   - Extract user inputs from `chat_messages` (filter role='user')
   - Copy summaries from `chat_message_summaries`
   - Drop old tables after verification
3. **Test**: Verify all data capture works correctly
4. **Monitor**: Check that bookings are being stored correctly

---

## 📝 Key Benefits

✅ **Simplified Architecture** - One table instead of three  
✅ **Faster Queries** - No joins needed  
✅ **Booking Tracking** - Bookings stored alongside chat data  
✅ **Focused Data** - User inputs and summaries, not full conversation  
✅ **Easy Analytics** - All session data queryable from one table  

