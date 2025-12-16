type HistoryEntry = {
  role: 'user' | 'assistant';
  content: string;
};

interface PromptOptions {
  brand: string;
  userName?: string | null;
  summary?: string;
  history?: HistoryEntry[];
  knowledgeBase?: string;
  message: string;
  bookingAlreadyScheduled?: boolean;
}

function buildCorePrompt(brand: string, userName?: string | null): string {
  const nameLine = userName ? `The user is ${userName}. Address them by name once, then continue naturally.` : '';

  return [
    'You are PROXe: an AI system that turns every potential customer into revenue.',
    'Listens across website, WhatsApp, social DMs, and calls. When prospects go silent, nudges them back automatically.',
    'Never miss a lead. Never forget a follow-up.',
    'If this is the FIRST assistant reply (no prior assistant messages in history), use this exact paragraph verbatim—no paraphrasing: "PROXe is the AI system that makes sure you never miss a lead again it turns every potential customer into revenue. Listens across website, WhatsApp, social DMs, and calls. When prospects go silent, nudges them back automatically. Never miss a lead. Never forget a follow-up."',
    'CTA labels must be used exactly as provided (e.g., "Learn More", "Book a Demo")—never rewrite, paraphrase, or add new labels.',
    'FORMATTING: Use single line breaks between different points. One idea per line. Never create walls of text. For pricing: each plan gets its own line. For features: each feature gets its own line.',
    'If user asks about pricing, format with line breaks: "Starter: $99/month\n• Website + WhatsApp\n• 1,000 conversations\n\nPro: $249/month\n• Website + WhatsApp + Social DMs + Calls\n• Unlimited conversations\n\nBoth include: Unified Dashboard, Smart Flows, Priority support\n\n→ BUTTON: PROXe Starter - $99\n→ BUTTON: PROXe Pro - $249"',
    'Do not paraphrase the brand positioning; stick to the provided wording.',
    'Talk sharp, no fluff. Echo their pain if obvious. Show the fix. Give fast outcome.',
    'Lead with outcomes: identify intent, qualify leads, capture every opportunity.',
    'Never mention button labels; UI supplies them.',
    'Offer demos or callbacks when appropriate.',
    'Render clean HTML: <p>, <strong>, <ul>. Use <br> tags for line breaks within paragraphs. Keep responses scannable.',
    nameLine,
  ].filter(Boolean).join(' ');
}

function formatHistory(history: HistoryEntry[] = []): string {
  if (history.length === 0) {
    return 'No prior turns.';
  }

  return history
    .map((entry) => `${entry.role === 'user' ? 'User' : 'Assistant'}: ${entry.content}`)
    .join('\n');
}

export function buildPrompt({
  brand,
  userName,
  summary,
  history,
  knowledgeBase,
  message,
  bookingAlreadyScheduled,
}: PromptOptions) {
  const system = buildCorePrompt(brand, userName);

  const summaryBlock = summary
    ? `Conversation summary so far:\n${summary}\n`
    : 'Conversation summary so far:\nNo summary captured yet.\n';

  const historyBlock = `Recent turns:\n${formatHistory(history)}\n`;

  const knowledgeBlock = knowledgeBase && knowledgeBase.trim().length > 0
    ? `Relevant knowledge base snippets:\n${knowledgeBase.trim()}\n`
    : 'Relevant knowledge base snippets:\nNone found. Answer from brand knowledge.';

  const bookingNote = bookingAlreadyScheduled
    ? 'Reminder: the user already scheduled a booking. Acknowledge it and avoid rebooking.'
    : '';

  const instructions = [
    summaryBlock,
    historyBlock,
    knowledgeBlock,
    bookingNote,
    'Respond to the user\'s latest message using proper line breaks for readability. Use <br> tags within paragraphs to separate different points. Keep responses scannable and avoid walls of text. If information is missing, state it and suggest a concrete next step.',
  ].filter(Boolean).join('\n\n');

  const userPrompt = `${instructions}\n\nLatest user message:\n${message}\n\nCraft your reply:`;

  return { systemPrompt: system, userPrompt };
}