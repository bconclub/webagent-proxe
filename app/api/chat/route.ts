import { NextRequest } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js';
import { getBrandConfig } from '@/src/configs';
import { buildPrompt } from '@/src/lib/promptBuilder';
import { addUserInput, upsertSummary, checkExistingBooking } from '@/src/lib/chatSessions';

export const runtime = 'nodejs'; // Use Node.js runtime for streaming support

// Initialize Supabase clients
const proxeSupabaseUrl = process.env.PROXE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const proxeSupabaseKey = process.env.PROXE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const proxeSupabase = proxeSupabaseUrl && proxeSupabaseKey
  ? createClient(proxeSupabaseUrl, proxeSupabaseKey)
  : null;

const windchasersSupabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://nfnwmkxgfgqgorwgonwf.supabase.co';
const windchasersSupabaseKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5mbndta3hnZmdxZ29yd2dvbndmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwOTU4MTcsImV4cCI6MjA3NTY3MTgxN30.fTwOPszajAM_MhulX4cPGWzzYchfHMaBNkCs_6S4ZYQ';
const windchasersSupabase = createClient(windchasersSupabaseUrl, windchasersSupabaseKey);

// Initialize Claude API
const claudeApiKey = process.env.CLAUDE_API_KEY;

console.log('[Chat API] Initializing Claude API:', {
  hasApiKey: Boolean(claudeApiKey),
  apiKeyPrefix: claudeApiKey ? claudeApiKey.substring(0, 10) + '...' : 'none',
  apiKeyLength: claudeApiKey?.length || 0,
});

const anthropic = claudeApiKey ? new Anthropic({ apiKey: claudeApiKey }) : null;

// Search knowledge base
async function searchKnowledgeBase(query: string, brand: string = 'proxe', limit: number = 3) {
  try {
    let supabaseClient;
    
    if (brand === 'proxe' || brand === 'PROXe') {
      supabaseClient = proxeSupabase;
      if (!supabaseClient) {
        return [];
      }
    } else {
      supabaseClient = windchasersSupabase;
      if (!supabaseClient) {
        return [];
      }
    }

    const searchTable = async (table: string, columns: string[], searchTerm: string, perColumnLimit: number = 2) => {
      const allResults = [];
      for (const column of columns) {
        try {
          const result = await Promise.race([
            supabaseClient!.from(table)
              .select('*')
              .eq('brand', brand.toLowerCase())
              .ilike(column, `%${searchTerm}%`)
              .limit(perColumnLimit),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000))
          ]) as any;
          
          if (!result.error && result.data) {
            allResults.push(...result.data);
          }
        } catch (error) {
          // Continue with other columns
        }
      }
      return Array.from(new Map(allResults.map((item: any) => [item.id, item])).values());
    };

    const queryPromises = [
      searchTable('system_prompts', ['content', 'title', 'description'], query, 2).catch(() => []),
      searchTable('agents', ['agent_name', 'what_it_does', 'pain_point_mapped_to'], query, 2).catch(() => []),
      searchTable('conversation_states', ['state_name', 'description', 'notes'], query, 2).catch(() => []),
      searchTable('cta_triggers', ['cta_text', 'trigger_condition', 'use_case'], query, 2).catch(() => []),
      searchTable('model_context', ['key', 'value', 'category'], query, 3).catch(() => []),
      searchTable('chatbot_responses', ['question', 'query', 'user_message', 'keywords'], query, 2).catch(() => [])
    ];

    const results = await Promise.allSettled(queryPromises);
    const allResults: any[] = [];
    const tableNames = ['system_prompts', 'agents', 'conversation_states', 'cta_triggers', 'model_context', 'chatbot_responses'];

    results.forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value && Array.isArray(result.value)) {
        result.value.forEach((item: any) => {
          let content = '';
          const metadata: any = { table: tableNames[index], brand: item.brand || brand };

          switch (tableNames[index]) {
            case 'system_prompts':
              content = `${item.title || item.prompt_type || 'System Prompt'}: ${item.content}`;
              break;
            case 'agents':
              content = `Agent: ${item.agent_name}\nWhat it does: ${item.what_it_does || ''}`;
              break;
            case 'conversation_states':
              content = `State: ${item.state_name} (${item.state_key})\n${item.description || ''}`;
              break;
            case 'cta_triggers':
              content = `CTA: ${item.cta_text}\nTrigger: ${item.trigger_condition}`;
              break;
            case 'model_context':
              content = `[${item.category}] ${item.key}: ${item.value}`;
              break;
            case 'chatbot_responses':
              content = item.response || item.answer || item.content || '';
              break;
          }

          if (content.trim()) {
            allResults.push({ id: item.id, content: content.trim(), metadata });
          }
        });
      }
    });

    const priorityOrder: Record<string, number> = { 'system_prompts': 3, 'agents': 2, 'conversation_states': 1, 'cta_triggers': 1, 'model_context': 0, 'chatbot_responses': 1 };
    const sortedResults = allResults.sort((a, b) => (priorityOrder[b.metadata.table] || 0) - (priorityOrder[a.metadata.table] || 0));
    
    return sortedResults.slice(0, limit * 3);
  } catch (error) {
    return [];
  }
}

// Generate follow-up suggestion
async function generateFollowUpSuggestion(userMessage: string, assistantMessage: string, messageCount: number = 0, brand: string = 'proxe') {
  if (anthropic) {
    return await generateFollowUpWithClaude(userMessage, assistantMessage, messageCount, brand);
  }
  return null;
}

// Generate follow-up with Claude
async function generateFollowUpWithClaude(userMessage: string, assistantMessage: string, messageCount: number = 0, brand: string = 'proxe') {
  if (!anthropic) return null;

  try {
    const normalizedBrand = (brand || 'proxe').toLowerCase();
    const lowerMessage = userMessage.toLowerCase();
    const lowerResponse = assistantMessage.toLowerCase();

    // PROXe specific logic
    if (normalizedBrand === 'proxe') {
      const bookingKeywords = ['demo', 'call', 'book', 'schedule', '15-minute', '15 minute'];
      const hasBookingMention = bookingKeywords.some(keyword => lowerResponse.includes(keyword));
      
      if (hasBookingMention && messageCount > 2) {
        return null;
      }

      if (messageCount >= 2 && !hasBookingMention) {
        const featureKeywords = ['agent', 'whatsapp', 'content', 'website', 'engine', 'handles', 'works'];
        const hasFeatureDiscussion = featureKeywords.some(keyword => lowerResponse.includes(keyword));
        if (hasFeatureDiscussion) {
          return 'Book a Demo 🚀';
        }
      }
    }

    const brandPrompt = normalizedBrand === 'proxe'
      ? `You create one short, direct follow-up call-to-action label for the PROXe chatbot.

PROXe is an AI Operating System for business. It automates 24/7 customer interactions (WhatsApp, website, calls, content, dashboard). Users are Indian SMB owners (₹1-10Cr revenue) drowning in repetitive work.

AVAILABLE ACTIONS (you can reference these or create contextual variations):
- Deploy PROXe
- Book PROXe Demo
- Industries Served
- Get PROXe Pricing
- Schedule a Call

TONE & STYLE:
- Direct. No corporate speak. Real talk.
- Built from trenches. "I've lived this problem" energy.
- Human × AI. Not hype. Practical.
- Action-focused. What's the next real step?

IMPORTANT RULES:
- 3-7 words. Title case. Optional emoji (use sparingly, only if it adds clarity).
- Prefer to align with the available actions above, but adapt wording to context
- NEVER repeat what was just explained
- NEVER suggest something they already understood
- NEVER use: "Learn more", "Explore", "Discover", "Innovative", "Revolutionary"
- NEVER suggest "sign up" or "join" - we book demos, not memberships

If no relevant follow-up is appropriate or context doesn't warrant action, respond with only: SKIP
Output ONLY the label text. No quotes. No explanation.`
      : `You create one short follow-up call-to-action label for Wind Chasers chatbot button.

Wind Chasers is an aviation training academy. Users are prospective pilots.

IMPORTANT RULES:
- Keep it encouraging, specific to the conversation, and 3-7 words
- Use title case and you may add one emoji at the start if it feels natural
- NEVER repeat what the user just asked or what was just explained
- If no relevant follow-up is appropriate or it would be repetitive, respond with the single word SKIP
- Output only the label text without quotation marks.`;

    // Use environment variable for model, fallback to claude-haiku-4-5-20251001
    const model = process.env.CLAUDE_MODEL || 'claude-haiku-4-5-20251001';
    
    const followUpResponse = await anthropic.messages.create({
      model: model,
      max_tokens: 60,
      system: brandPrompt,
      messages: [{
        role: 'user',
        content: `Here is the user's latest question:\n${userMessage}\n\nHere is the assistant's reply:\n${assistantMessage}\n\nProvide a single follow-up button label that would help continue the conversation. Make sure it's NOT repetitive of what was just discussed.`,
      }],
    });

    const suggestion = followUpResponse?.content?.[0]?.type === 'text'
      ? followUpResponse.content[0].text.trim()
      : '';

    const normalized = suggestion.split('\n').map(part => part.trim()).filter(Boolean)[0] || '';

    if (!normalized || normalized.toUpperCase() === 'SKIP') {
      return null;
    }

    return normalized.replace(/["']/g, '').trim();
  } catch (error) {
    return null;
  }
}

// Helper function to check if two buttons are similar (e.g., "Book a Call" vs "Schedule a Call")
function areSimilarBookingButtons(button1: string, button2: string): boolean {
  const lower1 = button1.toLowerCase().trim();
  const lower2 = button2.toLowerCase().trim();
  
  // Exact match
  if (lower1 === lower2) return true;
  
  // Check if both contain booking-related keywords
  const bookingKeywords = ['call', 'demo', 'book', 'schedule', 'meeting', 'appointment'];
  const hasBooking1 = bookingKeywords.some(keyword => lower1.includes(keyword));
  const hasBooking2 = bookingKeywords.some(keyword => lower2.includes(keyword));
  
  // If both are booking-related, they're similar
  if (hasBooking1 && hasBooking2) {
    // Check if they have the same core action (call or demo)
    const hasCall1 = lower1.includes('call');
    const hasCall2 = lower2.includes('call');
    const hasDemo1 = lower1.includes('demo');
    const hasDemo2 = lower2.includes('demo');
    
    // If both mention "call" or both mention "demo", they're similar
    if ((hasCall1 && hasCall2) || (hasDemo1 && hasDemo2)) {
      return true;
    }
  }
  
  return false;
}

// Helper function to check if a button is similar to any in a list
function isSimilarToAny(newButton: string, existingButtons: string[]): boolean {
  return existingButtons.some(existing => areSimilarBookingButtons(newButton, existing));
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    let { message, messageCount = 0, brand = 'proxe', usedButtons = [], metadata = {} } = body;

    const sessionMetadata = metadata.session || {};
    const memoryMetadata = metadata.memory || {};
    const userProfile = sessionMetadata.user || {};
    const externalSessionId = sessionMetadata.externalId || sessionMetadata.externalSessionId || sessionMetadata.sessionId || null;
    const summary: string = typeof memoryMetadata.summary === 'string' ? memoryMetadata.summary : '';
    const recentHistory: { role: 'user' | 'assistant'; content: string }[] = Array.isArray(memoryMetadata.recentHistory)
      ? memoryMetadata.recentHistory
          .filter(
            (entry: any) =>
              entry &&
              (entry.role === 'user' || entry.role === 'assistant') &&
              typeof entry.content === 'string'
          )
          .map((entry: any) => ({
            role: entry.role,
            content: entry.content,
          }))
      : [];

    if (!message || message.trim() === '') {
      return Response.json({ error: 'Message is required' }, { status: 400 });
    }

    // Save user input to web_sessions (async, don't wait)
    if (externalSessionId) {
      addUserInput(externalSessionId, message, undefined, brand as 'proxe' | 'windchasers').catch(err => {
        console.error('[Chat API] Failed to save user input:', err);
      });
    }

    // Check if booking is already scheduled
    const isBookingAlreadyScheduled = message.includes('[Booking already scheduled]');
    if (isBookingAlreadyScheduled) {
      // Remove the prefix for processing
      message = message.replace('[Booking already scheduled]', '').trim();
    }

    // Check if we have any AI provider available
    if (!anthropic) {
      return Response.json(
        { 
          error: 'No AI provider configured. Please set CLAUDE_API_KEY in environment variables.' 
        },
        { status: 500 }
      );
    }

    const normalizedBrand = (brand || 'proxe').toLowerCase();

    // Check if this is a booking attempt and if user already has a booking
    const containsBookingKeywords = (text: string): boolean => {
      const lowerText = text.toLowerCase().trim();
      return lowerText.includes('call') || 
             lowerText.includes('demo') || 
             lowerText.includes('book') ||
             lowerText.includes('schedule') ||
             lowerText.includes('meeting') ||
             lowerText.includes('appointment');
    };

    const isBookingAttempt = containsBookingKeywords(message);
    let existingBookingMessage = null;

    if (isBookingAttempt && (userProfile.email || userProfile.phone)) {
      const existingBooking = await checkExistingBooking(
        userProfile.phone || null,
        userProfile.email || null,
        normalizedBrand as 'proxe' | 'windchasers'
      );

      if (existingBooking?.exists && existingBooking.bookingDate && existingBooking.bookingTime) {
        // Format date and time
        const date = new Date(existingBooking.bookingDate);
        const formattedDate = date.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
        const formattedTime = existingBooking.bookingTime;
        existingBookingMessage = `You already have a booking scheduled for ${formattedDate} at ${formattedTime}.`;
      }
    }

    // Search knowledge base
    const relevantDocs = await searchKnowledgeBase(message, normalizedBrand, 3);

    // Format context
    let knowledgeContext = '';
    if (relevantDocs.length > 0) {
      knowledgeContext = relevantDocs
        .map((doc, index) => `${index + 1}. ${doc.content}`)
        .join('\n');
    } else {
      knowledgeContext = 'No relevant snippets found.';
    }

    // Check if this is the third message (before using it)
    const isThirdMessage = messageCount === 3;

    // If user already has a booking, modify the message to inform them
    const finalMessage = existingBookingMessage 
      ? `${existingBookingMessage}\n\nUser's message: ${message}`
      : message;

    const { systemPrompt, userPrompt } = buildPrompt({
      brand: normalizedBrand,
      userName: typeof userProfile?.name === 'string' ? userProfile.name : undefined,
      summary,
      history: recentHistory,
      knowledgeBase: knowledgeContext,
      message: finalMessage,
      bookingAlreadyScheduled: isBookingAlreadyScheduled || !!existingBookingMessage,
    });

    const additionalGuidance = isThirdMessage
      ? '\n\nGuidance: This is the third user interaction. Encourage them to schedule a call in a single sentence.'
      : '';
    const finalUserPrompt = `${userPrompt}${additionalGuidance}`;

    // Use streaming for all brands
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          let rawResponse = '';
          let cleanedResponse = '';

          // Use Claude for streaming
          if (!anthropic) {
            console.error('[Chat API] Claude API not configured');
            throw new Error('Claude API is not configured. Please set CLAUDE_API_KEY in environment variables.');
          }

          // Use environment variable for model, fallback to claude-haiku-4-5-20251001
          const model = process.env.CLAUDE_MODEL || 'claude-haiku-4-5-20251001';
          
          console.log('[Chat API] Starting Claude stream', {
            hasApiKey: Boolean(claudeApiKey),
            model: model,
            messageLength: finalUserPrompt.length,
          });

          // Retry logic for overloaded errors
          const maxRetries = 3;
          let lastError: any = null;
          let anthropicStream;
          
          for (let attempt = 0; attempt <= maxRetries; attempt++) {
            try {
              if (attempt > 0) {
                const retryDelay = Math.min(1000 * Math.pow(2, attempt - 1), 10000); // Exponential backoff, max 10s
                console.log(`[Chat API] Retry attempt ${attempt}/${maxRetries} after ${retryDelay}ms`);
                await new Promise(resolve => setTimeout(resolve, retryDelay));
              }
              
    // Use environment variable for model, fallback to claude-haiku-4-5-20251001
    const model = process.env.CLAUDE_MODEL || 'claude-haiku-4-5-20251001';
              
              anthropicStream = await anthropic.messages.stream({
                model: model,
                max_tokens: 768,
                system: systemPrompt,
                messages: [{
                  role: 'user',
                  content: finalUserPrompt,
                }],
              });
              console.log('[Chat API] Stream created successfully');
              break; // Success, exit retry loop
            } catch (streamError: any) {
              lastError = streamError;
              const errorType = streamError?.error?.type;
              const isOverloaded = errorType === 'overloaded_error' || 
                                   streamError?.message?.includes('overloaded');
              
              console.error(`[Chat API] Stream creation failed (attempt ${attempt + 1}/${maxRetries + 1}):`, {
                error: streamError,
                message: streamError?.message,
                type: streamError?.type,
                errorType: errorType,
                isOverloaded: isOverloaded,
                status: streamError?.status,
              });
              
              // Only retry on overloaded errors, not on other errors
              if (!isOverloaded || attempt >= maxRetries) {
                throw streamError;
              }
            }
          }
          
          if (!anthropicStream) {
            throw lastError || new Error('Failed to create stream after retries');
          }

          try {
            let chunkCount = 0;
            for await (const chunk of anthropicStream) {
              chunkCount++;
              try {
                // Process content block deltas with text
                if (chunk.type === 'content_block_delta' && 'delta' in chunk && chunk.delta && chunk.delta.type === 'text_delta') {
                  const text = chunk.delta.text || '';
                  console.log('[Chat API] Processing text delta:', { 
                    textType: typeof text,
                    textLength: text?.length,
                    textPreview: typeof text === 'string' ? text.substring(0, 50) : text,
                    deltaType: chunk.delta?.type
                  });
                  
                  if (text && typeof text === 'string') {
                    rawResponse += text;
                    const sseData = `data: ${JSON.stringify({ type: 'chunk', text: text })}\n\n`;
                    controller.enqueue(encoder.encode(sseData));
                  }
                }
              } catch (chunkError) {
                console.error('[Chat API] Error processing chunk:', chunkError);
                // If it's an error chunk, re-throw it
                if (chunkError instanceof Error && chunkError.message.includes('"type":"error"')) {
                  throw chunkError;
                }
                // Otherwise continue processing other chunks
              }
            }
            console.log('[Chat API] Stream completed', { chunkCount, responseLength: rawResponse.length });
          } catch (streamError: any) {
            console.error('[Chat API] Stream processing error:', {
              error: streamError,
              message: streamError?.message,
              type: streamError?.type,
              status: streamError?.status,
              errorType: streamError?.error?.type,
              errorMessage: streamError?.error?.message,
              errorObject: streamError?.error,
              headers: streamError?.headers,
              retryAfter: streamError?.headers?.get?.('retry-after'),
              stack: streamError?.stack,
            });
            
            // If the error message contains JSON with error info, extract it
            if (streamError?.message && streamError.message.includes('"type":"error"')) {
              try {
                const parsed = JSON.parse(streamError.message);
                if (parsed.error) {
                  streamError.error = parsed.error;
                }
              } catch (e) {
                // Not JSON, continue
              }
            }
            
            // Check if this is an overloaded error that happened during iteration
            // (not during creation, so retry logic didn't catch it)
            const errorType = streamError?.error?.type || 
                             (streamError?.message?.includes('"type":"error"') ? 
                               JSON.parse(streamError.message)?.error?.type : null);
            
            if (errorType === 'overloaded_error') {
              // This error happened during stream iteration, not creation
              // We can't retry the stream at this point, but we can show a helpful message
              const retryAfter = streamError?.headers?.get?.('retry-after');
              const retrySeconds = retryAfter ? parseInt(retryAfter, 10) : 6;
              throw { ...streamError, retrySeconds, isOverloaded: true };
            }
            
            throw streamError; // Re-throw to be caught by outer catch
          }

          // Clean response
          cleanedResponse = rawResponse
            .replace(/^(Hi there!|Hello!|Hey!|Hi!)\s*/gi, '')
            .replace(/^(Hi|Hello|Hey),?\s*/gi, '')
            .trim();

          // Generate follow-ups based on brand - ALWAYS ensure every message has follow-up buttons
          const lowerMessage = message.toLowerCase();
          const isFirstMessage = messageCount === 1 || messageCount === 0;
          
          // Get brand config for follow-up buttons
          const brandConfig = getBrandConfig(normalizedBrand);
          const defaultFollowUps = brandConfig.followUpButtons || [];
          const firstMessageButtons = brandConfig.firstMessageButtons || defaultFollowUps.slice(0, 3);
          
          let followUpsArray: string[] = [];
          
          // Track used buttons (normalize to lowercase for comparison)
          const usedButtonsLower = (usedButtons || []).map((b: string) => b.toLowerCase());
          
          // First message: show the 3 configured first message buttons
          if (isFirstMessage) {
            followUpsArray = firstMessageButtons;
          } 
          // Subsequent messages: show ONE random button from the available options
          else {
            // Available buttons for subsequent messages
            const availableButtons = defaultFollowUps.length > 0 ? defaultFollowUps : ['Schedule a Call'];
            
            // Filter out buttons that have been used or are similar to used buttons
            const unusedButtons = availableButtons.filter(followUp => {
              const lowerFollowUp = followUp.toLowerCase();
              const isUsed = usedButtonsLower.includes(lowerFollowUp);
              const isSimilar = isSimilarToAny(followUp, usedButtons);
              return !isUsed && !isSimilar;
            });
            
            // If all buttons have been used, reset and use all available buttons
            const buttonsToChooseFrom = unusedButtons.length > 0 ? unusedButtons : availableButtons;
            
            // Ensure we have buttons to choose from
            if (buttonsToChooseFrom.length > 0) {
              // Randomly select one button
              const randomIndex = Math.floor(Math.random() * buttonsToChooseFrom.length);
              followUpsArray = [buttonsToChooseFrom[randomIndex]];
            } else {
              followUpsArray = ['Schedule a Call'];
            }
          }
          
          // Final fallback: ensure we always have at least 1 follow-up button
          if (followUpsArray.length === 0 || !followUpsArray[0]) {
            followUpsArray = ['Schedule a Call'];
          }

          // Send follow-ups and done
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'followUps', followUps: followUpsArray })}\n\n`));
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'done' })}\n\n`));
          
          // Generate and save conversation summary (async, don't wait)
          if (externalSessionId && cleanedResponse) {
            const conversationSummary = `${message}\n\n${cleanedResponse}`;
            const lastMessageAt = new Date().toISOString();
            upsertSummary(externalSessionId, conversationSummary, lastMessageAt, brand as 'proxe' | 'windchasers').catch(err => {
              console.error('[Chat API] Failed to save summary:', err);
            });
          }
          
          controller.close();
        } catch (error: any) {
          console.error('[Chat API] Stream error:', {
            error,
            message: error?.message,
            type: error?.type,
            status: error?.status,
            statusCode: error?.status_code,
            errorType: error?.error?.type,
            stack: error?.stack,
          });
          
          // Extract error details - Claude API error structure is nested
          let claudeErrorType = error?.error?.type;
          let claudeErrorMessage = error?.error?.message;
          const errorMessage = error?.message || error?.toString() || 'Unknown error occurred';
          
          // Try to parse error message if it's JSON (Claude sometimes returns JSON string)
          if (!claudeErrorType && errorMessage && errorMessage.includes('"type":"error"')) {
            try {
              const parsed = JSON.parse(errorMessage);
              if (parsed.error) {
                claudeErrorType = parsed.error.type;
                claudeErrorMessage = parsed.error.message;
              }
            } catch (e) {
              // Not JSON, continue with original error message
            }
          }
          
          const errorType = claudeErrorType || error?.type || error?.status_code || 'unknown_error';
          const retryAfter = error?.headers?.get?.('retry-after');
          
          // Handle specific error types
          let userFriendlyMessage = claudeErrorMessage || errorMessage;
          
          if (errorType === 'overloaded_error' || errorMessage.toLowerCase().includes('overloaded') || error?.isOverloaded) {
            // Use retrySeconds from error object if available (from stream iteration error)
            const retrySeconds = error?.retrySeconds || (retryAfter ? parseInt(retryAfter, 10) : 6);
            userFriendlyMessage = `The service is currently overloaded. Please try again in ${retrySeconds} seconds.`;
          } else if (errorType === 'rate_limit_error' || errorMessage.toLowerCase().includes('rate_limit') || errorMessage.toLowerCase().includes('rate limit') || error?.status_code === 429) {
            userFriendlyMessage = 'Rate limit exceeded. Please wait a moment and try again.';
          } else if (errorMessage.toLowerCase().includes('api key') || errorMessage.toLowerCase().includes('authentication') || error?.status_code === 401) {
            userFriendlyMessage = 'Authentication error. Please check API configuration.';
          } else if (errorMessage.toLowerCase().includes('network') || errorMessage.toLowerCase().includes('fetch')) {
            userFriendlyMessage = 'Network error. Please check your connection and try again.';
          } else if (error?.status_code === 500 || error?.status_code === 503) {
            userFriendlyMessage = 'The service is currently unavailable. Please try again in a moment.';
          } else {
            // For development, show more details
            if (process.env.NODE_ENV !== 'production') {
              userFriendlyMessage = `Error: ${claudeErrorMessage || errorMessage}`;
            }
          }
          
          try {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
              type: 'error', 
              error: userFriendlyMessage 
            })}\n\n`));
          } catch (encodeError) {
            console.error('[Chat API] Failed to encode error:', encodeError);
          }
          
          try {
            controller.close();
          } catch (closeError) {
            console.error('[Chat API] Failed to close stream:', closeError);
          }
        }
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error: any) {
    return Response.json(
      { error: 'Error processing request', message: error.message },
      { status: 500 }
    );
  }
}
