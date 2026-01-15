# PROXe Build Structure - Complete Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Directory Structure](#directory-structure)
4. [Database Schema](#database-schema)
5. [API Routes](#api-routes)
6. [Component Architecture](#component-architecture)
7. [Configuration System](#configuration-system)
8. [Data Flow](#data-flow)
9. [Security & Authentication](#security--authentication)
10. [Environment Variables](#environment-variables)
11. [Deployment](#deployment)
12. [Key Features](#key-features)

---

## Project Overview

**PROXe** is a Next.js 14 application that provides AI-powered chat widgets, lead management, and booking functionality for PROXe with dynamic theming and real-time chat capabilities.

### Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Frontend**: React 18
- **Styling**: CSS Modules, CSS Variables
- **AI**: Anthropic Claude API (Sonnet 4)
- **Database**: Supabase (PostgreSQL)
- **Calendar**: Google Calendar API
- **Animations**: Motion, Lottie React
- **3D Graphics**: OGL

### Key Capabilities
- Multi-brand chat widgets with dynamic theming
- Real-time AI chat with streaming responses
- Session management and lead tracking
- Google Calendar booking integration
- Multi-channel support (Web, WhatsApp, Voice, Social)
- Dashboard for lead management
- Row Level Security (RLS) for data protection

---

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Next.js App Router                        │
├─────────────────────────────────────────────────────────────┤
│  Frontend (React/TypeScript)                                │
│  ├── Pages (Server Components)                             │
│  ├── Components (Client Components)                         │
│  ├── Hooks (Custom React Hooks)                            │
│  └── API Routes (Server Actions)                           │
├─────────────────────────────────────────────────────────────┤
│  Backend Services                                           │
│  ├── Supabase (Database + Auth + Realtime)                 │
│  ├── Anthropic Claude API (AI Chat)                        │
│  └── Google Calendar API (Bookings)                        │
└─────────────────────────────────────────────────────────────┘
```

### Multi-Brand Architecture

The application supports multiple brands through:
- **Brand-specific configurations** (`src/configs/`)
- **Dynamic theming** (CSS variables per brand)
- **Separate Supabase projects** (one per brand)
- **Shared codebase** with brand detection

---

## Directory Structure

```
PROXe/
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes
│   │   ├── calendar/            # Calendar booking APIs
│   │   │   ├── availability/   # GET - Check availability
│   │   │   ├── book/            # POST - Create booking
│   │   │   └── list/            # GET - List bookings
│   │   ├── chat/                # Chat APIs
│   │   │   ├── route.ts        # POST - Main chat endpoint
│   │   │   └── summarize/      # POST - Summarize conversation
│   │   └── sessions/            # Session management APIs
│   │       ├── route.ts        # GET - List sessions (all channels)
│   │       ├── web/            # GET - Web sessions
│   │       └── voice/          # GET - Voice sessions
│   ├── chat/                     # Chat page
│   │   └── page.tsx
│   ├── proxe/                   # PROXe brand homepage
│   │   ├── page.tsx
│   │   └── page.module.css
│   │   └── page.tsx
│   ├── layout.tsx               # Root layout
│   └── page.tsx                 # Default homepage (PROXe)
│
├── src/                          # Source code
│   ├── api/                      # API-related code
│   │   └── prompts/             # AI prompts per brand
│   │       ├── proxe-prompt.ts
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
│   │   ├── proxe.config.ts
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
│           ├── proxe.css
│
├── supabase/                     # Database schema & migrations
│   ├── chat_schema.sql         # Main database schema
│   └── migrations/             # Database migrations
│       └── 007_add_web_sessions_rls_policies.sql
│
├── public/                       # Static assets
│   └── assets/
│       ├── icons/               # Brand icons & SVGs
│       └── proxe/              # PROXe brand assets
│
├── .github/                     # GitHub workflows
│   └── workflows/
│       └── deploy.yml
│
├── package.json                  # Dependencies & scripts
├── next.config.js               # Next.js configuration
├── tsconfig.json                 # TypeScript configuration
├── vercel.json                  # Vercel deployment config
│
└── Documentation/
    ├── README.md
    ├── BUILD_STRUCTURE.md       # This file
    ├── DASHBOARD_STRUCTURE.md
    ├── WEB_PROXE_LEAD_FLOW.md
    ├── CHAT_SESSIONS_FIELDS.md
    ├── FIX_RLS_POLICIES.md
    └── GOOGLE_EVENT_ID_EXPLANATION.md
```

---

## Database Schema

### Overview

The database uses a **multi-touchpoint architecture** with:
- **`all_leads`** - Unifier table (one record per customer)
- **Channel-specific tables** - `web_sessions`, `whatsapp_sessions`, `voice_sessions`, `social_sessions`
- **`messages`** - Universal message log
- **`unified_leads`** - View for dashboard display

### Core Tables

#### `all_leads`
**Purpose**: Minimal unifier - one record per unique customer across all channels

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

#### `web_sessions`
**Purpose**: Self-contained Web PROXe session data

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `lead_id` | UUID | Foreign key to `all_leads.id` (nullable) |
| `brand` | ENUM | `'proxe'` |
| `customer_name` | TEXT | Customer's name |
| `customer_email` | TEXT | Customer's email |
| `customer_phone` | TEXT | Customer's phone |
| `customer_phone_normalized` | TEXT | Normalized phone for deduplication |
| `external_session_id` | TEXT | External session identifier (unique) |
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

**Note**: Similar structure for `whatsapp_sessions`, `voice_sessions`, `social_sessions`

#### `messages`
**Purpose**: Universal append-only message log

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `lead_id` | UUID | Foreign key to `all_leads.id` |
| `channel` | ENUM | `'web'`, `'whatsapp'`, `'voice'`, `'social'` |
| `sender` | ENUM | `'customer'`, `'agent'`, or `'system'` |
| `content` | TEXT | Message content |
| `message_type` | TEXT | `'text'`, `'image'`, `'audio'`, etc. |
| `metadata` | JSONB | Additional message metadata |
| `created_at` | TIMESTAMP | When message was created |

### Views

#### `unified_leads`
**Purpose**: Dashboard display view - aggregates all customer data

Queries `all_leads` and joins with channel-specific tables to provide a unified view of all leads across all channels.

**Key Columns**:
- `id`, `name`, `email`, `phone`
- `first_touchpoint`, `last_touchpoint`
- `brand`, `timestamp`, `last_interaction_at`
- `metadata` (JSONB with channel data)

### Row Level Security (RLS)

All tables have RLS enabled with policies for:
- **Anonymous users** (`anon` role):
  - INSERT, SELECT, UPDATE on `web_sessions` and other channel tables
  - INSERT, SELECT, UPDATE on `sessions` (legacy)
  - SELECT on `unified_leads` view
- **Authenticated users** (`authenticated` role):
  - Full access to all tables for dashboard

See `supabase/migrations/007_add_web_sessions_rls_policies.sql` for complete RLS setup.

---

## API Routes

### Chat APIs

#### `POST /api/chat`
**Purpose**: Main chat endpoint for AI conversations

**Request Body**:
```json
{
  "message": "User's message",
  "sessionId": "external_session_id",
  "brand": "proxe",
  "conversationHistory": [...]
}
```

**Response**: Streaming response (Server-Sent Events)

**Features**:
- Streaming AI responses
- Session management
- Conversation history
- Brand-specific prompts

#### `POST /api/chat/summarize`
**Purpose**: Summarize conversation for memory compression

**Request Body**:
```json
{
  "sessionId": "external_session_id",
  "conversationHistory": [...],
  "brand": "proxe"
}
```

**Response**:
```json
{
  "summary": "Compressed conversation summary"
}
```

### Calendar APIs

#### `GET /api/calendar/availability`
**Purpose**: Check available time slots

**Query Parameters**:
- `date`: Date string (YYYY-MM-DD)
- `brand`: `"proxe"`

**Response**:
```json
{
  "availableSlots": ["09:00", "10:00", "11:00", ...]
}
```

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
  "phone": "+1234567890",
  "brand": "proxe"
}
```

**Response**:
```json
{
  "success": true,
  "eventId": "google_calendar_event_id",
  "bookingId": "booking_uuid"
}
```

#### `GET /api/calendar/list`
**Purpose**: List bookings

**Query Parameters**:
- `startDate`: Start date filter
- `endDate`: End date filter
- `brand`: `"proxe"`

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

#### `GET /api/sessions/web`
**Purpose**: List web sessions specifically

**Query Parameters**: Same as `/api/sessions`

#### `GET /api/sessions/voice`
**Purpose**: List voice sessions specifically

**Query Parameters**: Same as `/api/sessions`

---

## Component Architecture

### Core Components

#### `ChatWidget` (`src/components/shared/ChatWidget.tsx`)
**Type**: Client Component

**Purpose**: Main chat widget with AI integration

**Features**:
- Real-time streaming responses
- Session management
- User profile collection (name, email, phone)
- Booking integration
- Local storage persistence
- Brand-specific theming

**Props**:
```typescript
{
  brand?: 'proxe';
  apiKey?: string;
  initialMessage?: string;
}
```

#### `BrandChatWidget` (`src/components/brand/BrandChatWidget.tsx`)
**Type**: Client Component

**Purpose**: Brand-specific wrapper for ChatWidget

**Features**:
- Brand detection
- Theme application
- Configuration loading

#### `BookingCalendarWidget` (`src/components/shared/BookingCalendarWidget.tsx`)
**Type**: Client Component

**Purpose**: Calendar booking interface

**Features**:
- Available slot display
- Date selection
- Time slot booking
- Google Calendar integration

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

### Libraries

#### `chatSessions.ts` (`src/lib/chatSessions.ts`)
**Purpose**: Session management with Supabase

**Key Functions**:
- `ensureSession()` - Create or get session
- `updateSessionProfile()` - Update user profile
- `addUserInput()` - Add user input to session
- `upsertSummary()` - Update conversation summary
- `storeBooking()` - Store booking information
- `fetchSummary()` - Get conversation summary

**Features**:
- Multi-channel support
- Fallback to legacy `sessions` table
- `all_leads` integration
- Column name mapping (old → new structure)

#### `supabaseClient.ts` (`src/lib/supabaseClient.ts`)
**Purpose**: Supabase client factory

**Features**:
- Multi-brand support
- Client caching
- Environment variable handling
- Debug logging

---

## Configuration System

### Brand Configurations

Each brand has its own configuration file in `src/configs/`:

#### `proxe.config.ts`
```typescript
{
  name: 'PROXe',
  theme: {
    primaryColor: '#5B1A8C',
    // ... other theme variables
  },
  supabase: {
    url: process.env.NEXT_PUBLIC_PROXE_SUPABASE_URL,
    anonKey: process.env.NEXT_PUBLIC_PROXE_SUPABASE_ANON_KEY
  },
  // ... other config
}
```


### Theme System

Themes are defined in:
- `src/styles/themes/proxe.css`

Uses CSS variables for dynamic theming:
```css
:root {
  --brand-primary: #5B1A8C;
  --brand-secondary: #...;
  /* ... */
}
```

---

## Data Flow

### Chat Flow

```
1. User opens chat widget
   ↓
2. ChatWidget initializes
   ↓
3. ensureSession() called
   - Creates/gets session in web_sessions
   - Links to all_leads if customer data available
   ↓
4. User sends message
   ↓
5. POST /api/chat
   - Validates session
   - Calls Claude API
   - Streams response
   ↓
6. Response received
   - Updates UI
   - Updates session (message_count, last_message_at)
   ↓
7. User provides profile (name, email, phone)
   ↓
8. updateSessionProfile() called
   - Updates web_sessions
   - Creates/updates all_leads
   - Links via lead_id
   ↓
9. Conversation continues
   ↓
10. Periodically: POST /api/chat/summarize
    - Compresses conversation
    - Updates conversation_summary
```

### Booking Flow

```
1. User requests booking
   ↓
2. GET /api/calendar/availability
   - Checks Google Calendar
   - Returns available slots
   ↓
3. User selects date/time
   ↓
4. POST /api/calendar/book
   - Creates Google Calendar event
   - Calls storeBooking()
   - Updates web_sessions with booking info
   ↓
5. Booking confirmed
   - Updates session with google_event_id
```

### Lead Flow (Webhook)

```
1. External system sends POST /api/integrations/web-agent
   ↓
2. Normalize phone number
   ↓
3. Check all_leads (by phone + brand)
   ↓
4. [New] → Create all_leads
   [Existing] → Update all_leads
   ↓
5. Create web_sessions record
   - Links to all_leads via lead_id
   ↓
6. Insert into messages table
   ↓
7. unified_leads view updates
   ↓
8. Dashboard receives real-time update
```

---

## Security & Authentication

### Row Level Security (RLS)

All database tables have RLS enabled:

**Anonymous Users** (`anon` role):
- Can INSERT, SELECT, UPDATE on `web_sessions` and channel tables
- Can SELECT on `unified_leads` view
- Cannot access `all_leads` directly (via webhook only)

**Authenticated Users** (`authenticated` role):
- Full access to all tables for dashboard

### API Security

- **Chat APIs**: Use anon key (client-side)
- **Calendar APIs**: Server-side only (uses service account)
- **Webhook APIs**: Use service role key (bypasses RLS)

### Environment Variables

- **Client-side**: `NEXT_PUBLIC_*` variables (exposed to browser)
- **Server-side**: Non-prefixed variables (server-only)

---

## Environment Variables

### Required Variables

#### Claude API
```env
CLAUDE_API_KEY=sk-ant-api03-...
```

#### Supabase (PROXe)
```env
NEXT_PUBLIC_PROXE_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_PROXE_SUPABASE_ANON_KEY=eyJ...
```


#### Google Calendar
```env
GOOGLE_CALENDAR_ID=xxx@group.calendar.google.com
GOOGLE_SERVICE_ACCOUNT_EMAIL=xxx@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

### Optional Variables

#### Server-side Supabase (if different from client)
```env
PROXE_SUPABASE_URL=https://xxx.supabase.co
PROXE_SUPABASE_ANON_KEY=eyJ...
```

---

## Deployment

### Vercel Deployment

1. **Connect Repository**
   - Push code to GitHub
   - Import to Vercel

2. **Configure Environment Variables**
   - Add all required variables in Vercel Dashboard
   - Set for Production, Preview, and Development

3. **Deploy**
   - Automatic on push to main
   - Manual deployment available

### Build Configuration

**Next.js Config** (`next.config.js`):
```javascript
{
  output: 'standalone',
  reactStrictMode: true
}
```

**Build Scripts**:
- `npm run build` - Standard build
- `npm run build:proxe` - PROXe brand only
- `npm run build:all` - All brands

### Database Migration

Before deployment, run database migrations:

1. **Apply Schema**:
   - Run `supabase/chat_schema.sql` in Supabase SQL Editor

2. **Apply RLS Policies**:
   - Run `supabase/migrations/007_add_web_sessions_rls_policies.sql`

3. **Verify**:
   ```sql
   SELECT tablename, policyname 
   FROM pg_policies 
   WHERE tablename IN ('web_sessions', 'all_leads');
   ```

---

## Key Features

### 1. Multi-Brand Support
- Separate configurations per brand
- Dynamic theming
- Independent Supabase projects

### 2. Real-Time Chat
- Streaming AI responses
- Session persistence
- Conversation history

### 3. Lead Management
- Multi-touchpoint tracking
- Unified lead view
- Channel-specific data

### 4. Booking Integration
- Google Calendar integration
- Availability checking
- Event creation

### 5. Security
- Row Level Security (RLS)
- Anonymous user support
- Service role for webhooks

### 6. Scalability
- Channel-specific tables
- Efficient queries
- Real-time updates

---

## Development Workflow

### Local Development

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Set Environment Variables**:
   - Create `.env.local`
   - Add all required variables

3. **Run Database Migrations**:
   - Apply `supabase/chat_schema.sql`
   - Apply RLS policies migration

4. **Start Development Server**:
   ```bash
   npm run dev
   ```

5. **Access Application**:
   - PROXe: http://localhost:3002/

### Code Structure Guidelines

- **Components**: Use Client Components (`'use client'`) for interactivity
- **API Routes**: Server-side only (no `'use client'`)
- **Styling**: CSS Modules for component styles
- **Theming**: CSS Variables for brand customization
- **Type Safety**: Full TypeScript coverage

### Testing

- Manual testing in development
- Check console for errors
- Verify Supabase connections
- Test chat functionality
- Test booking flow

---

## Troubleshooting

### Common Issues

1. **RLS Policy Errors**:
   - Run `supabase/migrations/007_add_web_sessions_rls_policies.sql`
   - Verify policies exist: `SELECT * FROM pg_policies WHERE tablename = 'web_sessions';`

2. **Session Creation Fails**:
   - Check Supabase connection
   - Verify environment variables
   - Check RLS policies

3. **Chat Not Working**:
   - Verify `CLAUDE_API_KEY` is set
   - Check API route logs
   - Verify session creation

4. **Booking Fails**:
   - Check Google Calendar credentials
   - Verify calendar ID
   - Check service account permissions

---

## Additional Resources

- [DASHBOARD_STRUCTURE.md](./DASHBOARD_STRUCTURE.md) - Dashboard architecture
- [WEB_PROXE_LEAD_FLOW.md](./WEB_PROXE_LEAD_FLOW.md) - Lead flow documentation
- [CHAT_SESSIONS_FIELDS.md](./CHAT_SESSIONS_FIELDS.md) - Session fields reference
- [FIX_RLS_POLICIES.md](./FIX_RLS_POLICIES.md) - RLS policy setup guide
- [README.md](./README.md) - Quick start guide

---

## Version History

- **v1.0.0** - Initial build with multi-brand support
- Multi-channel session management
- Google Calendar integration
- Dashboard structure (planned)

---

**Last Updated**: 2024
**Maintained By**: PROXe Team

