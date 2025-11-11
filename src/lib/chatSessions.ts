import { getSupabaseClient } from './supabaseClient';

export interface SessionRecord {
  id: string;
  externalSessionId: string;
  userName: string | null;
  phone: string | null;
  email: string | null;
  websiteUrl: string | null;
}

export interface StoredMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt: string;
}

export interface SessionSummary {
  summary: string;
  lastMessageCreatedAt: string;
}

const TABLE_SESSIONS = 'chat_sessions';
const TABLE_MESSAGES = 'chat_messages';
const TABLE_SUMMARIES = 'chat_message_summaries';

function mapSession(row: any): SessionRecord {
  return {
    id: row.id,
    externalSessionId: row.external_session_id,
    userName: row.user_name ?? null,
    phone: row.phone ?? null,
    email: row.email ?? null,
    websiteUrl: row.website_url ?? null,
  };
}

function mapMessage(row: any): StoredMessage {
  return {
    id: row.id,
    role: row.role,
    content: row.content,
    createdAt: row.created_at,
  };
}

export async function ensureSession(
  externalSessionId: string,
  brand: 'proxe' | 'windchasers' = 'proxe'
): Promise<SessionRecord | null> {
  const supabase = getSupabaseClient(brand);
  if (!supabase) {
    console.warn('[chatSessions] Supabase client unavailable in ensureSession', { brand });
    return null;
  }

  const { data, error } = await supabase
    .from(TABLE_SESSIONS)
    .select('*')
    .eq('external_session_id', externalSessionId)
    .maybeSingle();

  if (error) {
    console.error('[Supabase] Failed to fetch session', error);
    return null;
  }

  if (data) {
    return mapSession(data);
  }

  const { data: created, error: insertError } = await supabase
    .from(TABLE_SESSIONS)
    .insert({ external_session_id: externalSessionId })
    .select('*')
    .single();

  if (insertError) {
    if (insertError.code === '23505' || insertError.message?.includes('duplicate key value')) {
      const { data: existing, error: fetchError } = await supabase
        .from(TABLE_SESSIONS)
        .select('*')
        .eq('external_session_id', externalSessionId)
        .maybeSingle();

      if (fetchError) {
        console.error('[Supabase] Failed to fetch existing session after conflict', fetchError);
        return null;
      }

      return existing ? mapSession(existing) : null;
    }

    console.error('[Supabase] Failed to create session', insertError);
    return null;
  }

  return mapSession(created);
}

export async function updateSessionProfile(
  externalSessionId: string,
  profile: { userName?: string; phone?: string | null; email?: string | null; websiteUrl?: string | null },
  brand: 'proxe' | 'windchasers' = 'proxe'
) {
  const supabase = getSupabaseClient(brand);
  if (!supabase) {
    console.warn('[chatSessions] Supabase client unavailable in updateSessionProfile', { brand });
    return;
  }

  const updates: Record<string, string | null | undefined> = {};
  if (typeof profile.userName === 'string') {
    updates.user_name = profile.userName.trim() || null;
  }
  if (profile.phone !== undefined) {
    updates.phone = profile.phone ? profile.phone.trim() : null;
  }
  if (profile.email !== undefined) {
    updates.email = profile.email ? profile.email.trim() : null;
  }
  if (profile.websiteUrl !== undefined) {
    updates.website_url = profile.websiteUrl ? profile.websiteUrl.trim() : null;
  }
  if (Object.keys(updates).length === 0) return;

  const { error } = await supabase
    .from(TABLE_SESSIONS)
    .update(updates)
    .eq('external_session_id', externalSessionId);

  if (error) {
    console.error('[Supabase] Failed to update session profile', error);
  }
}

export async function storeMessage(
  sessionId: string,
  role: 'user' | 'assistant' | 'system',
  content: string,
  brand: 'proxe' | 'windchasers' = 'proxe'
) {
  const supabase = getSupabaseClient(brand);
  if (!supabase) {
    console.warn('[chatSessions] Supabase client unavailable in storeMessage', { brand });
    return;
  }

  const { error } = await supabase
    .from(TABLE_MESSAGES)
    .insert({
      session_id: sessionId,
      role,
      content,
    });

  if (error) {
    console.error('[Supabase] Failed to store message', error);
  }
}

export async function fetchRecentMessages(
  sessionId: string,
  limit = 3,
  brand: 'proxe' | 'windchasers' = 'proxe'
): Promise<StoredMessage[]> {
  const supabase = getSupabaseClient(brand);
  if (!supabase) {
    console.warn('[chatSessions] Supabase client unavailable in fetchRecentMessages', { brand });
    return [];
  }

  const { data, error } = await supabase
    .from(TABLE_MESSAGES)
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: false })
    .limit(limit * 2); // fetch both user & assistant turns

  if (error) {
    console.error('[Supabase] Failed to fetch messages', error);
    return [];
  }

  return (data ?? []).map(mapMessage).reverse();
}

export async function upsertSummary(
  sessionId: string,
  summary: string,
  lastMessageCreatedAt: string,
  brand: 'proxe' | 'windchasers' = 'proxe'
) {
  const supabase = getSupabaseClient(brand);
  if (!supabase) {
    console.warn('[chatSessions] Supabase client unavailable in upsertSummary', { brand });
    return;
  }

  const { error } = await supabase
    .from(TABLE_SUMMARIES)
    .upsert(
      { session_id: sessionId, summary, last_message_created_at: lastMessageCreatedAt },
      { onConflict: 'session_id' }
    );

  if (error) {
    console.error('[Supabase] Failed to upsert summary', error);
  }
}

export async function fetchSummary(
  sessionId: string,
  brand: 'proxe' | 'windchasers' = 'proxe'
): Promise<SessionSummary | null> {
  const supabase = getSupabaseClient(brand);
  if (!supabase) {
    console.warn('[chatSessions] Supabase client unavailable in fetchSummary', { brand });
    return null;
  }

  const { data, error } = await supabase
    .from(TABLE_SUMMARIES)
    .select('*')
    .eq('session_id', sessionId)
    .maybeSingle();

  if (error) {
    console.error('[Supabase] Failed to fetch summary', error);
    return null;
  }

  if (!data) return null;

  return {
    summary: data.summary,
    lastMessageCreatedAt: data.last_message_created_at,
  };
}

