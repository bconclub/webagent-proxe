# Chat Sessions Table - Complete Field List

## Database Table: `chat_sessions`

### 📋 All Fields (19 total)

---

## 1. **Primary Identifiers** (2 fields)

| Database Column | TypeScript Property | Type | Description |
|----------------|-------------------|------|-------------|
| `id` | `id` | `uuid` | Primary key, auto-generated UUID |
| `external_session_id` | `externalSessionId` | `text` (unique) | Client-generated session ID for local storage reference |

---

## 2. **User Profile Data** (4 fields)

| Database Column | TypeScript Property | Type | Description |
|----------------|-------------------|------|-------------|
| `user_name` | `userName` | `text` (nullable) | User's name |
| `email` | `email` | `text` (nullable) | User's email address |
| `phone` | `phone` | `text` (nullable) | User's phone number |
| `website_url` | `websiteUrl` | `text` (nullable) | User's website URL |

---

## 3. **Conversation Summary** (2 fields)

| Database Column | TypeScript Property | Type | Description |
|----------------|-------------------|------|-------------|
| `conversation_summary` | `conversationSummary` | `text` (nullable) | AI-generated summary focused on user intent, pain points, and behavior patterns |
| `last_message_at` | `lastMessageAt` | `timestamptz` (nullable) | Timestamp of last message |

---

## 4. **User Inputs Summary** (2 fields)

| Database Column | TypeScript Property | Type | Description |
|----------------|-------------------|------|-------------|
| `user_inputs_summary` | `userInputsSummary` | `jsonb` (default: `[]`) | Array of user inputs: `[{input: string, intent?: string, created_at: string}]` |
| `message_count` | `messageCount` | `integer` (default: `0`) | Total message count |

**UserInput JSONB Structure:**
```typescript
{
  input: string;        // User's question/input
  intent?: string;     // Optional intent classification
  created_at: string;  // ISO timestamp
}
```

---

## 5. **Booking Details** (5 fields)

| Database Column | TypeScript Property | Type | Description |
|----------------|-------------------|------|-------------|
| `booking_date` | `bookingDate` | `date` (nullable) | Booking date in YYYY-MM-DD format |
| `booking_time` | `bookingTime` | `text` (nullable) | Booking time in "11:00 AM" format |
| `booking_status` | `bookingStatus` | `text` (nullable) | Status: `'pending'` \| `'confirmed'` \| `'cancelled'` (default: `'confirmed'`) |
| `google_event_id` | `googleEventId` | `text` (nullable) | Google Calendar event ID |
| `booking_created_at` | `bookingCreatedAt` | `timestamptz` (nullable) | When booking was made |

---

## 6. **Channel Information** (2 fields)

| Database Column | TypeScript Property | Type | Description |
|----------------|-------------------|------|-------------|
| `channel` | `channel` | `text` (required) | Communication channel: `'web'` \| `'whatsapp'` \| `'voice'` \| `'social'` - Must be explicitly set based on session source |
| `channel_data` | `channelData` | `jsonb` (default: `{}`) | Flexible storage for channel-specific data and metadata |

---

## 7. **Metadata** (3 fields)

| Database Column | TypeScript Property | Type | Description |
|----------------|-------------------|------|-------------|
| `brand` | `brand` | `text` | Brand identifier: `'proxe'` \| `'windchasers'` (default: `'proxe'`) |
| `created_at` | `createdAt` | `timestamptz` | Session creation timestamp (auto-set) |
| `updated_at` | `updatedAt` | `timestamptz` | Last update timestamp (auto-updated via trigger) |

---

## 📊 Summary by Category

- **Primary Identifiers**: 2 fields
- **User Profile**: 4 fields
- **Conversation Summary**: 2 fields
- **User Inputs**: 2 fields
- **Booking Details**: 5 fields
- **Channel Information**: 2 fields
- **Metadata**: 3 fields

**Total: 19 fields**

---

## 🔍 Indexes

1. `chat_sessions_external_id_idx` - Unique index on `external_session_id`
2. `chat_sessions_brand_idx` - Index on `brand`
3. `chat_sessions_created_at_idx` - Index on `created_at` (descending)
4. `chat_sessions_booking_date_idx` - Partial index on `booking_date` (where not null)
5. `chat_sessions_channel_idx` - Index on `channel`

---

## 🔄 Auto-Updated Fields

- `updated_at` - Automatically updated via trigger `touch_chat_session_trg` on any row update
- `created_at` - Automatically set on row creation (default: `now()`)
- `id` - Automatically generated UUID (default: `gen_random_uuid()`)

---

## 📝 Example Session Record

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "external_session_id": "abc123-def456-ghi789",
  "user_name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "website_url": "https://example.com",
  "conversation_summary": "User is exploring PROXe features, interested in WhatsApp automation, has a small business.",
  "last_message_at": "2024-01-15T10:30:00Z",
  "user_inputs_summary": [
    {
      "input": "What is PROXe?",
      "intent": "exploring_features",
      "created_at": "2024-01-15T10:00:00Z"
    },
    {
      "input": "How does WhatsApp integration work?",
      "intent": "feature_inquiry",
      "created_at": "2024-01-15T10:15:00Z"
    }
  ],
  "message_count": 8,
  "booking_date": "2024-01-20",
  "booking_time": "11:00 AM",
  "booking_status": "confirmed",
  "google_event_id": "event123456",
  "booking_created_at": "2024-01-15T10:30:00Z",
  "brand": "proxe",
  "channel": "web",
  "channel_data": {},
  "created_at": "2024-01-15T09:00:00Z",
  "updated_at": "2024-01-15T10:30:00Z"
}
```

---

## 📡 Channel-Specific Session Tables

The system includes separate tables for each communication channel that reference the main `chat_sessions` table:

### 1. **Web Sessions** (`web_sessions`)
- `id` - Primary key (uuid)
- `session_id` - Foreign key to `chat_sessions(id)` (unique, cascade on delete)
- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp (auto-updated via trigger)

### 2. **WhatsApp Sessions** (`whatsapp_sessions`)
- `id` - Primary key (uuid)
- `session_id` - Foreign key to `chat_sessions(id)` (unique, cascade on delete)
- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp (auto-updated via trigger)

### 3. **Voice Sessions** (`voice_sessions`)
- `id` - Primary key (uuid)
- `session_id` - Foreign key to `chat_sessions(id)` (unique, cascade on delete)
- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp (auto-updated via trigger)

### 4. **Social Sessions** (`social_sessions`)
- `id` - Primary key (uuid)
- `session_id` - Foreign key to `chat_sessions(id)` (unique, cascade on delete)
- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp (auto-updated via trigger)

**Note:** Channel-specific tables are automatically created when a new session is created via `ensureSession()`. These tables can be extended with channel-specific fields as needed.

