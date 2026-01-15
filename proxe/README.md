# PROXe Website - Standalone Next.js Application

A standalone Next.js application for the PROXe brand with AI-powered chat widget.

## Features

- **AI-Powered Chat**: Real-time chat with Claude AI
- **Lead Capture**: Automatic profile collection and lead management
- **Booking Integration**: Google Calendar integration for demo scheduling
- **Real-time Updates**: Supabase Realtime for live data sync
- **Responsive Design**: Works on desktop and mobile

## Local Development

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Environment Variables

Copy `.env.local.example` to `.env.local` and fill in your credentials:

```bash
cp .env.local.example .env.local
```

Required variables:
- `NEXT_PUBLIC_SUPABASE_URL` - PROXe Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - PROXe Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY` - PROXe Supabase service role key
- `CLAUDE_API_KEY` - Anthropic Claude API key
- `GOOGLE_CALENDAR_ID` - Google Calendar ID for bookings
- `GOOGLE_SERVICE_ACCOUNT_EMAIL` - Google service account email
- `GOOGLE_PRIVATE_KEY` - Google service account private key

### 3. Start Development Server

```bash
npm run dev
```

Application will be available at `http://localhost:3000`

## Build & Deploy

### Build for Production

```bash
npm run build
```

### Start Production Server

```bash
npm run start
```

### Deploy to Vercel

1. Connect your repository to Vercel
2. Set Root Directory to `proxe/`
3. Configure environment variables in Vercel dashboard
4. Deploy

## Project Structure

```
proxe/
├── src/
│   ├── app/              # Next.js App Router
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── api/          # API routes
│   ├── components/       # React components
│   ├── lib/              # Utilities and clients
│   └── styles/           # CSS and themes
├── public/                # Static assets
├── package.json
├── next.config.js
└── tsconfig.json
```

## License

MIT
