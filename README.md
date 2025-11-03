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
│   ├── page.tsx           # PROXe brand homepage
│   └── windchasers/       # Wind Chasers brand page
├── public/                 # Static assets
├── api/                    # Express API server (deploy separately)
│   ├── server.js
│   └── package.json
├── package.json            # Frontend dependencies
├── next.config.js          # Next.js configuration
└── tsconfig.json           # TypeScript configuration
```

## Prerequisites

- Node.js 18+ 
- npm or yarn
- API server (deployed separately)

## Local Development

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Environment Variables

Create `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### 3. Start API Server

In a separate terminal:

```bash
cd api
npm install
# Create api/.env with CLAUDE_API_KEY
npm run dev
```

API server should be running on `http://localhost:3000`

### 4. Start Frontend Dev Server

```bash
npm run dev
```

Frontend will be available at `http://localhost:3002`

### 5. Access the Application

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
   - `NEXT_PUBLIC_API_URL`: Your API server URL (e.g., `https://your-api.railway.app`)
   
   **Note**: Replace with your actual API server deployment URL.

4. **Deploy**
   - Vercel will automatically deploy on every push to main
   - Or manually trigger deployment from the dashboard

### Vercel Configuration

The project uses standard Next.js structure:
- `package.json` at root (Vercel auto-detects)
- `next.config.js` for configuration
- Environment variable support for API URL
- Automatic routing via Next.js App Router

### API Server Deployment

The API server (`api/` folder) needs to be deployed separately:
- **Railway**: [railway.app](https://railway.app)
- **Render**: [render.com](https://render.com)
- **Heroku**: [heroku.com](https://heroku.com)
- Or any Node.js hosting service

Make sure to:
1. Set CORS to allow requests from your Vercel domain
2. Set all required environment variables (CLAUDE_API_KEY, etc.)
3. Update `NEXT_PUBLIC_API_URL` in Vercel with your API server URL

## Environment Variables

### Frontend (Vercel)

- `NEXT_PUBLIC_API_URL` - API server URL (required in production)

### API Server (Separate Deployment)

- `CLAUDE_API_KEY` - Anthropic Claude API key (required)
- `PROXE_SUPABASE_URL` - PROXe Supabase URL (optional)
- `PROXE_SUPABASE_ANON_KEY` - PROXe Supabase key (optional)
- `SUPABASE_URL` - Wind Chasers Supabase URL (optional)
- `SUPABASE_ANON_KEY` - Wind Chasers Supabase key (optional)

## Available Scripts

### Frontend

- `npm run dev` - Start development server (port 3002)
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### API Server

```bash
cd api
npm run dev    # Start development server (port 3000)
npm start      # Start production server
```

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: CSS Modules, CSS Variables
- **API**: Express.js, Anthropic Claude API
- **Database**: Supabase (optional, for knowledge base)

## License

MIT
