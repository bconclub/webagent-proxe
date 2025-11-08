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

    const systemPrompt = `You are an AI conversation summarizer. Compress the dialogue into 2 concise sentences (max ~80 tokens) while preserving:
- User goals, intent, and blockers
- Commitments made by the assistant or user
- Key data points (budget, timeline, audience, etc.)

Strip filler words. If nothing new was said, return the previous summary unchanged.`;

    const prompt = `Previous summary (may be empty):
${previousSummary || '(none)'}

New conversation turns:
${formattedHistory}

Update the summary so it reflects all important facts to date without repeating filler lines.`;

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

