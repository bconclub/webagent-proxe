# Verification Checklist - After Migration

## ✅ Database Migration Complete

You've successfully run the migration to make `lead_id` nullable. Here's what should now be working:

## What Should Work Now

### 1. Session Creation
- ✅ Sessions can be created without customer data
- ✅ `lead_id` will be `NULL` initially
- ✅ No more `23502` constraint violation errors

### 2. Session Updates
- ✅ When customer provides name → Session updates
- ✅ When customer provides email/phone → `all_leads` record created
- ✅ `lead_id` gets linked to the session automatically

### 3. Chat Functionality
- ✅ Chat widget should initialize properly
- ✅ Messages should send and receive responses
- ✅ No more "service overloaded" errors (unless actual API issues)

## How to Verify

### 1. Test Chat Widget
1. Open your website
2. Click on the chat widget
3. Send a message (e.g., "What's PROXe")
4. You should receive an AI response without errors

### 2. Check Browser Console
Open browser DevTools (F12) and check:
- ✅ No `23502` constraint errors
- ✅ No `401 Unauthorized` errors (if RLS policies are set)
- ✅ No `42501` RLS policy violations
- ✅ Session creation logs should show success

### 3. Check Supabase
Run this query to verify sessions are being created:

```sql
SELECT 
  id,
  external_session_id,
  lead_id,
  customer_name,
  brand,
  session_status,
  created_at
FROM web_sessions
ORDER BY created_at DESC
LIMIT 5;
```

You should see:
- ✅ New sessions with `lead_id = NULL` (this is expected)
- ✅ Sessions being created successfully

## If You Still See Errors

### Error: "401 Unauthorized"
**Solution**: Run the RLS policies migration:
- File: `supabase/migrations/007_add_web_sessions_rls_policies.sql`
- Or see: `FIX_RLS_POLICIES.md`

### Error: "42501 RLS policy violation"
**Solution**: Same as above - ensure RLS policies are set up

### Error: "The service is currently overloaded"
**Possible causes**:
1. Claude API key not set or invalid
2. Rate limiting from Claude API
3. Network issues

**Check**:
- Verify `CLAUDE_API_KEY` is set in environment variables
- Check API key is valid at https://console.anthropic.com/
- Check network tab for actual API errors

### Error: "Uncaught TypeError"
**Possible causes**:
1. JavaScript error in client code
2. Stream processing issue

**Check**:
- Look at full error stack trace in console
- Check if it's related to a specific component
- Verify all dependencies are installed: `npm install`

## Expected Flow

1. **User opens chat** → Session created (lead_id = NULL)
2. **User sends message** → AI responds
3. **User provides name** → Session updated (still lead_id = NULL)
4. **User provides email/phone** → `all_leads` created → `lead_id` set on session
5. **Conversation continues** → All working normally

## Database State

After migration, your `web_sessions` table should have:
- ✅ `lead_id` column is nullable
- ✅ Can insert sessions without `lead_id`
- ✅ `lead_id` can be set later when customer data is available

## Next Steps

1. ✅ Database migration complete
2. ⬜ Test chat widget functionality
3. ⬜ Verify sessions are being created
4. ⬜ Check that `lead_id` gets set when customer data is complete
5. ⬜ Monitor for any remaining errors

## Support

If you encounter any issues:
1. Check browser console for specific error messages
2. Check Supabase logs for database errors
3. Verify all environment variables are set correctly
4. Review the error messages - they should now be more descriptive

---

**Status**: Database migration complete ✅
**Next**: Test the chat widget to verify everything works

