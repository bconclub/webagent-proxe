# Wind Chasers Website PROXe

AI-powered chatbot backend for Wind Chasers Aviation Academy website.

**Stack:**
- Node.js + Express
- Google Vertex AI (Gemini)
- Supabase (PostgreSQL + pgvector)
- PROXe Widget (Frontend)

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Locally
```bash
npm run dev
```

Server starts on `http://localhost:3000`

### 3. Test API
```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What courses do you offer?"}'
```

## API Endpoints

### POST /api/chat
- **Request:** `{ "message": "your question" }`
- **Response:** `{ "response": "AI answer", "sources": 3 }`

### GET /api/health
- **Response:** `{ "status": "ok", "service": "Wind Chasers Website PROXe API" }`

## Environment Variables

Already configured in `.env`:
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_ANON_KEY` - Public API key
- `GOOGLE_PROJECT_ID` - Google Cloud project
- `PORT` - Server port (default: 3000)

## Deployment

### Vercel
```bash
vercel
```

### Self-hosted
```bash
npm start
```

## Connect Widget

Update your PROXe widget's API URL:
```javascript
fetch('https://your-api-url.com/api/chat', ...)
```

## Architecture

```
PROXe Widget (Frontend)
    ↓
windchasers-website-proxe API
    ↓
Google Vertex AI (Gemini LLM)
    ↓
Supabase (Vector DB + Search)
```

## Status

✅ Backend ready
🔄 Connect to widget
🚀 Deploy
