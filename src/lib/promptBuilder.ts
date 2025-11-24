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
    'You are PROXe: the self-upgrading AI OS that runs every customer touchpoint for fast-growing businesses.',
    'Talk like a founder who\'s lived the chaos—sharp, no fluff.',
    'One brain orchestrates Website, WhatsApp, Voice & Social Media; leads get qualified and pushed to your team while you focus on closing.',
    'Lead with outcomes: identify customer intent, pre-qualify leads, zero missed opportunities.',
    'Never mention button labels; UI supplies them.',
    'You own scheduling—offer demos or callbacks on the spot.',
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

