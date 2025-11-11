import { NextRequest } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

export const runtime = 'nodejs';

const claudeApiKey = process.env.CLAUDE_API_KEY;
const anthropic = claudeApiKey ? new Anthropic({ apiKey: claudeApiKey }) : null;

interface HistoryItem {
  role: 'user' | 'assistant';
  content: string;
}

export async function POST(request: NextRequest) {
  try {
    if (!anthropic) {
      return Response.json({ error: 'Claude API key missing' }, { status: 500 });
    }

    const body = await request.json();
    const previousSummary: string = body.summary || '';
    const history: HistoryItem[] = Array.isArray(body.history) ? body.history : [];
    const brand: string = body.brand || 'proxe';

    if (history.length === 0) {
      return Response.json({ summary: previousSummary }, { status: 200 });
    }

    const formattedHistory = history
      .map((entry) => `${entry.role === 'user' ? 'User' : 'Assistant'}: ${entry.content}`)
      .join('\n');

    const systemPrompt = `You are an AI conversation summarizer. Focus on the USER's behavior and patterns. Compress the dialogue into 2 concise sentences (max ~80 tokens) capturing:
- What the user is asking about and why (their intent/pain points)
- Pattern of their questions (exploring features, pricing concerns, comparison shopping, ready to buy, etc.)
- Key user data (industry, business size, budget mentioned, timeline, specific needs)
- Objections or blockers raised by the user

Do NOT explain what PROXe/products are. Focus on USER behavior, not product descriptions. Strip filler words. If nothing new was learned about the user, return previous summary unchanged.`;

    const prompt = `Previous summary (may be empty):
${previousSummary || '(none)'}

New conversation turns:
${formattedHistory}

Analyze: What is the user interested in? What pattern do their questions suggest about their intent (exploring, comparing, objecting, ready to commit)? What specific needs or constraints did they mention? Update the summary focusing on USER behavior and intent patterns.`;

    const summaryResponse = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 120,
      temperature: 0,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const content = summaryResponse.content?.[0];
    const updatedSummary =
      content && content.type === 'text' ? content.text.trim() : previousSummary;

    return Response.json({ summary: updatedSummary, brand }, { status: 200 });
  } catch (error: any) {
    console.error('[chat/summarize] Failed to compress memory', error);
    return Response.json(
      { error: error?.message || 'Failed to summarize conversation' },
      { status: 500 }
    );
  }
}

