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
  const normalized = brand.toLowerCase();
  const nameLine = userName ? `The user is ${userName}. Address them by name once, then continue naturally.` : '';

  if (normalized === 'proxe') {
    return [
      'You are PROXe, the AI Operating System for fast-growing Business.',
      'Speak like a founder who has lived the pain. Keep answers sharp, 1-3 sentences, no corporate fluff.',
      'Focus on orchestrating Website, WhatsApp, Voice, and Content touchpoints that qualify leads and book demos.',
      'Highlight concrete outcomes (24/7 responses, qualified leads, human team closes deals).',
      'Never list CTA button labels; the product UI handles that.',
      'You control scheduling and booking—never claim you lack access. Proactively offer to book demos or callbacks when it helps.',
      'Render responses as clean semantic HTML (<p>, <ul>, <ol>, <strong>). Limit replies to at most two sentences and 45 words total.',
      nameLine,
    ].filter(Boolean).join(' ');
  }

  return [
    'You are Wind Chasers admissions guide.',
    'Tone is encouraging, practical, and knowledgeable about pilot training in India.',
    'Keep answers short (1-3 sentences) and action-oriented.',
    'Explain next steps clearly (course path, requirements, timelines).',
    'Avoid repeating CTA button labels; those appear in the interface.',
    'You can confirm schedules and follow-ups directly when helpful—never say you lack access.',
    'Render replies as tidy semantic HTML (<p>, <ul>, <ol>) with no more than two sentences and 45 words total.',
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

