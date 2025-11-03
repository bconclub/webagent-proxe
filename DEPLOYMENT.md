# Deployment Guide

This guide covers deploying the PROXe Chat Widget application to Vercel (frontend) and separate backend hosting.

## Architecture

- **Frontend**: Next.js application deployed on Vercel
- **Backend**: Express API server deployed separately (Railway, Render, etc.)

## Frontend Deployment - Vercel

Vercel provides automatic deployments from Git repositories with zero configuration for Next.js.

### Prerequisites

- GitHub repository with the code
- Vercel account ([vercel.com](https://vercel.com))

### Deployment Steps

#### 1. Push Code to GitHub

```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

#### 2. Connect to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "Add New Project"
3. Import your GitHub repository
4. Vercel will auto-detect Next.js

#### 3. Configure Build Settings

Vercel should auto-detect, but verify:
- **Framework Preset**: Next.js
- **Root Directory**: `frontend` (if repository root contains both frontend and backend)
- **Build Command**: `npm run build` (runs in frontend directory)
- **Output Directory**: `.next` (default)

#### 4. Set Environment Variables

In Vercel Dashboard → Project Settings → Environment Variables:

| Variable | Value | Description |
|---------|-------|-------------|
| `NEXT_PUBLIC_API_URL` | `https://your-backend-url.com` | Your backend API URL |

**Important**: Replace `https://your-backend-url.com` with your actual backend deployment URL.

#### 5. Deploy

- Click "Deploy"
- Vercel will build and deploy your application
- You'll get a URL like: `https://your-project.vercel.app`

#### 6. Automatic Deployments

- Every push to `main` branch triggers automatic deployment
- Preview deployments are created for pull requests
- Configure custom domains in Project Settings → Domains

### Vercel Configuration

The project includes `vercel.json` with optimized settings:
- Next.js framework detection
- Build and install commands
- Environment variable support

## Backend Deployment

The backend (`backend/` folder) must be deployed separately since Vercel is optimized for frontend/serverless functions.

### Option 1: Railway

1. Go to [railway.app](https://railway.app)
2. Create new project → Deploy from GitHub
3. Select your repository
4. Set root directory to `backend`
5. Add environment variables:
   - `CLAUDE_API_KEY` (required)
   - `PROXE_SUPABASE_URL` (optional)
   - `PROXE_SUPABASE_ANON_KEY` (optional)
   - `SUPABASE_URL` (optional)
   - `SUPABASE_ANON_KEY` (optional)
6. Railway will auto-detect Node.js and deploy
7. Get your backend URL (e.g., `https://your-app.railway.app`)
8. Update `NEXT_PUBLIC_API_URL` in Vercel with this URL

### Option 2: Render

1. Go to [render.com](https://render.com)
2. Create new Web Service
3. Connect GitHub repository
4. Configure:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
5. Add environment variables (same as Railway)
6. Deploy and get URL
7. Update Vercel environment variable

### Option 3: Heroku

1. Go to [heroku.com](https://heroku.com)
2. Create new app
3. Connect GitHub repository
4. Set config vars (environment variables)
5. Deploy

### Option 4: Any Node.js Hosting

- DigitalOcean App Platform
- AWS Elastic Beanstalk
- Google Cloud Run
- Azure App Service

## Environment Variables

### Frontend (Vercel)

```env
NEXT_PUBLIC_API_URL=https://your-backend-url.com
```

### Backend (Railway/Render/etc.)

```env
CLAUDE_API_KEY=sk-ant-api03-your-key-here
PROXE_SUPABASE_URL=your-proxe-supabase-url
PROXE_SUPABASE_ANON_KEY=your-proxe-key
SUPABASE_URL=your-windchasers-supabase-url
SUPABASE_ANON_KEY=your-windchasers-key
```

## CORS Configuration

Make sure your backend accepts requests from your Vercel domain:

In `backend/server.js`, the CORS configuration should allow your Vercel domain:

```javascript
app.use(cors({
  origin: [
    'https://your-project.vercel.app',
    'https://your-custom-domain.com',
    'http://localhost:3002' // for local dev
  ],
  credentials: true
}));
```

Or allow all origins in production:

```javascript
app.use(cors({
  origin: '*',
  credentials: true
}));
```

## Post-Deployment Checklist

- [ ] Frontend deployed on Vercel
- [ ] Backend deployed separately
- [ ] `NEXT_PUBLIC_API_URL` set in Vercel with backend URL
- [ ] Backend CORS allows Vercel domain
- [ ] Test chat functionality on deployed frontend
- [ ] Custom domain configured (optional)
- [ ] SSL certificates active (automatic on Vercel)

## Troubleshooting

### Frontend can't connect to backend

- Verify `NEXT_PUBLIC_API_URL` is set correctly in Vercel
- Check backend CORS settings
- Verify backend is running and accessible
- Check browser console for CORS errors

### Build fails on Vercel

- Check build logs in Vercel dashboard
- Verify `package.json` has correct dependencies
- Ensure Node.js version is compatible (18+)

### API calls return 500 errors

- Check backend logs
- Verify `CLAUDE_API_KEY` is set in backend
- Check backend deployment status

## Local Development vs Production

### Development
- Frontend: `http://localhost:3002`
- Backend: `http://localhost:3000`
- Uses Next.js rewrites to proxy `/api/*` to localhost:3000

### Production
- Frontend: `https://your-project.vercel.app`
- Backend: `https://your-backend-url.com`
- Uses `NEXT_PUBLIC_API_URL` environment variable

## Monitoring

- **Vercel Analytics**: Built-in analytics and monitoring
- **Backend Logs**: Check your hosting provider's logs
- **Error Tracking**: Consider adding Sentry or similar
