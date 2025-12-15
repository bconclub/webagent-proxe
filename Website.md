# PROJECT PROXe - Complete System Documentation

**Single Source of Truth for the PROXe Build**

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [What This Build Is](#what-this-build-is)
3. [System Architecture](#system-architecture)
4. [Database Architecture](#database-architecture)
5. [API Architecture](#api-architecture)
6. [Component Architecture](#component-architecture)
7. [Data Flow & Connections](#data-flow--connections)
8. [Dashboard Connection](#dashboard-connection)
9. [Web Agent Integration](#web-agent-integration)
10. [Environment Configuration](#environment-configuration)
11. [Build & Deployment](#build--deployment)
12. [Key Features](#key-features)

---

## Project Overview

**PROJECT PROXe** is a Next.js 14 application that serves as both:
1. **The PROXe Marketing Website** - Public-facing website showcasing PROXe solutions
2. **The Web Agent** - AI-powered chat widget embedded on the website for lead capture and qualification

This is a **single unified build** that combines marketing content with interactive AI chat functionality, all connected to a Supabase database that feeds into the PROXe Command Center Dashboard.

### Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Frontend**: React 18
- **Styling**: CSS Modules, CSS Variables
- **AI**: Anthropic Claude API (configurable model)
- **Database**: Supabase (PostgreSQL)
- **Calendar**: Google Calendar API
- **Animations**: Motion, Lottie React
- **3D Graphics**: OGL (for background effects)

---

## What This Build Is

### 1. PROXe Marketing Website (`/`)

**Purpose**: Public-facing marketing website for PROXe

**Features**:
- Hero section with animated text
- Solutions showcase (Website PROXe, WhatsApp PROXe, Voice PROXe, Social PROXe)
- Feature highlights (Self-Learning Core, Latest Model, One Memory One Voice, Command Center)
- Statistics display
- Embedded chat widget (Web Agent)

**File**: `app/page.tsx`

**Components Used**:
- `Header` - Navigation header
- `DarkVeil` - Animated background effect
- `BlurText` - Animated hero text
- `FadeInSection` / `FadeInElement` - Scroll animations
- `FeaturedSectionStats` - Statistics display
- `BrandChatWidget` - Embedded chat widget

### 2. Web Agent (Chat Widget)

**Purpose**: AI-powered chat widget that captures leads, qualifies prospects, and books demos

**Features**:
- Real-time AI chat with streaming responses
- User profile collection (name, email, phone)
- Google Calendar booking integration
- Session persistence
- Conversation summarization
- Knowledge base integration
- Local storage caching

**Component**: `src/components/shared/ChatWidget.tsx`

**Embedded In**: 
- Main homepage (`app/page.tsx`)
- Can be embedded on any page via `<BrandChatWidget brand="proxe" />`

---

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│              PROXe Website + Web Agent Build                │
│                    (This Repository)                        │
├─────────────────────────────────────────────────────────────┤
│  Frontend Layer (Next.js 14 App Router)                     │
│  ├── Marketing Pages (app/page.tsx)                        │
│  ├── Chat Widget (src/components/shared/ChatWidget.tsx)   │
│  └── API Routes (app/api/*)                                │
├─────────────────────────────────────────────────────────────┤
│  Backend Services                                           │
│  ├── Supabase (Database + Realtime)                        │
│  │   ├── web_sessions (session data)                      │
│  │   ├── all_leads (unified customer records)             │
│  │   └── messages (message log)                            │
│  ├── Anthropic Claude API (AI Chat)                        │
│  └── Google Calendar API (Bookings)                       │
├─────────────────────────────────────────────────────────────┤
│  Dashboard Connection                                       │
│  └── Command Center Dashboard (Separate Repository)        │
│      └── Reads from unified_leads view                      │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow Architecture

```
User visits PROXe Website
    ↓
Chat Widget Initializes
    ↓
Creates Session in web_sessions (Supabase)
    ↓
User chats with AI (Claude API)
    ↓
Conversation stored in web_sessions
    ↓
User provides profile (name, email, phone)
    ↓
Creates/Updates all_leads (unified customer record)
    ↓
Links web_sessions to all_leads via lead_id
    ↓
User books demo → Google Calendar event created
    ↓
Booking stored in web_sessions
    ↓
Dashboard reads from unified_leads view
    ↓
Real-time updates via Supabase Realtime
```

---

## Database Architecture

### Multi-Touchpoint Schema

The database uses a **multi-touchpoint architecture** designed to track customers across all channels (Web, WhatsApp, Voice, Social) while maintaining channel-specific data.

### Core Tables

#### 1. `all_leads` - Unified Customer Table

**Purpose**: One record per unique customer across all channels

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `customer_name` | TEXT | Customer's name |
| `email` | TEXT | Customer's email |
| `phone` | TEXT | Customer's phone (original format) |
| `customer_phone_normalized` | TEXT | Normalized phone (digits only) - for deduplication |
| `first_touchpoint` | ENUM | Channel where customer first interacted: `'web'`, `'whatsapp'`, `'voice'`, `'social'` |
| `last_touchpoint` | ENUM | Most recent channel |
| `last_interaction_at` | TIMESTAMP | Timestamp of most recent interaction |
| `brand` | ENUM | `'proxe'` |
| `unified_context` | JSONB | Aggregated context from all channels |
| `created_at` | TIMESTAMP | When record was created |
| `updated_at` | TIMESTAMP | When record was last updated |

**Deduplication Key**: `(customer_phone_normalized, brand)`

**Usage**: 
- Created when user provides profile data in chat widget
- Updated when user interacts from different channels
- Read by Dashboard via `unified_leads` view

#### 2. `web_sessions` - Web Agent Session Data

**Purpose**: Self-contained Web PROXe session data (this build's primary table)

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `lead_id` | UUID | Foreign key to `all_leads.id` (nullable - set when profile collected) |
| `brand` | ENUM | `'proxe'` |
| `customer_name` | TEXT | Customer's name |
| `customer_email` | TEXT | Customer's email |
| `customer_phone` | TEXT | Customer's phone |
| `customer_phone_normalized` | TEXT | Normalized phone for deduplication |
| `external_session_id` | TEXT | External session identifier (unique) - UUID stored in localStorage |
| `chat_session_id` | TEXT | Original chat session ID |
| `website_url` | TEXT | Website URL where session originated |
| `booking_status` | ENUM | `'pending'`, `'confirmed'`, `'cancelled'` |
| `booking_date` | DATE | Scheduled booking date |
| `booking_time` | TIME | Scheduled booking time |
| `google_event_id` | TEXT | Google Calendar event ID |
| `booking_created_at` | TIMESTAMP | When booking was created |
| `conversation_summary` | TEXT | AI-generated summary |
| `user_inputs_summary` | JSONB | Summary of user inputs/interactions |
| `message_count` | INTEGER | Number of messages in session |
| `last_message_at` | TIMESTAMP | Timestamp of last message |
| `session_status` | TEXT | `'active'`, `'completed'`, `'abandoned'` |
| `channel_data` | JSONB | Additional channel-specific metadata |
| `created_at` | TIMESTAMP | When record was created |
| `updated_at` | TIMESTAMP | When record was last updated |

**Key Points**:
- Created when chat widget initializes (before user provides profile)
- `lead_id` is nullable initially - set when customer data is available
- Contains all conversation and booking data
- Links to `all_leads` for unified customer view

#### 3. `messages` - Universal Message Log

**Purpose**: Append-only message log for audit trail and Dashboard Inbox

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `lead_id` | UUID | Foreign key to `all_leads.id` |
| `channel` | ENUM | `'web'`, `'whatsapp'`, `'voice'`, `'social'` |
| `sender` | ENUM | `'customer'`, `'agent'`, or `'system'` |
| `content` | TEXT | Message content (plain text, HTML stripped) |
| `message_type` | TEXT | `'text'`, `'image'`, `'audio'`, etc. |
| `metadata` | JSONB | Additional message metadata (includes `topic`, `extension`, timing data) |
| `created_at` | TIMESTAMP | When message was created |

**Usage**: 
- Audit trail of all conversations across channels
- **Dashboard Inbox**: Displays conversation history for each lead
- **Content Cleaning**: HTML tags and entities are stripped before storage (plain text only)
- **Metadata**: Stores `topic: 'chat'`, `extension: 'web'`, and timing information (`input_received_at`, `output_sent_at`, `input_to_output_gap_ms`)

#### 4. `unified_leads` - Dashboard View

**Purpose**: Dashboard display view - aggregates all customer data

**Type**: Database View (not a table)

**Columns**:
- `id`, `name`, `email`, `phone`
- `first_touchpoint`, `last_touchpoint`
- `brand`, `timestamp`, `last_interaction_at`
- `metadata` (JSONB with channel data)

**Data Source**: `all_leads` + joins with channel-specific tables

**Usage**: 
- Read by Dashboard for displaying leads
- Real-time updates via Supabase Realtime
- Ordered by `last_interaction_at DESC`

### Row Level Security (RLS)

**Anonymous Users** (`anon` role):
- Can INSERT, SELECT, UPDATE on `web_sessions`
- Can SELECT on `unified_leads` view
- Cannot access `all_leads` directly (created via API)

**Authenticated Users** (`authenticated` role):
- Full access to all tables for dashboard

---

## API Architecture

### Chat APIs

#### `POST /api/chat`

**Purpose**: Main chat endpoint for AI conversations

**Request Body**:
```json
{
  "message": "User's message",
  "sessionId": "external_session_id",
  "brand": "proxe",
  "messageCount": 5,
  "usedButtons": ["Book a Demo"],
  "metadata": {
    "session": {
      "externalId": "uuid",
      "user": {
        "name": "John Doe",
        "email": "john@example.com",
        "phone": "+1234567890"
      }
    },
    "memory": {
      "summary": "Previous conversation summary",
      "recentHistory": [
        {"role": "user", "content": "..."},
        {"role": "assistant", "content": "..."}
      ]
    }
  }
}
```

**Response**: Streaming response (Server-Sent Events)

**Process**:
1. Validates session exists (creates if needed)
2. Searches knowledge base in Supabase
3. Builds prompt with conversation history
4. Calls Claude API with streaming
5. Saves user input to `web_sessions`
6. Streams response chunks to client
7. **Fetches/ensures `lead_id`** (after AI response, when profile updates complete)
8. **Logs messages to `messages` table** (for Dashboard Inbox)
9. Generates follow-up buttons
10. Saves conversation summary (async)

**Features**:
- Streaming AI responses (real-time)
- Knowledge base integration
- Conversation memory compression
- **Dynamic follow-up button generation** (based on booking status)
- Booking detection and validation
- **Conversation summary cleaning** (removes metadata pollution)
- **Message logging to Dashboard Inbox** (stores customer and agent messages in `messages` table)
- **HTML content stripping** (messages stored as plain text, no HTML tags)
- **Lead ID management** (ensures `lead_id` exists before logging messages)

#### `POST /api/chat/summarize`

**Purpose**: Summarize conversation for memory compression

**Request Body**:
```json
{
  "sessionId": "external_session_id",
  "conversationHistory": [...],
  "previousSummary": "Previous summary text",
  "brand": "proxe"
}
```

**Response**:
```json
{
  "summary": "Compressed conversation summary"
}
```

**Features**:
- **Metadata cleaning**: Removes patterns like `[User's name is...]` and `[Booking Status:...]`
- Cleans `previousSummary` before generating new summary
- Filters metadata from conversation history
- Returns only AI-generated summary text without metadata pollution

**Usage**: Called periodically to compress long conversations

### Follow-up Button Logic

**Dynamic Button Generation** (`POST /api/chat`):

The system generates context-aware follow-up buttons based on user's booking status:

**Process**:
1. Before generating buttons, checks if user has existing booking via `checkExistingBooking(phone, email, brand)`
2. If booking exists:
   - Filters out booking-related buttons (keywords: "book", "schedule", "call", "demo", "meeting", "appointment")
   - Shows: "Reschedule Call" and "View Booking Details"
   - First message: Shows 3 buttons (non-booking + booking actions)
   - Subsequent messages: Shows 1 random button from available options
3. If no booking:
   - Shows normal follow-up buttons: "Schedule a Call", "Book a Demo", etc.
   - First message: Shows 3 configured first message buttons
   - Subsequent messages: Shows 1 random button (avoids duplicates)
4. Special case: After "Explore PROXe" button interactions, always shows "Book a Demo"

**Button Filtering**:
- Tracks used buttons to avoid repetition
- Filters similar buttons (e.g., "Book a Call" vs "Schedule a Call")
- Falls back to appropriate button if all options exhausted

### Calendar APIs

#### `GET /api/calendar/availability`

**Purpose**: Check available time slots

**Query Parameters**:
- `date`: Date string (YYYY-MM-DD)
- `brand`: `"proxe"`

**Response**:
```json
{
  "availableSlots": ["09:00", "10:00", "11:00", "14:00", "15:00"]
}
```

**Process**:
1. Authenticates with Google Calendar API
2. Fetches existing events for the date
3. Returns available slots (default: 9 AM - 5 PM IST, excluding booked times)

#### `POST /api/calendar/book`

**Purpose**: Create a booking

**Request Body**:
```json
{
  "sessionId": "external_session_id",
  "date": "2024-01-15",
  "time": "11:00 AM",
  "name": "Customer Name",
  "email": "customer@example.com",
  "phone": "1234567890",
  "brand": "proxe"
}
```

**Response**:
```json
{
  "success": true,
  "eventId": "google_calendar_event_id",
  "eventLink": "https://calendar.google.com/...",
  "message": "Booking confirmed for Monday, January 15, 2024 at 11:00 AM"
}
```

**Process**:
1. Extracts `sessionId` and `brand` from request body (or looks up by email/phone if not provided)
2. Checks for existing booking (by phone/email)
3. Creates Google Calendar event via Google Calendar API
4. **Stores booking in `web_sessions` table** via `storeBooking()` function
5. Updates `all_leads.unified_context` if linked
6. Returns confirmation with event details

**Post-Booking Actions** (in ChatWidget):
- Displays system message: "Your call is scheduled for [Monday, Jan 15] at [2:00 PM]"
- Updates AI conversation context with booking information
- Booking info naturally included in conversation summary (no manual metadata appending)

#### `GET /api/calendar/list`

**Purpose**: List bookings

**Query Parameters**:
- `startDate`: Start date filter
- `endDate`: End date filter
- `brand`: `"proxe"`

**Response**:
```json
{
  "bookings": [
    {
      "date": "2024-01-15",
      "time": "11:00 AM",
      "name": "Customer Name",
      "email": "customer@example.com",
      "phone": "+1234567890",
      "eventId": "google_event_id"
    }
  ]
}
```

### Session APIs

#### `GET /api/sessions`

**Purpose**: List sessions across all channels

**Query Parameters**:
- `channel`: `"web"` | `"voice"` | `"whatsapp"` | `"social"`
- `brand`: `"proxe"`
- `externalSessionId`: Filter by session ID
- `startDate`, `endDate`: Date range filter
- `limit`, `offset`: Pagination

**Response**:
```json
{
  "sessions": [...],
  "pagination": {
    "limit": 50,
    "offset": 0,
    "total": 100,
    "hasMore": true
  }
}
```

**Usage**: Used by Dashboard to fetch session data

#### `GET /api/sessions/web`

**Purpose**: List web sessions specifically

**Query Parameters**: Same as `/api/sessions`

**Data Source**: `web_sessions` table

#### `GET /api/sessions/voice`

**Purpose**: List voice sessions specifically

**Query Parameters**: Same as `/api/sessions`

**Data Source**: `voice_sessions` table

---

## Component Architecture

### Core Components

#### `ChatWidget` (`src/components/shared/ChatWidget.tsx`)

**Type**: Client Component (`'use client'`)

**Purpose**: Main chat widget with AI integration

**Props**:
```typescript
{
  brand: string;           // 'proxe'
  config: BrandConfig;     // Brand configuration
  apiUrl?: string;         // Optional API URL override
}
```

**Features**:
- Real-time streaming responses (Server-Sent Events)
- Session management (creates/updates `web_sessions`)
- User profile collection (name, email, phone)
- **Simple phone input** (`tel` input type, no country code dropdown)
- Booking integration (Google Calendar)
- **Post-booking system messages** ("Your call is scheduled for...")
- **Booking context updates** (AI knows about bookings)
- Local storage persistence
- Brand-specific theming
- Conversation summarization (with metadata cleaning)
- Knowledge base search
- **Dynamic follow-up button generation** (context-aware based on booking status)
- **"Explore PROXe" buttons** with brand-specific colors matching "Meet Our PROXes" section

**Key Functions**:
- `initializeSession()` - Creates session in Supabase
- `sendMessage()` - Sends message to `/api/chat`
- `handleBooking()` - Opens booking calendar widget
- `updateProfile()` - Updates user profile in session

**State Management**:
- Messages array
- Session ID (stored in localStorage)
- User profile (stored in localStorage)
- Loading states
- Booking state

#### `BrandChatWidget` (`src/components/brand/BrandChatWidget.tsx`)

**Type**: Client Component

**Purpose**: Brand-specific wrapper for ChatWidget

**Features**:
- Brand detection
- Theme application via `ThemeProvider`
- Configuration loading from `src/configs/`

**Usage**: `<BrandChatWidget brand="proxe" apiUrl={apiUrl} />`

#### `BookingCalendarWidget` (`src/components/shared/BookingCalendarWidget.tsx`)

**Type**: Client Component

**Purpose**: Calendar booking interface

**Props**:
```typescript
{
  sessionId?: string;  // External session ID for linking booking
  brand?: string;      // Brand identifier ('proxe')
  onBookingComplete?: (bookingData) => void;  // Callback after successful booking
}
```

**Features**:
- Available slot display
- Date selection
- Time slot booking
- **Auto-scroll to time slots** when date is selected
- Google Calendar integration
- Booking confirmation
- **Simple phone input** (`tel` input type, no country code dropdown)
- **Phone number cleaning** (removes `+1` prefix from pre-filled values)

**Process**:
1. Fetches available slots from `/api/calendar/availability`
2. User selects date/time
3. Calls `/api/calendar/book` with `sessionId` and `brand`
4. API stores booking in `web_sessions` via `storeBooking()`
5. Shows confirmation
6. Triggers `onBookingComplete` callback (displays system message in chat)

#### `Header` (`src/components/shared/Header.tsx`)

**Type**: Client Component

**Purpose**: Navigation header for website

**Features**:
- PROXe logo
- Navigation links
- Responsive design

### Hooks

#### `useChat` (`src/hooks/useChat.ts`)

**Purpose**: Chat logic and state management

**Returns**:
```typescript
{
  messages: Message[];
  isLoading: boolean;
  sendMessage: (message: string) => Promise<void>;
  clearChat: () => void;
}
```

#### `useChatStream` (`src/hooks/useChatStream.ts`)

**Purpose**: Streaming chat responses

**Features**:
- Server-Sent Events (SSE) handling
- Real-time message updates
- Error handling
- Retry logic

### Libraries

#### `chatSessions.ts` (`src/lib/chatSessions.ts`)

**Purpose**: Session management with Supabase

**Key Functions**:
- `ensureSession()` - Create or get session in `web_sessions`
- `updateSessionProfile()` - Update user profile, creates/updates `all_leads`
- `addUserInput()` - Add user input to session
- `upsertSummary()` - Update conversation summary (with metadata cleaning)
- `storeBooking()` - Store booking information in `web_sessions` and update `all_leads.unified_context`
- `fetchSummary()` - Get conversation summary (with metadata cleaning)
- `checkExistingBooking()` - Check if user already has booking (by phone/email)
- `normalizePhone()` - Normalize phone numbers (last 10 digits for matching)
- `cleanSummary()` - Remove metadata patterns from summaries
- `logMessage()` - Log messages to `messages` table (for Dashboard Inbox, with HTML stripping)
- `ensureAllLeads()` - Ensure `all_leads` record exists and return `lead_id`

**Features**:
- Multi-channel support (currently web-focused)
- Fallback to legacy `sessions` table if needed
- `all_leads` integration
- Column name mapping (old → new structure)
- **Phone normalization**: Uses last 10 digits for deduplication (handles international formats)
- **Summary cleaning**: Removes metadata strings like `[User's name is...]` and `[Booking Status:...]`

#### `supabaseClient.ts` (`src/lib/supabaseClient.ts`)

**Purpose**: Supabase client factory

**Features**:
- PROXe brand support
- Client caching
- Environment variable handling
- Debug logging

**Usage**: `getSupabaseClient('proxe')`

#### `promptBuilder.ts` (`src/lib/promptBuilder.ts`)

**Purpose**: AI prompt construction

**Features**:
- Brand-specific prompts
- Conversation history formatting
- Knowledge base integration
- Summary compression

#### `chatLocalStorage.ts` (`src/lib/chatLocalStorage.ts`)

**Purpose**: Local storage helpers

**Keys**:
- `proxe.chat.sessionId` - Session UUID
- `proxe.chat.user` - User profile JSON

**Functions**:
- `getStoredSessionId()` - Get session ID
- `storeSessionId()` - Store session ID
- `getStoredUser()` - Get user profile
- `storeUserProfile()` - Store user profile

---

## Data Flow & Connections

### Complete User Journey

```
1. User visits PROXe Website (app/page.tsx)
   ↓
2. Chat Widget Initializes (BrandChatWidget → ChatWidget)
   ↓
3. ensureSession() called
   - Generates UUID for external_session_id
   - Stores in localStorage: proxe.chat.sessionId
   - Creates record in web_sessions table
   - lead_id is NULL initially
   ↓
4. User sends first message
   ↓
5. POST /api/chat
   - Validates session exists
   - Searches knowledge base (Supabase)
   - Calls Claude API with streaming
   - Saves user input via addUserInput()
   - Streams response to client
   - **Fetches/ensures lead_id** (after response generation)
   - **Logs messages to messages table** (customer + agent messages, HTML stripped)
   ↓
6. User continues conversation
   - Each message updates message_count
   - Updates last_message_at
   - Stores in user_inputs_summary (JSONB)
   ↓
7. User provides profile (name, email, phone)
   ↓
8. updateSessionProfile() called
   - Updates web_sessions (customer_name, customer_email, customer_phone)
   - Normalizes phone number
   - Checks all_leads (by phone + brand)
   - [New] → Creates all_leads record
   - [Existing] → Updates all_leads record
   - Links web_sessions to all_leads via lead_id
   ↓
9. User requests booking
   ↓
10. BookingCalendarWidget opens
    - Fetches available slots from /api/calendar/availability
    - User selects date/time
    ↓
11. POST /api/calendar/book
    - Checks for existing booking
    - Creates Google Calendar event
    - **Stores booking in web_sessions** via `storeBooking()`
    - **Updates all_leads.unified_context** if linked
    ↓
12. BookingCalendarWidget receives success
    - Triggers `onBookingComplete` callback
    - **Displays system message**: "Your call is scheduled for [Monday, Jan 15] at [2:00 PM]"
    - **Updates AI context** with booking information
    ↓
13. Conversation continues
    - Periodically: POST /api/chat/summarize
    - **Cleans metadata** from previous summary and history
    - Compresses conversation
    - Updates conversation_summary in web_sessions (clean, no metadata)
    ↓
14. Follow-up buttons generated
    - **Checks for existing booking** before showing booking buttons
    - If booking exists: Shows "Reschedule Call" / "View Booking Details"
    - If no booking: Shows "Schedule a Call" / "Book a Demo"
    - After "Explore PROXe" interactions: Always shows "Book a Demo"
    ↓
15. **Message logging** (after AI response generated)
    - Fetches `lead_id` from `web_sessions` (or creates via `ensureAllLeads` if needed)
    - **Logs customer message** to `messages` table (HTML stripped, plain text)
    - **Logs agent response** to `messages` table (HTML stripped, plain text)
    - Stores timing metadata (`input_received_at`, `output_sent_at`, `input_to_output_gap_ms`)
    - Stores channel metadata (`topic: 'chat'`, `extension: 'web'`)
    ↓
16. Dashboard reads from unified_leads view
    - Real-time updates via Supabase Realtime
    - Displays lead in dashboard
    - **Dashboard Inbox displays messages** from `messages` table (plain text, no HTML)
```

### Session Creation Flow

```
Chat Widget Mounts
    ↓
getStoredSessionId() from localStorage
    ↓
[No Session] → Generate UUID
    ↓
ensureSession(externalSessionId, 'web', 'proxe')
    ↓
Check web_sessions table (by external_session_id)
    ↓
[Not Found] → Create new record:
    - external_session_id: UUID
    - brand: 'proxe'
    - session_status: 'active'
    - lead_id: NULL (will be set later)
    ↓
[Found] → Return existing session
    ↓
Store session ID in localStorage
```

### Profile Update Flow

```
User provides name/email/phone
    ↓
updateSessionProfile(externalSessionId, profile, 'proxe')
    ↓
Update web_sessions:
    - customer_name
    - customer_email
    - customer_phone (original format, e.g., "9876543210")
    - customer_phone_normalized (normalized for matching)
    ↓
Normalize phone number (normalizePhone function):
    - Removes all non-digit characters
    - Returns last 10 digits for matching
    - Examples: "919876543210" → "9876543210", "+1234567890" → "234567890"
    ↓
ensureAllLeads(name, email, phone, 'proxe')
    ↓
Check all_leads (by customer_phone_normalized + brand)
    ↓
[New Lead] → Create all_leads:
    - customer_name, email, phone
    - customer_phone_normalized
    - first_touchpoint: 'web'
    - last_touchpoint: 'web'
    - brand: 'proxe'
    ↓
[Existing Lead] → Update all_leads:
    - last_touchpoint: 'web'
    - last_interaction_at: now()
    - Update name/email if provided
    ↓
Link web_sessions to all_leads:
    - Update web_sessions.lead_id = all_leads.id
```

### Booking Flow

```
User clicks "Book a Demo" button
    ↓
BookingCalendarWidget opens
    ↓
GET /api/calendar/availability?date=YYYY-MM-DD&brand=proxe
    ↓
Google Calendar API:
    - Authenticates with service account
    - Fetches events for date
    - Returns available slots
    ↓
User selects date and time
    ↓
POST /api/calendar/book
    {
      sessionId, date, time, name, email, phone, brand
    }
    ↓
checkExistingBooking(phone, email, 'proxe')
    ↓
[Has Booking] → Return error
[No Booking] → Continue
    ↓
Create Google Calendar event:
    - Summary: "PROXe Demo"
    - Start/End: Date + Time (IST timezone)
    - Attendees: Customer email
    ↓
Store booking in web_sessions via storeBooking():
    - booking_date (YYYY-MM-DD format)
    - booking_time (original format, e.g., "11:00 AM")
    - booking_status: 'confirmed'
    - google_event_id (from Google Calendar response)
    - booking_created_at (timestamp)
    - Also updates customer_name, customer_email, customer_phone if provided
    ↓
Update all_leads.unified_context:
    - Includes booking information in unified context
    - Links web_sessions to all_leads via lead_id
    ↓
Return success with event details
    ↓
ChatWidget receives booking completion:
    - Displays system message: "Your call is scheduled for [formatted date] at [time]"
    - Updates AI conversation context
    - Booking info naturally included in summary (no manual metadata)
```

---

## Dashboard Connection

### How Dashboard Connects to This Build

The **PROXe Command Center Dashboard** (separate repository) connects to this build's database via:

1. **Database Connection**: 
   - Uses same Supabase project
   - Reads from `unified_leads` view
   - Reads from `web_sessions` table

2. **Real-time Updates**:
   - Subscribes to `all_leads` table changes via Supabase Realtime
   - Automatically refreshes when new leads are created
   - Updates when sessions are modified

3. **API Endpoints**:
   - Dashboard can call `/api/sessions` endpoints
   - Dashboard can call `/api/sessions/web` for web-specific data

### Data Flow: Website → Dashboard

```
Web Agent (This Build)
    ↓
Creates/Updates web_sessions
    ↓
Creates/Updates all_leads
    ↓
unified_leads view updates
    ↓
Supabase Realtime broadcasts change
    ↓
Dashboard receives update
    ↓
Dashboard UI refreshes automatically
```

### Dashboard Reads

**Primary View**: `unified_leads`
- Aggregates all customer data
- Includes channel-specific metadata
- Ordered by `last_interaction_at DESC`

**Session Details**: `web_sessions`
- Full conversation data
- Booking information
- User inputs summary
- Conversation summary

**API Endpoints Used by Dashboard**:
- `GET /api/sessions?channel=web&brand=proxe`
- `GET /api/sessions/web?brand=proxe`

---

## Web Agent Integration

### What is the Web Agent?

The **Web Agent** is the AI chat widget embedded on the PROXe website. It:
- Captures leads through conversation
- Qualifies prospects
- Books demos automatically
- Stores all data in Supabase

### Integration Points

#### 1. Embedded in Website

**Location**: `app/page.tsx`

```tsx
<BrandChatWidget brand="proxe" apiUrl={apiUrl} />
```

**Behavior**:
- Renders as floating chat widget
- Persists across page navigation
- Maintains session in localStorage

#### 2. Session Management

**Storage**:
- **Browser**: localStorage (`proxe.chat.sessionId`)
- **Database**: `web_sessions` table

**Session Lifecycle**:
- Created when widget first opens
- Persists across page refreshes
- Links to `all_leads` when profile collected
- Updates with each message

#### 3. Lead Capture

**Process**:
1. User chats with AI
2. AI asks for name/email/phone (when appropriate)
3. User provides information
4. Profile stored in `web_sessions`
5. `all_leads` record created/updated
6. Dashboard receives real-time update

#### 4. Booking Integration

**Process**:
1. User expresses interest in demo
2. AI suggests booking
3. BookingCalendarWidget opens
4. User selects date/time
5. Google Calendar event created
6. Booking stored in `web_sessions`
7. Dashboard shows booking

### Knowledge Base Integration

**Tables Searched** (in Supabase):
- `system_prompts` - System instructions
- `agents` - Agent definitions
- `conversation_states` - Conversation state management
- `cta_triggers` - Call-to-action triggers
- `model_context` - Model context data
- `chatbot_responses` - Pre-defined responses

**Search Process**:
1. User sends message
2. `/api/chat` searches knowledge base
3. Relevant snippets included in prompt
4. AI uses knowledge base to answer

---

## Environment Configuration

### Required Environment Variables

#### Claude API
```env
CLAUDE_API_KEY=sk-ant-api03-...
CLAUDE_MODEL=claude-haiku-4-5-20251001  # Optional, defaults to haiku
```

#### Supabase (PROXe)
```env
NEXT_PUBLIC_PROXE_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_PROXE_SUPABASE_ANON_KEY=eyJ...

# Optional: Server-side keys (if different from client)
PROXE_SUPABASE_URL=https://xxx.supabase.co
PROXE_SUPABASE_ANON_KEY=eyJ...
```

#### Google Calendar
```env
GOOGLE_CALENDAR_ID=xxx@group.calendar.google.com
GOOGLE_SERVICE_ACCOUNT_EMAIL=xxx@project.iam.gserviceaccount.com
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GOOGLE_CALENDAR_TIMEZONE=Asia/Kolkata  # Optional, defaults to IST
```

#### Optional
```env
NEXT_PUBLIC_API_URL=https://your-api-url.com  # Optional API URL override
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXX  # Google Analytics
NEXT_PUBLIC_GTM_ID=GTM-XXXXX  # Google Tag Manager
NEXT_PUBLIC_META_PIXEL_ID=XXXXX  # Meta Pixel
NEXT_PUBLIC_CLARITY_PROJECT_ID=XXXXX  # Microsoft Clarity
```

### Environment Variable Usage

**Client-Side** (`NEXT_PUBLIC_*`):
- Exposed to browser
- Used by React components
- Accessible in `process.env.NEXT_PUBLIC_*`

**Server-Side** (no prefix):
- Only available in API routes
- Not exposed to browser
- Used for sensitive operations

---

## Build & Deployment

### Build Process

**Development**:
```bash
npm run dev
# Runs on http://localhost:3002
```

**Production Build**:
```bash
npm run build
npm run start
```

**Build Scripts**:
- `npm run dev` - Development server (port 3002)
- `npm run build` - Production build
- `npm run build:proxe` - PROXe brand build
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Next.js Configuration

**File**: `next.config.js`

```javascript
{
  output: 'standalone',  // For Docker/VPS deployment
  reactStrictMode: true
}
```

### Deployment

#### Vercel (Recommended)

1. **Connect Repository**
   - Push to GitHub
   - Import to Vercel
   - Auto-detects Next.js

2. **Configure Environment Variables**
   - Add all required variables in Vercel Dashboard
   - Set for Production, Preview, Development

3. **Deploy**
   - Automatic on push to main
   - Manual deployment available

#### VPS/Docker

1. **Build**:
   ```bash
   npm run build
   ```

2. **Start**:
   ```bash
   npm run start
   ```

3. **Process Manager** (PM2):
   ```bash
   pm2 start npm --name "proxe-website" -- start
   ```

### Database Setup

**Before First Deployment**:

1. **Create Supabase Project**
   - Create new project at supabase.com
   - Note URL and anon key

2. **Run Schema**:
   - Apply database schema (see BUILD_STRUCTURE.md)
   - Create tables: `all_leads`, `web_sessions`, `messages`
   - Create view: `unified_leads`

3. **Set Up RLS**:
   - Enable Row Level Security
   - Create policies for anonymous users
   - Create policies for authenticated users

4. **Configure Environment Variables**:
   - Add Supabase URL and keys to deployment platform

---

## Key Features

### 1. Real-Time AI Chat
- Streaming responses from Claude API
- Conversation memory compression
- Knowledge base integration
- Context-aware responses
- **"Explore PROXe" buttons** with brand-specific gradient colors matching "Meet Our PROXes" section
  - Website PROXe: Web-specific gradient
  - WhatsApp PROXe: WhatsApp-specific gradient
  - Voice PROXe: Voice-specific gradient
  - Social PROXe: Social-specific gradient

### 2. Lead Capture
- Automatic profile collection
- **Phone number normalization** (last 10 digits for matching)
- **Simple phone input** (`tel` input type, no country code dropdown)
- **Phone number cleaning** (removes `+1` prefix from stored data)
- Deduplication via `all_leads` (using normalized phone)
- Multi-touchpoint tracking

### 3. Booking Integration
- Google Calendar integration
- Availability checking
- Automatic event creation
- **Booking persistence** (saved to `web_sessions` after calendar event creation)
- **Post-booking system messages** (displays confirmation in chat)
- **Booking context updates** (AI knows about bookings)
- **Duplicate booking prevention** (checks existing bookings before showing calendar)
- **Dynamic follow-up buttons** (shows "Reschedule Call" / "View Booking Details" if booking exists)
- Booking confirmation

### 4. Session Management
- Persistent sessions (localStorage + Supabase)
- **Conversation summarization with metadata cleaning**
- User input tracking
- Message count tracking
- **Clean summaries** (removes metadata pollution like `[User's name is...]`)

### 5. Dashboard Integration
- Real-time updates via Supabase Realtime
- Unified lead view
- Channel-specific data
- Booking tracking
- **Message logging for Dashboard Inbox** (all chat messages stored in `messages` table)
- **Plain text message storage** (HTML stripped for clean display in dashboard)

### 6. Security
- Row Level Security (RLS)
- Anonymous user support
- Service role for webhooks
- Environment variable protection

---

## Project Structure

```
PROXe Website + Web Agent/
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes
│   │   ├── calendar/             # Calendar APIs
│   │   │   ├── availability/route.ts  # GET - Check availability
│   │   │   ├── book/route.ts          # POST - Create booking
│   │   │   └── list/route.ts          # GET - List bookings
│   │   ├── chat/                 # Chat APIs
│   │   │   ├── route.ts               # POST - Main chat endpoint (Claude + Supabase)
│   │   │   └── summarize/route.ts     # POST - Summarize conversation
│   │   └── sessions/             # Session APIs
│   │       ├── route.ts               # GET - List sessions (multi-channel)
│   │       ├── web/route.ts           # GET - Web sessions
│   │       └── voice/route.ts         # GET - Voice sessions
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Homepage (Marketing + Chat Widget)
│   └── page.module.css           # Homepage styles
│
├── src/                          # Source code
│   ├── api/                      # API-related code
│   │   └── prompts/             # AI prompts
│   │       └── proxe-prompt.ts  # PROXe system prompt
│   │
│   ├── components/              # React components
│   │   ├── brand/               # Brand-specific components
│   │   │   ├── BrandChatWidget.tsx
│   │   │   └── ThemeProvider.tsx
│   │   ├── shared/              # Shared components
│   │   │   ├── ChatWidget.tsx  # Main chat widget
│   │   │   ├── BookingCalendarWidget.tsx
│   │   │   ├── Header.tsx
│   │   │   ├── BlobBackground.tsx
│   │   │   ├── DarkVeil.tsx
│   │   │   ├── DeployModal.tsx
│   │   │   └── icons/          # SVG icons
│   │   └── ui/                  # UI components
│   │       └── FeaturedSectionStats.tsx
│   │
│   ├── configs/                 # Brand configurations
│   │   ├── index.ts
│   │   └── proxe.config.ts
│   │
│   ├── contexts/                # React contexts
│   │   └── DeployModalContext.tsx
│   │
│   ├── hooks/                   # Custom React hooks
│   │   ├── useChat.ts          # Chat logic hook
│   │   └── useChatStream.ts    # Streaming chat hook
│   │
│   ├── lib/                     # Utility libraries
│   │   ├── chatSessions.ts     # Session management
│   │   ├── chatLocalStorage.ts # Local storage helpers
│   │   ├── promptBuilder.ts    # AI prompt construction
│   │   └── supabaseClient.ts   # Supabase client factory
│   │
│   └── styles/                  # Global styles
│       ├── globals.css
│       └── themes/              # Brand-specific themes
│           └── proxe.css
│
├── public/                       # Static assets
│   └── assets/
│       ├── icons/               # Brand icons & SVGs
│       └── proxe/              # PROXe brand assets
│
├── README.md                     # Quick start guide
├── BUILD_STRUCTURE.md            # Build architecture details
├── DASHBOARD_STRUCTURE.md        # Dashboard integration
├── CHAT_SESSIONS_FIELDS.md       # Session fields reference
├── Website.md                    # Single source of truth (this file)
├── Website PORXe.md              # Previous snapshot/reference
├── package.json                  # Dependencies & scripts
├── package-lock.json
├── next.config.js               # Next.js configuration
├── tsconfig.json                 # TypeScript configuration
└── next-env.d.ts
```

---

## Connection Summary

### How Everything Connects

```
┌─────────────────────────────────────────────────────────────┐
│                    PROXe Website Build                       │
│                  (This Repository)                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Marketing Website (app/page.tsx)                          │
│       ↓                                                     │
│  Embedded Chat Widget (BrandChatWidget)                    │
│       ↓                                                     │
│  ChatWidget Component                                       │
│       ↓                                                     │
│  API Routes (app/api/*)                                     │
│       ├── /api/chat → Claude API                          │
│       ├── /api/calendar → Google Calendar API             │
│       └── /api/sessions → Supabase                        │
│       ↓                                                     │
│  Supabase Database                                          │
│       ├── web_sessions (session data)                      │
│       ├── all_leads (unified customers)                    │
│       └── messages (audit log)                              │
│       ↓                                                     │
│  unified_leads View                                         │
│       ↓                                                     │
│  Supabase Realtime                                          │
│       ↓                                                     │
│  ┌─────────────────────────────────────────────────────┐   │
│  │     PROXe Command Center Dashboard                  │   │
│  │     (Separate Repository)                           │   │
│  │                                                      │   │
│  │  Reads from unified_leads view                      │   │
│  │  Subscribes to all_leads changes                    │   │
│  │  Displays leads in real-time                        │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Key Connections

1. **Website → Chat Widget**: Embedded via `<BrandChatWidget />`
2. **Chat Widget → API**: Calls `/api/chat`, `/api/calendar/*`
3. **API → Supabase**: Reads/writes to `web_sessions`, `all_leads`
4. **API → Claude**: AI chat responses
5. **API → Google Calendar**: Booking creation
6. **Supabase → Dashboard**: Real-time updates via `unified_leads` view

---

## Important Notes

### This Build Contains

✅ **PROXe Marketing Website** - Public-facing website  
✅ **Web Agent** - AI chat widget embedded on website  
✅ **API Routes** - Chat, calendar, sessions  
✅ **Database Integration** - Supabase connection  
✅ **Dashboard Connection** - Feeds data to Command Center  
✅ **Knowledge Base Search** - Supabase tables: `system_prompts`, `agents`, `conversation_states`, `cta_triggers`, `model_context`, `chatbot_responses`  

### This Build Does NOT Contain

❌ **Dashboard UI** - Separate repository  
❌ **WhatsApp Agent** - Separate system  
❌ **Voice Agent UI** - Separate system (voice session API only)  
❌ **Social Agent** - Separate system  

### Current Status

- **Active Channel**: Web (voice sessions endpoint available for data; WhatsApp/Social agents not active)
- **Brand**: PROXe only
- **Database**: Supabase (PostgreSQL) — primary tables `web_sessions`, `all_leads`, `messages` with legacy `sessions` fallback
- **AI Provider**: Anthropic Claude API (model configurable via `CLAUDE_MODEL`, defaults to Claude Haiku 4.5)
- **Calendar**: Google Calendar API
- **Deployment**: Vercel (or VPS)

---

## Quick Reference

### Main Entry Points

- **Website**: `app/page.tsx`
- **Chat Widget**: `src/components/shared/ChatWidget.tsx`
- **Chat API**: `app/api/chat/route.ts`
- **Voice Sessions API**: `app/api/sessions/voice/route.ts`
- **Session Management**: `src/lib/chatSessions.ts`

### Database Tables

- **`web_sessions`** - Web agent session data (primary table)
- **`all_leads`** - Unified customer records
- **`messages`** - Message audit log
- **`unified_leads`** - Dashboard view (read-only)

### Knowledge Base Tables (used by `/api/chat` search)

- `system_prompts`
- `agents`
- `conversation_states`
- `cta_triggers`
- `model_context`
- `chatbot_responses`

### API Endpoints

- `POST /api/chat` - Main chat endpoint (logs messages to `messages` table)
- `POST /api/chat/summarize` - Summarize conversation
- `GET /api/calendar/availability` - Check available slots
- `POST /api/calendar/book` - Create booking
- `GET /api/sessions` - List sessions
- `GET /api/sessions/web` - List web sessions
- `GET /api/sessions/voice` - List voice sessions

### Key Functions

- `ensureSession()` - Create/get session
- `updateSessionProfile()` - Update profile, link to all_leads
- `addUserInput()` - Save user message
- `storeBooking()` - Save booking
- `checkExistingBooking()` - Check for duplicate bookings
- `logMessage()` - Log messages to `messages` table (for Dashboard Inbox)
- `ensureAllLeads()` - Ensure `all_leads` record exists and return `lead_id`

---

## Version & Maintenance

**Current Version**: 1.2.0  
**Last Updated**: December 2025  
**Maintained By**: PROXe Team

**Recent Updates (v1.2.0)**:
- ✅ Knowledge base search pulls prioritized snippets from Supabase tables (`system_prompts`, `agents`, `conversation_states`, `cta_triggers`, `model_context`, `chatbot_responses`) before building Claude prompts
- ✅ Multi-channel session APIs: channel-specific tables (`web_sessions`, `voice_sessions`) with graceful fallback to legacy `sessions` during migrations
- ✅ Lead lifecycle hardening: phone normalization to last 10 digits, `ensureAllLeads` merges `unified_context`, writes `lead_id` back to `web_sessions`
- ✅ Message logging pipeline: customer/agent messages logged to `messages` with HTML stripping and metadata (`topic`, `extension`, `input_received_at`, `output_sent_at`, `input_to_output_gap_ms`)
- ✅ Booking protection: duplicate booking checks, IST timestamps, bookings persisted to `web_sessions` + `all_leads.unified_context`, reschedule/view buttons when a booking exists
- ✅ Follow-up UX & resilience: contextual button generation (avoids repeats, respects bookings), Claude streaming retries with friendlier error surfaces

**This document is the single source of truth for the PROXe Website + Web Agent build.**

For specific implementation details, refer to:
- `BUILD_STRUCTURE.md` - Technical architecture
- `DASHBOARD_STRUCTURE.md` - Dashboard integration
- `CHAT_SESSIONS_FIELDS.md` - Database fields
- `README.md` - Quick start guide

