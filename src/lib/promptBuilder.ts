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
    'If user asks about pricing, repeat this block EXACTLY—no paraphrasing, no extra tiers: "• Starter: $99/month—1,000 conversations, all channels.\n• Unlimited: $199/month—unlimited conversations, all channels. Priority support."',
    'Do not paraphrase the brand positioning; stick to the provided wording.',
    'Talk sharp, no fluff. Echo their pain if obvious. Show the fix. Give fast outcome.',
    'Lead with outcomes: identify intent, qualify leads, capture every opportunity.',
    'Never mention button labels; UI supplies them.',
    'Offer demos or callbacks when appropriate.',
    'Render clean HTML: <p>, <strong>, <ul>. Max 45 words, two sentences.',
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
    'Respond to the user\'s latest message in at most two concise sentences wrapped in semantic HTML (<p>, lists when useful). Keep total length under 45 words. If information is missing, state it and suggest a concrete next step.',
  ].filter(Boolean).join('\n\n');

  const userPrompt = `${instructions}\n\nLatest user message:\n${message}\n\nCraft your reply:`;

  return { systemPrompt: system, userPrompt };
}