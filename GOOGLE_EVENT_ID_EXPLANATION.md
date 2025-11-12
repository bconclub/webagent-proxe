# Google Event ID - What Is Captured

## What is Google Event ID?

The **Google Event ID** (`google_event_id`) is a **unique identifier** assigned by Google Calendar API to each calendar event when it's created.

---

## Format & Characteristics

- **Type**: String (text)
- **Format**: Alphanumeric string (e.g., `"abc123def456"` or `"event_1234567890"`)
- **Uniqueness**: Unique per calendar
- **Purpose**: Used to identify, retrieve, update, or delete specific events via Google Calendar API

---

## How It's Captured in Your System

### Flow:

1. **User Books Appointment** → BookingCalendarWidget submits booking form
2. **API Call** → `/api/calendar/book` creates event in Google Calendar
3. **Google Calendar API Response** → Returns `createdEvent.data.id`
4. **Stored in Database** → Saved as `google_event_id` in `chat_sessions` table

### Code Flow:

```typescript
// 1. API creates event in Google Calendar
const createdEvent = await calendar.events.insert({
  calendarId: CALENDAR_ID,
  requestBody: event,
});

// 2. Google returns event with ID
return NextResponse.json({
  success: true,
  eventId: createdEvent.data.id,  // ← This is the Google Event ID
  eventLink: createdEvent.data.htmlLink,
  ...
});

// 3. Frontend receives and stores it
googleEventId: data.eventId

// 4. Stored in Supabase
await storeBooking(externalSessionId, {
  date: bookingData.date,
  time: bookingData.time,
  googleEventId: bookingData.googleEventId,  // ← Stored here
  status: 'confirmed',
});
```

---

## Example Google Event ID

```
"abc123def456ghi789jkl012mno345pqr678stu901vwx234yz"
```

Or shorter format:
```
"event_1234567890"
```

---

## What You Can Do With It

### 1. **Retrieve Event Details**
```javascript
const event = await calendar.events.get({
  calendarId: CALENDAR_ID,
  eventId: google_event_id
});
```

### 2. **Update Event**
```javascript
await calendar.events.update({
  calendarId: CALENDAR_ID,
  eventId: google_event_id,
  requestBody: { /* updated event data */ }
});
```

### 3. **Delete Event**
```javascript
await calendar.events.delete({
  calendarId: CALENDAR_ID,
  eventId: google_event_id
});
```

### 4. **Get Event Link**
```javascript
const event = await calendar.events.get({
  calendarId: CALENDAR_ID,
  eventId: google_event_id
});
const eventLink = event.data.htmlLink; // Direct link to event in Google Calendar
```

---

## Where It's Stored

**Database Table**: `chat_sessions`  
**Field**: `google_event_id` (text, nullable)  
**TypeScript Property**: `googleEventId: string | null`

---

## When It's Captured

✅ **Captured**: When booking is successfully created in Google Calendar  
❌ **Not Captured**: If booking creation fails or user cancels

---

## Use Cases

1. **Event Management**: Update or cancel bookings programmatically
2. **Sync Status**: Check if event still exists in Google Calendar
3. **User Support**: Direct link to event for customer support
4. **Analytics**: Track booking completion rates
5. **Integration**: Link chat sessions to calendar events

---

## Example Database Record

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "external_session_id": "abc123-def456",
  "booking_date": "2024-01-20",
  "booking_time": "11:00 AM",
  "google_event_id": "abc123def456ghi789jkl012mno345pqr678stu901vwx234yz",
  "booking_status": "confirmed",
  "booking_created_at": "2024-01-15T10:30:00Z"
}
```

---

## Notes

- The event ID is **permanent** - it doesn't change even if you update the event
- Each calendar event has a **unique ID** within that calendar
- The ID is **required** for any API operations on that specific event
- If you delete and recreate an event, it will have a **different ID**

