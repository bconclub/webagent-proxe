# PROXe Chat Widget - Next.js React Application

A modern, brand-themed chat widget built with Next.js, React, and TypeScript. Supports multiple brands (PROXe, Wind Chasers) with dynamic theming and real-time chat functionality.

## Features

- **Multi-brand Support**: PROXe and Wind Chasers themes
- **Real-time Chat**: Streaming responses from Claude AI
- **Responsive Design**: Works on desktop and mobile
- **Dynamic Theming**: CSS variables for easy brand customization
- **TypeScript**: Fully typed for better development experience

## Project Structure

```
/
├── src/                    # React components, hooks, styles
│   ├── components/         # React components
│   ├── hooks/             # Custom React hooks
│   ├── configs/           # Brand configurations
│   └── styles/            # CSS and themes
├── app/                    # Next.js App Router pages
│   ├── api/               # Next.js API routes
│   ├── page.tsx           # PROXe brand homepage
│   └── windchasers/       # Wind Chasers brand page
├── public/                 # Static assets
├── package.json            # Frontend dependencies
├── next.config.js          # Next.js configuration
└── tsconfig.json           # TypeScript configuration
```

## Prerequisites

- Node.js 18+ 
- npm or yarn

## Local Development

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Environment Variables

Create `.env.local`:

```env
# Required: Claude API Key for chat functionality
CLAUDE_API_KEY=sk-ant-api03-your-key-here

# Required: Supabase URLs and keys for knowledge base
PROXE_SUPABASE_URL=your-proxe-supabase-url
PROXE_SUPABASE_ANON_KEY=your-proxe-supabase-key
SUPABASE_URL=your-windchasers-supabase-url
SUPABASE_ANON_KEY=your-windchasers-supabase-key

# Required: Google Calendar API credentials
GOOGLE_CALENDAR_ID=your-calendar-id
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY=your-private-key
```

**Get your Claude API Key:**
- Visit [Anthropic Console](https://console.anthropic.com/)
- Create an API key
- Add it to `.env.local` as `CLAUDE_API_KEY`

### 3. Start Development Server

```bash
npm run dev
```

Application will be available at `http://localhost:3002`

### 4. Access the Application

- **PROXe Brand**: http://localhost:3002/
- **Wind Chasers Brand**: http://localhost:3002/windchasers

## Deployment to Vercel

Vercel automatically detects Next.js and provides zero-configuration deployment when connected to your Git repository. No Root Directory configuration needed!

### Steps

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your Git repository
   - Vercel will auto-detect Next.js (package.json is at root)

3. **Configure Environment Variables**
   
   In Vercel Dashboard → Project Settings → Environment Variables:
   
   **Required:**
   - `CLAUDE_API_KEY`: Your Anthropic Claude API key (get from [console.anthropic.com](https://console.anthropic.com/))
   - `PROXE_SUPABASE_URL`: PROXe Supabase URL
   - `PROXE_SUPABASE_ANON_KEY`: PROXe Supabase anonymous key
   - `SUPABASE_URL`: Wind Chasers Supabase URL
   - `SUPABASE_ANON_KEY`: Wind Chasers Supabase anonymous key
   - `GOOGLE_CALENDAR_ID`: Google Calendar ID for bookings
   - `GOOGLE_SERVICE_ACCOUNT_EMAIL`: Google service account email
   - `GOOGLE_PRIVATE_KEY`: Google service account private key

4. **Deploy**
   - Vercel will automatically deploy on every push to main
   - Or manually trigger deployment from the dashboard

### Vercel Configuration

The project uses standard Next.js structure:
- `package.json` at root (Vercel auto-detects)
- `next.config.js` for configuration
- Built-in Next.js API routes for chat and calendar
- Automatic routing via Next.js App Router

## Environment Variables

### Required Environment Variables

- `CLAUDE_API_KEY` - Anthropic Claude API key (get from [console.anthropic.com](https://console.anthropic.com/))
- `PROXE_SUPABASE_URL` - PROXe Supabase URL
- `PROXE_SUPABASE_ANON_KEY` - PROXe Supabase anonymous key
- `SUPABASE_URL` - Wind Chasers Supabase URL
- `SUPABASE_ANON_KEY` - Wind Chasers Supabase anonymous key
- `GOOGLE_CALENDAR_ID` - Google Calendar ID for bookings
- `GOOGLE_SERVICE_ACCOUNT_EMAIL` - Google service account email
- `GOOGLE_PRIVATE_KEY` - Google service account private key

## Available Scripts

- `npm run dev` - Start development server (port 3002)
- `npm run build` - Build for production
- `npm run build:proxe` - Build PROXe brand only
- `npm run build:windchasers` - Build Wind Chasers brand only
- `npm run build:all` - Build all brands
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Frontend**: React 18, TypeScript
- **Styling**: CSS Modules, CSS Variables
- **AI**: Anthropic Claude API (Sonnet 4)
- **Database**: Supabase (for knowledge base)
- **Calendar**: Google Calendar API
- **Animations**: Motion, Lottie React
- **3D Graphics**: OGL (for background effects)

## License

MIT
