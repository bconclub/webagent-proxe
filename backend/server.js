import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import Anthropic from '@anthropic-ai/sdk';
import { marked } from 'marked';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// CORS configuration
app.use(cors({
  origin: '*', // Allow all origins for development
  credentials: true
}));

app.use(express.json());

// Serve static files from frontend directory
app.use(express.static(path.join(__dirname, '../frontend')));

// Initialize Supabase
const supabaseUrl = process.env.SUPABASE_URL || 'https://nfnwmkxgfgqgorwgonwf.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5mbndta3hnZmdxZ29yd2dvbndmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwOTU4MTcsImV4cCI6MjA3NTY3MTgxN30.fTwOPszajAM_MhulX4cPGWzzYchfHMaBNkCs_6S4ZYQ';
const supabase = createClient(supabaseUrl, supabaseKey);

// Initialize Claude API
const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY,
});

// Configure marked for clean HTML output
marked.setOptions({
  breaks: true,
  gfm: true,
});

// Function to search similar content in Supabase
async function searchKnowledgeBase(query, table = 'documents', limit = 3) {
  try {
    // Use ilike for simple text matching instead of textSearch
    const { data, error } = await supabase
      .from(table)
      .select('id, content, metadata')
      .or(`content.ilike.%${query}%,metadata->>title.ilike.%${query}%`)
      .limit(limit);

    if (error) {
      console.error('Search error:', error);
      // Fallback: try without metadata search
      const { data: fallbackData, error: fallbackError } = await supabase
        .from(table)
        .select('id, content, metadata')
        .ilike('content', `%${query}%`)
        .limit(limit);
      
      if (fallbackError) {
        console.error('Fallback search error:', fallbackError);
        return [];
      }
      return fallbackData || [];
    }

    return data || [];
  } catch (error) {
    console.error('Error searching knowledge base:', error);
    return [];
  }
}

// Chat endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || message.trim() === '') {
      return res.status(400).json({ error: 'Message is required' });
    }

    console.log('User message:', message);

    // Search knowledge base
    console.log('Searching knowledge base...');
    const relevantDocs = await searchKnowledgeBase(message, 'documents', 3);
    
    console.log('Found docs:', relevantDocs.length);

    // Format context
    let context = '';
    if (relevantDocs.length > 0) {
      context = 'Based on our knowledge base:\n\n';
      relevantDocs.forEach((doc, index) => {
        context += `${index + 1}. ${doc.content}\n`;
      });
    } else {
      context = 'No specific information found in knowledge base. Provide general helpful response.';
    }

    // Create system prompt
    const systemPrompt = `You are Wind Chasers Aviation Academy's AI assistant, embedded directly on the academy's website chat widget.

🚫 ABSOLUTE PROHIBITIONS - NEVER DO THESE:
1. NEVER tell users to "visit the website" or "go to windchasers.in" - THE USER IS ALREADY ON THE WEBSITE RIGHT NOW
2. NEVER say "contact the academy at their website" - just say "Would you like to schedule a call with our team?"
3. NEVER say "I don't have that in my database" or any technical limitations language
4. NEVER refer to the website as a third-party resource - YOU ARE ON THE WEBSITE

✅ INSTEAD, WHEN YOU DON'T KNOW SOMETHING:
Say: "I'm afraid I don't have those specific details right now. Would you like me to connect you with our admissions team for a detailed discussion? 📞"

RESPONSE LENGTH:
- Keep responses SHORT and TO THE POINT (2-4 sentences or bullet points)
- Only provide detailed explanations when the user specifically asks for more information
- If a topic needs detail, give a brief overview first, then ask "Would you like me to explain any of these in more detail?"

FORMATTING REQUIREMENTS:
- Use numbered lists (1., 2., 3.) for step-by-step or sequential information
- Use bullet points (•) for feature lists
- Add relevant emojis: ✈️ 🎓 💰 📚 🛫 👨‍✈️ 📞 ✅
- Use **bold** for important terms, course names, and key points
- Keep paragraphs short (2-3 sentences max)

YOUR PERSONALITY:
- Friendly and encouraging about aviation careers
- Professional but warm
- Enthusiastic about helping students achieve their pilot dreams
- Use "we" and "our" when referring to Wind Chasers

YOU HELP WITH:
• Pilot training courses and programs
• Enrollment requirements and processes
• Training costs and payment plans
• Career opportunities in aviation
• Aircraft fleet and facilities

Context from our knowledge base:
${context}

REMEMBER: You are chatting FROM the Wind Chasers website. Never tell users to go to a website they're already on. Be concise unless more detail is requested.`;

    // Get response from Claude
    console.log('Generating response from Claude...');
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: `${message}

[SYSTEM REMINDER: You are responding FROM the Wind Chasers website chat. Never tell the user to visit the website or go to any URL. They are already here. If you need to refer them somewhere, say "Would you like to schedule a call with our team?" instead.]`
        },
      ],
    });

    const rawResponse = response.content[0].type === 'text' ? response.content[0].text : 'Unable to generate response';
    
    // Remove any website referrals that slipped through
    let cleanedResponse = rawResponse
      .replace(/I'd recommend visiting (our|the) website at.*?for/gi, "I'd recommend reaching out to our team directly for")
      .replace(/visit(ing)? (our|the) website at.*?(\.|<)/gi, 'contact our team directly$3')
      .replace(/https?:\/\/windchasers\.in\/?/gi, '')
      .replace(/at https?:\/\/[^\s<]+/gi, '')
      .replace(/\(https?:\/\/[^)]+\)/gi, '')
      .replace(/check (our|the) website/gi, 'reach out to our team')
      .replace(/on (our|the) website/gi, 'with our team');
    
    // Parse markdown to HTML
    const formattedResponse = marked(cleanedResponse);

    console.log('Response generated successfully');

    res.json({
      response: formattedResponse,
      sources: relevantDocs.length > 0 ? relevantDocs.length : 0,
    });

  } catch (error) {
    console.error('Chat endpoint error:', error);
    res.status(500).json({ 
      error: 'Error processing your message',
      details: error.message 
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'Wind Chasers Website PROXe API' });
});

// Serve index.html for all other routes (SPA support)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Wind Chasers Website PROXe API running on port ${PORT}`);
  console.log(`📍 Local: http://localhost:${PORT}`);
  console.log(`📍 Network: http://192.168.1.4:${PORT}`);
  console.log(`✅ Health check: http://localhost:${PORT}/api/health`);
});