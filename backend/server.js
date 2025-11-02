import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import Anthropic from '@anthropic-ai/sdk';
import { marked } from 'marked';
import dotenv from 'dotenv';
import fs from 'fs';
import { getProxeSystemPrompt } from './prompts/proxe-prompt.js';
import { getWindChasersSystemPrompt } from './prompts/windchasers-prompt.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();

// CORS configuration
app.use(cors({
  origin: '*', // Allow all origins for development
  credentials: true
}));

app.use(express.json());

// IMPORTANT: Define routes BEFORE static middleware to ensure correct routing
// Serve windchasers-proxe.html page - must be before static middleware
app.get('/windchasers-proxe', (req, res) => {
  console.log('📍 Serving Wind Chasers page');
  const windchasersPath = path.join(__dirname, '../frontend/windchasers-proxe.html');
  console.log('   File path:', windchasersPath);
  // Disable caching for HTML files
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.sendFile(windchasersPath);
});

// Serve static files from frontend directory (CSS, JS, images, etc.)
// Add no-cache headers for widget JS files to prevent browser caching issues
app.use(express.static(path.join(__dirname, '../frontend'), {
  setHeaders: (res, path) => {
    // Disable caching for widget JS files
    if (path.endsWith('widget-proxe.js') || path.endsWith('widget-windchasers.js')) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
    }
  }
}));

// Initialize Supabase clients for different brands
// PROXe Supabase (for homepage chatbot)
const proxeSupabaseUrl = process.env.PROXE_SUPABASE_URL;
const proxeSupabaseKey = process.env.PROXE_SUPABASE_ANON_KEY;
const proxeSupabase = proxeSupabaseUrl && proxeSupabaseKey 
  ? createClient(proxeSupabaseUrl, proxeSupabaseKey)
  : null;

// Wind Chasers Supabase (for /windchasers-proxe page)
const windchasersSupabaseUrl = process.env.SUPABASE_URL || 'https://nfnwmkxgfgqgorwgonwf.supabase.co';
const windchasersSupabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5mbndta3hnZmdxZ29yd2dvbndmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwOTU4MTcsImV4cCI6MjA3NTY3MTgxN30.fTwOPszajAM_MhulX4cPGWzzYchfHMaBNkCs_6S4ZYQ';
const windchasersSupabase = createClient(windchasersSupabaseUrl, windchasersSupabaseKey);

// Test Supabase connections on startup - tests multiple tables
async function testSupabaseConnection(client, name, url) {
  try {
    // Try testing multiple tables to see what exists
    const tablesToTest = [
      'chatbot_responses',
      'system_prompts',
      'agents',
      'conversation_states',
      'cta_triggers',
      'model_context'
    ];
    
    let successfulTables = [];
    let failedTables = [];
    
    for (const table of tablesToTest) {
      try {
        const { data, error } = await Promise.race([
          client.from(table).select('count').limit(1),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Timeout')), 5000)
          )
        ]);
        
        if (error) {
          // Table doesn't exist or permission issue
          failedTables.push(table);
        } else {
          successfulTables.push(table);
        }
      } catch (err) {
        // Skip network errors for individual table tests
        if (err.message && err.message.includes('fetch failed')) {
          throw err; // Re-throw network errors to handle at top level
        }
        failedTables.push(table);
      }
    }
    
    if (successfulTables.length > 0) {
      console.log(`✅ ${name} Supabase: Connection successful`);
      console.log(`   Available tables: ${successfulTables.join(', ')}`);
      if (failedTables.length > 0) {
        console.log(`   Note: Some tables not found: ${failedTables.join(', ')}`);
      }
      return true;
    } else {
      console.warn(`⚠️ ${name} Supabase: No tables found. Tables may not be created yet.`);
      return false;
    }
  } catch (error) {
    console.warn(`⚠️ ${name} Supabase: Connection test failed - ${error.message}`);
    if (error.message && error.message.includes('fetch failed')) {
      console.warn(`   Check if URL is accessible: ${url}`);
      console.warn(`   Possible issues: Network error, project paused, or firewall blocking`);
      console.warn(`   The chatbot will continue but may not have access to knowledge base.`);
    }
    return false;
  }
}

console.log('Supabase clients initialized:');
console.log('- Wind Chasers Supabase URL:', windchasersSupabaseUrl);
console.log('- PROXe Supabase URL:', proxeSupabaseUrl || 'Not configured');

// Test connections asynchronously (don't block server startup)
if (windchasersSupabase) {
  testSupabaseConnection(windchasersSupabase, 'Wind Chasers', windchasersSupabaseUrl).catch(() => {});
}
if (proxeSupabase) {
  testSupabaseConnection(proxeSupabase, 'PROXe', proxeSupabaseUrl).catch(() => {});
}

// Initialize Claude API
const envPath = path.join(__dirname, '.env');
const envFileExists = fs.existsSync(envPath);

console.log('🔍 Environment Check:');
console.log('   .env file path:', envPath);
console.log('   .env file exists:', envFileExists ? 'Yes' : 'No');

const claudeApiKey = process.env.CLAUDE_API_KEY;
if (!claudeApiKey) {
  console.error('❌ ERROR: CLAUDE_API_KEY not found in environment variables!');
  console.error('   The chatbot will NOT be able to generate responses without this key');
  console.error('   Please add CLAUDE_API_KEY to backend/.env file');
  console.error('   Example: CLAUDE_API_KEY=sk-ant-api03-your-key-here');
} else {
  console.log('✅ CLAUDE_API_KEY found (length:', claudeApiKey.length, 'characters)');
}

const anthropic = claudeApiKey ? new Anthropic({
  apiKey: claudeApiKey,
}) : null;

// Configure marked for clean HTML output
marked.setOptions({
  breaks: true,
  gfm: true,
});

// Function to search ALL knowledge base tables in Supabase
// Pulls from: system_prompts, agents, conversation_states, cta_triggers, model_context, chatbot_responses
// Detects brand and uses appropriate Supabase client
async function searchKnowledgeBase(query, brand = 'proxe', limit = 3) {
  try {
    // Determine which Supabase client to use
    let supabaseClient;
    
    if (brand === 'proxe' || brand === 'PROXe') {
      // PROXe chatbot (homepage) - use PROXe Supabase
      supabaseClient = proxeSupabase;
      
      if (!supabaseClient) {
        console.warn('⚠️ PROXe Supabase not configured. Set PROXE_SUPABASE_URL and PROXE_SUPABASE_ANON_KEY');
        return [];
      }
    } else {
      // Wind Chasers chatbot (/windchasers-proxe page) - use Wind Chasers Supabase
      supabaseClient = windchasersSupabase;
      
      if (!supabaseClient) {
        console.warn('⚠️ Wind Chasers Supabase not configured. Set SUPABASE_URL and SUPABASE_ANON_KEY');
        return [];
      }
    }
    
    console.log(`[${brand}] Searching ALL knowledge base tables for: "${query}"`);
    console.log(`[${brand}] Using Supabase URL: ${brand === 'proxe' ? proxeSupabaseUrl : windchasersSupabaseUrl}`);
    
    // Helper function to safely query a table with timeout
    const safeQuery = async (table, filters, timeout = 5000) => {
      try {
        const result = await Promise.race([
          supabaseClient.from(table).select('*').match(filters),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error(`Query timeout for ${table}`)), timeout)
          )
        ]);
        
        if (result.error) {
          console.warn(`[${brand}] Error querying ${table}:`, result.error.message);
          return [];
        }
        return result.data || [];
      } catch (error) {
        if (error.message && error.message.includes('fetch failed')) {
          throw error; // Re-throw network errors
        }
        console.warn(`[${brand}] Query error for ${table}:`, error.message);
        return [];
      }
    };
    
    // Helper function to search with ilike across multiple columns
    const searchTable = async (table, columns, searchTerm, perColumnLimit = 2) => {
      const allResults = [];
      
      for (const column of columns) {
        try {
          const result = await Promise.race([
            supabaseClient
              .from(table)
              .select('*')
              .eq('brand', brand.toLowerCase())
              .ilike(column, `%${searchTerm}%`)
              .limit(perColumnLimit),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error(`Timeout`)), 5000)
            )
          ]);
          
          if (!result.error && result.data) {
            allResults.push(...result.data);
          }
        } catch (error) {
          if (error.message && error.message.includes('fetch failed')) {
            throw error;
          }
          // Continue with other columns
        }
      }
      
      // Remove duplicates by id
      const uniqueResults = Array.from(new Map(allResults.map(item => [item.id, item])).values());
      return uniqueResults;
    };
    
    const allResults = [];
    
    try {
      // Query all tables in parallel where possible
      const queryPromises = [
        // 1. system_prompts - search in content, title, description
        searchTable('system_prompts', ['content', 'title', 'description'], query, 2).catch(() => []),
        
        // 2. agents - search in agent_name, what_it_does, pain_point_mapped_to
        searchTable('agents', ['agent_name', 'what_it_does', 'pain_point_mapped_to'], query, 2).catch(() => []),
        
        // 3. conversation_states - search in state_name, description
        searchTable('conversation_states', ['state_name', 'description', 'notes'], query, 2).catch(() => []),
        
        // 4. cta_triggers - search in cta_text, trigger_condition, use_case
        searchTable('cta_triggers', ['cta_text', 'trigger_condition', 'use_case'], query, 2).catch(() => []),
        
        // 5. model_context - search in key, value, category
        searchTable('model_context', ['key', 'value', 'category'], query, 3).catch(() => []),
        
        // 6. chatbot_responses - existing logic (multiple columns)
        (async () => {
          try {
            const columns = ['question', 'query', 'user_message', 'keywords'];
            return await searchTable('chatbot_responses', columns, query, 2);
          } catch {
            return [];
          }
        })()
      ];
      
      const results = await Promise.allSettled(queryPromises);
      
      // Process results from each table
      results.forEach((result, index) => {
        const tableNames = ['system_prompts', 'agents', 'conversation_states', 'cta_triggers', 'model_context', 'chatbot_responses'];
        
        if (result.status === 'fulfilled' && result.value && Array.isArray(result.value)) {
          result.value.forEach(item => {
            let content = '';
            let metadata = { table: tableNames[index], brand: item.brand || brand };
            
            // Format content based on table type
            switch (tableNames[index]) {
              case 'system_prompts':
                content = `${item.title || item.prompt_type || 'System Prompt'}: ${item.content}`;
                metadata.prompt_type = item.prompt_type;
                metadata.version = item.version;
                break;
                
              case 'agents':
                content = `Agent: ${item.agent_name}\nWhat it does: ${item.what_it_does || ''}\n${item.trenches_energy ? `Trenches energy: ${item.trenches_energy}\n` : ''}${item.amplification_energy ? `Amplification: ${item.amplification_energy}\n` : ''}${item.real_example ? `Example: ${item.real_example}\n` : ''}${item.results ? `Results: ${item.results}` : ''}`;
                metadata.agent_key = item.agent_key;
                metadata.pain_point = item.pain_point_mapped_to;
                break;
                
              case 'conversation_states':
                content = `State: ${item.state_name} (${item.state_key})\n${item.description || ''}\n${item.notes ? `Notes: ${item.notes}` : ''}`;
                metadata.state_key = item.state_key;
                metadata.qualification_level = item.qualification_level;
                break;
                
              case 'cta_triggers':
                content = `CTA: ${item.cta_text}\nTrigger: ${item.trigger_condition}\n${item.use_case ? `Use case: ${item.use_case}` : ''}`;
                metadata.trigger_condition = item.trigger_condition;
                metadata.qualification_level = item.qualification_level;
                break;
                
              case 'model_context':
                content = `[${item.category}] ${item.key}: ${item.value}`;
                metadata.category = item.category;
                metadata.key = item.key;
                break;
                
              case 'chatbot_responses':
                content = item.response || item.answer || item.content || item.reply || '';
                metadata.question = item.question || item.query || item.user_message || '';
                metadata.keywords = item.keywords || '';
                break;
            }
            
            if (content.trim()) {
              allResults.push({
                id: item.id,
                content: content.trim(),
                metadata
              });
            }
          });
        }
      });
      
      // Sort by relevance (could be improved with better scoring)
      // For now, prioritize system_prompts and agents
      const sortedResults = allResults.sort((a, b) => {
        const priorityOrder = { 'system_prompts': 3, 'agents': 2, 'conversation_states': 1, 'cta_triggers': 1, 'model_context': 0, 'chatbot_responses': 1 };
        return (priorityOrder[b.metadata.table] || 0) - (priorityOrder[a.metadata.table] || 0);
      });
      
      // Limit results
      const formattedData = sortedResults.slice(0, limit * 3); // Get more from all sources
      
      console.log(`[${brand}] Found ${formattedData.length} results from ${new Set(formattedData.map(r => r.metadata.table)).size} tables`);
      return formattedData;
      
    } catch (error) {
      // Handle network errors
      if (error.message && (error.message.includes('fetch failed') || error.message.includes('network'))) {
        console.warn(`[${brand}] Network error detected. Skipping knowledge base search.`);
        return [];
      }
      throw error;
    }
  } catch (error) {
    console.error(`[${brand}] Error searching knowledge base:`, error);
    console.error(`[${brand}] Error details:`, {
      message: error.message,
      cause: error.cause,
      name: error.name,
      stack: error.stack?.split('\n').slice(0, 5).join('\n')
    });
    
    // Check if it's a fetch/network error
    if (error.message && (error.message.includes('fetch failed') || error.message.includes('network'))) {
      const supabaseUrl = brand === 'proxe' ? proxeSupabaseUrl : windchasersSupabaseUrl;
      console.error(`[${brand}] Network error detected. Possible issues:`);
      console.error(`  - Supabase URL: ${supabaseUrl || 'NOT SET'}`);
      console.error(`  - Check if URL is accessible`);
      console.error(`  - Check if Supabase project is active`);
      console.error(`  - Check network connection`);
      console.error(`  - Check firewall/proxy settings`);
    }
    
    return [];
  }
}

async function generateFollowUpSuggestion(userMessage, assistantMessage, messageCount = 0, brand = 'proxe') {
  try {
    const lowerResponse = assistantMessage.toLowerCase();
    const lowerQuestion = userMessage.toLowerCase();
    const normalizedBrand = (brand || 'proxe').toLowerCase();
    
    // Brand-specific follow-up logic
    if (normalizedBrand === 'windchasers') {
      // Wind Chasers specific follow-up suggestions
      // After first response, always suggest "Choose Your Program"
      if (messageCount === 1) {
        return 'Choose Your Program 📚'; // Special marker for program selection
      }
      
      // Check if user selected a program (their message matches a program name)
      const programNames = [
        'dgca ground classes',
        'ppl',
        'private pilot license',
        'cpl',
        'commercial pilot license',
        'atpl',
        'airline transport pilot license',
        'ir',
        'instrument rating',
        'me',
        'multi-engine rating',
        'cfi',
        'certified flight instructor',
        'cabin crew training',
        'cabin crew',
        'international flight schools',
        'international pilot training',
        'type rating programs',
        'type rating',
        'helicopter training',
        'helicopter'
      ];
      
      const isProgramSelection = programNames.some(program => 
        lowerQuestion.includes(program)
      );
      
      // Check if program details were shared (response contains program-specific information)
      const programDetailIndicators = [
        'cost', 'fee', 'price', 'duration', 'eligibility', 'requirement', 
        'certificate', 'license', 'training', 'course', 'program details',
        'age', 'medical', 'duration', 'months', 'weeks', 'hours'
      ];
      const hasProgramDetails = programDetailIndicators.some(indicator => 
        lowerResponse.includes(indicator)
      );
      
      // If user asked about a program and we shared details, show "I am ready to enroll"
      if (isProgramSelection && hasProgramDetails && messageCount > 1) {
        return 'I am ready to enroll 🎓';
      }
      
      // If user selected a program but no details yet, suggest scheduling a call
      if (isProgramSelection && !hasProgramDetails && messageCount > 1) {
        return 'Schedule Admissions Call 📞';
      }
      
      // Skip if the follow-up would be repetitive
      if (lowerQuestion.includes('program') && lowerResponse.includes('program') && !isProgramSelection) {
        return null;
      }
      if (lowerQuestion.includes('training') && lowerResponse.includes('training') && !isProgramSelection) {
        return null;
      }
      if (lowerQuestion.includes('eligibility') && lowerResponse.includes('eligibility')) {
        return null;
      }
    } else {
      // PROXe specific follow-up suggestions
      // Detect if booking/demo was already suggested or discussed
      const bookingKeywords = ['demo', 'call', 'book', 'schedule', '15-minute', '15 minute'];
      const hasBookingMention = bookingKeywords.some(keyword => lowerResponse.includes(keyword));
      
      // If booking was already suggested, don't suggest again
      if (hasBookingMention && messageCount > 2) {
        return null;
      }
      
      // After discussing features/benefits, suggest booking
      if (messageCount >= 2 && !hasBookingMention) {
        const featureKeywords = ['agent', 'whatsapp', 'content', 'website', 'engine', 'handles', 'works'];
        const hasFeatureDiscussion = featureKeywords.some(keyword => lowerResponse.includes(keyword));
        if (hasFeatureDiscussion) {
          return 'Book a Demo 🚀';
        }
      }
    }
    
    // Brand-specific system prompt for Claude
    const brandPrompt = normalizedBrand === 'proxe' 
      ? `You create one short, direct follow-up call-to-action label for the PROXe chatbot.

PROXe is an AI Operating System for business. It automates 24/7 customer interactions (WhatsApp, website, calls, content, dashboard). Users are Indian SMB owners (₹1-10Cr revenue) drowning in repetitive work.

TONE & STYLE:
- Direct. No corporate speak. Real talk.
- Built from trenches. "I've lived this problem" energy.
- Human × AI. Not hype. Practical.
- Action-focused. What's the next real step?

IMPORTANT RULES:
- 3-7 words. Title case. Optional emoji (use sparingly, only if it adds clarity).
- NEVER repeat what was just explained
- NEVER suggest something they already understood
- NEVER use: "Learn more", "Explore", "Discover", "Innovative", "Revolutionary"
- NEVER suggest "sign up" or "join" - we book demos, not memberships

CONTEXT-SPECIFIC CTAs:

If the conversation covered:
- The problem (drowning, losing leads, burned out) → "See How This Fixes It"
- How agents work (technical explanation) → "How Much Would This Help?"
- Pricing or cost → "One Demo. Then Decide."
- Who it's for (ICP match) → "Book A 15-Minute Call"
- Objections (too expensive, lose human touch) → "Show Me The ROI"
- They're clearly ready (buying signals) → "Let's Get Started"
- Multiple agents explained → "Which Agent Matters Most?"
- Content creation specifically → "See Content In Action"
- WhatsApp/messages specifically → "Show Me WhatsApp Handling"
- Lead capture/conversion → "See Live Lead Capture"
- Edge case or unclear → SKIP

EXAMPLES OF GOOD CTAs:
- "Here's The Real Math"
- "Show Me It Working"
- "What's Your Biggest Pain?"
- "Book A Quick Demo"
- "One Deal Pays For This"
- "See Your ROI"
- "Ready To Get Back Time?"

EXAMPLES OF BAD CTAs (NEVER USE):
- "Learn More" (too generic)
- "Explore Our Solution" (corporate speak)
- "Sign Up Today" (we don't sell memberships)
- "Get Your Free Trial" (we do demos)
- "Choose Your Plan" (premature)
- "Schedule A Call" (too formal, use "book" not "schedule")

FINAL RULE:
- If no relevant follow-up is appropriate or context doesn't warrant action, respond with only: SKIP
- Output ONLY the label text. No quotes. No explanation.`
      : `You create one short follow-up call-to-action label for Wind Chasers chatbot button.

Wind Chasers is an aviation training academy. Users are prospective pilots.

IMPORTANT RULES:
- Keep it encouraging, specific to the conversation, and 3-7 words
- Use title case and you may add one emoji at the start if it feels natural
- NEVER repeat what the user just asked or what was just explained
- If the response already covered programs/courses/training, do NOT suggest asking about programs/courses/training again
- If the user asked about programs and we explained them, suggest they tell us which program interests them
- If no relevant follow-up is appropriate or it would be repetitive, respond with the single word SKIP
- Output only the label text without quotation marks.`;
    
    const followUpResponse = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 60,
      system: brandPrompt,
      messages: [
        {
          role: 'user',
          content: `Here is the user's latest question:\n${userMessage}\n\nHere is the assistant's reply:\n${assistantMessage}\n\nProvide a single follow-up button label that would help continue the conversation. Make sure it's NOT repetitive of what was just discussed.`,
        },
      ],
    });

    const suggestion = followUpResponse?.content?.[0]?.type === 'text'
      ? followUpResponse.content[0].text.trim()
      : '';

    const normalized = suggestion
      .split('\n')
      .map(part => part.trim())
      .filter(Boolean)[0] || '';

    if (!normalized || normalized.toUpperCase() === 'SKIP') {
      return null;
    }

    return normalized.replace(/["']/g, '').trim();
  } catch (error) {
    console.error('Follow-up generation error:', error);
    return null;
  }
}

// Chat endpoint
app.post('/api/chat', async (req, res) => {
  try {
    let { message, messageCount = 0, userName, userPhone, conversationState = 'cold', painPoint, brand = 'proxe' } = req.body;

    // Handle empty messages when collecting user info (state updates)
    // If we have userName or userPhone but no message, this is a state update
    const isStateUpdate = (!message || message.trim() === '') && (userName || userPhone);
    
    if (!message || message.trim() === '') {
      if (isStateUpdate) {
        // Allow empty messages for state updates (name/phone collection)
        // Use a default message that will trigger appropriate response
        message = userName && !userPhone 
          ? 'Thanks for providing your name.' 
          : userName && userPhone 
          ? 'Thanks for providing your information.'
          : 'Continue conversation.';
      } else {
        return res.status(400).json({ error: 'Message is required' });
      }
    }

    // Normalize brand to lowercase
    const normalizedBrand = (brand || 'proxe').toLowerCase();
    
    console.log(`\n🔍 [${normalizedBrand.toUpperCase()}] Request received:`);
    console.log(`   Brand: ${normalizedBrand} (from frontend: ${brand})`);
    console.log(`   Message: ${message}`);
    console.log(`   Conversation state: ${conversationState}`);
    console.log(`   User name: ${userName || 'none'}`);
    console.log(`   User phone: ${userPhone || 'none'}`);
    console.log(`   Pain point: ${painPoint || 'none'}`);

    // Search knowledge base - uses appropriate Supabase based on brand
    // Skip knowledge base search for state updates (empty messages with user info)
    let relevantDocs = [];
    if (!isStateUpdate) {
      console.log(`   Searching knowledge base for brand: ${normalizedBrand}...`);
      relevantDocs = await searchKnowledgeBase(message, normalizedBrand, 3);
    } else {
      console.log(`   Skipping knowledge base search (state update)`);
    }
    
    console.log(`   Found ${relevantDocs.length} relevant results from knowledge base tables (${normalizedBrand === 'proxe' ? 'PROXe' : 'Wind Chasers'} Supabase)`);

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

    // Get brand-specific system prompt from separate prompt files
    let systemPrompt;
    
    if (normalizedBrand === 'proxe') {
      systemPrompt = getProxeSystemPrompt(context, conversationState, userName, userPhone, painPoint, messageCount);
    } else {
      systemPrompt = getWindChasersSystemPrompt(context, conversationState, userName, userPhone, painPoint);
    }

    // Get response from Claude
    if (!anthropic) {
      throw new Error('CLAUDE_API_KEY is not configured. Please set CLAUDE_API_KEY in your environment variables.');
    }
    
    console.log('Generating response from Claude...');
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: `${message}

[SYSTEM REMINDER: 
- Current state: ${conversationState}
- ${userName ? `Address them as ${userName}` : 'Ask for their name if you haven\'t collected it yet'}
- ${painPoint ? `Reference their pain point: ${painPoint}` : 'Identify their pain point'}
- Use one of the two pillars (Trenches OR Human × AI) in your response
- Never tell them to visit a website - they're already here
- If they're ready, suggest a 15-minute demo call]`
        },
      ],
    });

    const rawResponse = response.content[0].type === 'text' ? response.content[0].text : 'Unable to generate response';
    
    // Remove any greetings and website referrals that slipped through
    let cleanedResponse = rawResponse
      .replace(/^(Hi there!|Hello!|Hey!|Hi!)\s*/gi, '') // Remove greetings at the start
      .replace(/^(Hi|Hello|Hey),?\s*/gi, '') // Remove simple greetings at the start
      .replace(/I'd recommend visiting (our|the) website at.*?for/gi, "I'd recommend reaching out to our team directly for")
      .replace(/visit(ing)? (our|the) website at.*?(\.|<)/gi, 'contact our team directly$3')
      .replace(/https?:\/\/windchasers\.in\/?/gi, '')
      .replace(/at https?:\/\/[^\s<]+/gi, '')
      .replace(/\(https?:\/\/[^)]+\)/gi, '')
      .replace(/check (our|the) website/gi, 'reach out to our team')
      .replace(/on (our|the) website/gi, 'with our team')
      .trim(); // Remove leading/trailing whitespace after greeting removal
    
    // Keep response as plain markdown for streaming
    const followUpSuggestion = await generateFollowUpSuggestion(
      message, 
      rawResponse, 
      messageCount,
      normalizedBrand
    );

    console.log('Response generated successfully');

    // Detect if we should collect name/phone
    const shouldCollectName = conversationState === 'cold' && !userName && messageCount >= 1;
    const shouldCollectPhone = conversationState === 'cold' && userName && !userPhone;
    
    // Detect buying signals
    const buyingSignals = [
      'how do we start', 'what\'s next', 'i want to try', 'can you set up', 'when can we get started',
      'how do i sign up', 'let\'s do this', 'sounds good', 'i\'m ready', 'book a call', 'schedule a call',
      'when can we', 'how do we', 'i\'d like to'
    ];
    const detectedBuyingSignal = buyingSignals.some(signal => message.toLowerCase().includes(signal));
    const newState = detectedBuyingSignal ? 'ready_to_book' : (userName && userPhone ? 'qualified' : conversationState);

    res.json({
      response: cleanedResponse,
      sources: relevantDocs.length > 0 ? relevantDocs.length : 0,
      followUp: followUpSuggestion,
      shouldCollectName: shouldCollectName,
      shouldCollectPhone: shouldCollectPhone,
      conversationState: newState,
      suggestBooking: detectedBuyingSignal || (messageCount >= 3 && conversationState === 'qualified'),
    });

  } catch (error) {
    console.error('\n❌ Chat endpoint error:', error);
    console.error('Error stack:', error.stack);
    
    // Provide more specific error messages
    let errorMessage = 'Error processing your message';
    let errorDetails = error.message;
    
    // Check for specific error types
    if (error.message && error.message.includes('CLAUDE_API_KEY')) {
      errorMessage = 'Configuration error: Claude API key is missing or invalid';
      console.error('⚠️  Missing CLAUDE_API_KEY in environment variables');
    } else if (error.message && error.message.includes('429')) {
      errorMessage = 'Rate limit exceeded. Please try again in a moment.';
      errorDetails = 'Too many requests to Claude API';
    } else if (error.message && error.message.includes('401')) {
      errorMessage = 'Authentication error with AI service';
      errorDetails = 'Invalid API credentials';
    } else if (error.message && error.message.includes('fetch failed')) {
      errorMessage = 'Unable to connect to knowledge base or AI service';
      errorDetails = 'Network or service connection error';
    } else if (error.message && error.message.includes('timeout')) {
      errorMessage = 'Request timed out. Please try again.';
      errorDetails = 'Service timeout';
    }
    
    console.error(`   Error message: ${errorMessage}`);
    console.error(`   Error details: ${errorDetails}`);
    
    res.status(500).json({ 
      error: errorMessage,
      details: errorDetails 
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'PROXe Chatbot API' });
});

// Serve index.html for all other routes (SPA support)
// Note: /windchasers-proxe route is defined above before static middleware
app.get('*', (req, res) => {
  // Skip if already handled or if it's an API route
  if (req.path.startsWith('/api') || req.path.startsWith('/windchasers-proxe')) {
    return;
  }
  console.log('📍 Serving PROXe page:', req.path);
  const indexPath = path.join(__dirname, '../frontend/index.html');
  console.log('   File path:', indexPath);
  // Disable caching for HTML files
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.sendFile(indexPath);
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 PROXe Chatbot API running on port ${PORT}`);
  console.log(`📍 Local: http://localhost:${PORT}`);
  console.log(`📍 Network: http://192.168.1.4:${PORT}`);
  console.log(`✅ Health check: http://localhost:${PORT}/api/health`);
});