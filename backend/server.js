import express from 'express';
import cors from 'cors';
import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js';
import { marked } from 'marked';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Initialize Supabase
const supabaseUrl = process.env.SUPABASE_URL || 'https://nfnwmkxgfgqgorwgonwf.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5mbndta3hnZmdxZ29yd2dvbndmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwOTU4MTcsImV4cCI6MjA3NTY3MTgxN30.fTwOPszajAM_MhulX4cPGWzzYchfHMaBNkCs_6S4ZYQ';
const supabase = createClient(supabaseUrl, supabaseKey);

// Initialize Claude API
const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY,
});

console.log('🔑 Claude API Key status:', process.env.CLAUDE_API_KEY ? '✅ Loaded' : '❌ Missing');

// Configure marked for clean HTML output
marked.setOptions({
  breaks: true,
  gfm: true,
});

// Chat endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || message.trim() === '') {
      return res.status(400).json({ error: 'Message is required' });
    }

    console.log('👤 User message:', message);

    // Search Supabase for relevant data
    console.log('🔍 Searching knowledge base...');
    const { data: docs, error: searchError } = await supabase
      .from('documents')
      .select('content')
      .limit(5);

    if (searchError) {
      console.error('Search error:', searchError);
    }

    let context = '';
    if (docs && docs.length > 0) {
      context = '\n\nContext from knowledge base:\n';
      docs.forEach((doc, index) => {
        context += `${index + 1}. ${doc.content}\n`;
      });
    }

    // Create system prompt with context
    const systemPrompt = `You are a helpful customer support assistant for Wind Chasers Aviation Academy (https://windchasers.in/). 
You are embedded on their website to help students in real-time.
You help students with information about pilot training, courses, costs, enrollment, and career guidance.
Keep responses SHORT and TO THE POINT, structure it properly with bullets and numbers with heading subheading etc
Only use the information provided in the knowledge base. Don't speculate or add details you're unsure about.
If information is missing or unclear, ask the user for clarification or offer to connect them with the admissions team.
Use formatting like **bold** or *italics* only when necessary.
${context}`;

    // Get response from Claude
    console.log('🤖 Generating response from Claude...');
    const response = await anthropic.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 1024,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: message,
        },
      ],
    });

    const rawResponse = response.content[0].type === 'text' ? response.content[0].text : 'Unable to generate response';
    
    // Parse markdown to HTML
    const formattedResponse = marked(rawResponse);

    console.log('✅ Response generated successfully');

    res.json({
      response: formattedResponse,
      raw: rawResponse,
      sources: docs ? docs.length : 0,
    });

  } catch (error) {
    console.error('❌ Chat endpoint error:', error.message);
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

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Wind Chasers Website PROXe API running on port ${PORT}`);
  console.log(`📍 http://localhost:${PORT}`);
  console.log(`✅ Health check: http://localhost:${PORT}/api/health`);
});