import { getSupabaseClient } from './supabaseClient';

export interface SessionRecord {
  id: string;
  externalSessionId: string;
  userName: string | null;
  phone: string | null;
  email: string | null;
  websiteUrl: string | null;
  conversationSummary: string | null;
  lastMessageAt: string | null;
  userInputsSummary: UserInput[];
  messageCount: number;
  bookingDate: string | null;
  bookingTime: string | null;
  bookingStatus: 'pending' | 'confirmed' | 'cancelled' | null;
  googleEventId: string | null;
  bookingCreatedAt: string | null;
  brand: 'proxe' | 'windchasers';
  createdAt: string;
  updatedAt: string;
}

export interface UserInput {
  input: string;
  intent?: string;
  created_at: string;
}

export interface SessionSummary {
  summary: string;
  lastMessageCreatedAt: string;
}

const TABLE_SESSIONS = 'chat_sessions';

function mapSession(row: any): SessionRecord {
  return {
    id: row.id,
    externalSessionId: row.external_session_id,
    userName: row.user_name ?? null,
    phone: row.phone ?? null,
    email: row.email ?? null,
    websiteUrl: row.website_url ?? null,
    conversationSummary: row.conversation_summary ?? null,
    lastMessageAt: row.last_message_at ?? null,
    userInputsSummary: Array.isArray(row.user_inputs_summary) ? row.user_inputs_summary : [],
    messageCount: row.message_count ?? 0,
    bookingDate: row.booking_date ?? null,
    bookingTime: row.booking_time ?? null,
    bookingStatus: row.booking_status ?? null,
    googleEventId: row.google_event_id ?? null,
    bookingCreatedAt: row.booking_created_at ?? null,
    brand: row.brand ?? 'proxe',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
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
    .insert({ 
      external_session_id: externalSessionId,
      brand: brand,
    })
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

  return created ? mapSession(created) : null;
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

export async function addUserInput(
  externalSessionId: string,
  input: string,
  intent?: string,
  brand: 'proxe' | 'windchasers' = 'proxe'
) {
  const supabase = getSupabaseClient(brand);
  if (!supabase) {
    console.warn('[chatSessions] Supabase client unavailable in addUserInput', { brand });
    return;
  }

  // Fetch current session to get existing user_inputs_summary
  const { data: session, error: fetchError } = await supabase
    .from(TABLE_SESSIONS)
    .select('user_inputs_summary, message_count')
    .eq('external_session_id', externalSessionId)
    .maybeSingle();

  if (fetchError) {
    console.error('[Supabase] Failed to fetch session for addUserInput', fetchError);
    return;
  }

  const existingInputs: UserInput[] = Array.isArray(session?.user_inputs_summary) 
    ? session.user_inputs_summary 
    : [];

  const newInput: UserInput = {
    input: input.trim(),
    intent: intent,
    created_at: new Date().toISOString(),
  };

  // Add new input and keep last 20 inputs
  const updatedInputs = [...existingInputs, newInput].slice(-20);
  const messageCount = (session?.message_count ?? 0) + 1;

  const { error } = await supabase
    .from(TABLE_SESSIONS)
    .update({
      user_inputs_summary: updatedInputs,
      message_count: messageCount,
      last_message_at: new Date().toISOString(),
    })
    .eq('external_session_id', externalSessionId);

  if (error) {
    console.error('[Supabase] Failed to add user input', error);
  }
}

export async function upsertSummary(
  externalSessionId: string,
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
    .from(TABLE_SESSIONS)
    .update({
      conversation_summary: summary,
      last_message_at: lastMessageCreatedAt,
    })
    .eq('external_session_id', externalSessionId);

  if (error) {
    console.error('[Supabase] Failed to upsert summary', error);
  }
}

export async function fetchSummary(
  externalSessionId: string,
  brand: 'proxe' | 'windchasers' = 'proxe'
): Promise<SessionSummary | null> {
  const supabase = getSupabaseClient(brand);
  if (!supabase) {
    console.warn('[chatSessions] Supabase client unavailable in fetchSummary', { brand });
    return null;
  }

  const { data, error } = await supabase
    .from(TABLE_SESSIONS)
    .select('conversation_summary, last_message_at')
    .eq('external_session_id', externalSessionId)
    .maybeSingle();

  if (error) {
    console.error('[Supabase] Failed to fetch summary', error);
    return null;
  }

  if (!data || !data.conversation_summary) return null;

  return {
    summary: data.conversation_summary,
    lastMessageCreatedAt: data.last_message_at || new Date().toISOString(),
  };
}

export async function storeBooking(
  externalSessionId: string,
  booking: {
    date: string; // YYYY-MM-DD format
    time: string; // "11:00 AM" format
    googleEventId?: string;
    status?: 'pending' | 'confirmed' | 'cancelled';
  },
  brand: 'proxe' | 'windchasers' = 'proxe'
) {
  const supabase = getSupabaseClient(brand);
  if (!supabase) {
    console.warn('[chatSessions] Supabase client unavailable in storeBooking', { brand });
    return;
  }

  const { error } = await supabase
    .from(TABLE_SESSIONS)
    .update({
      booking_date: booking.date,
      booking_time: booking.time,
      google_event_id: booking.googleEventId ?? null,
      booking_status: booking.status ?? 'confirmed',
      booking_created_at: new Date().toISOString(),
    })
    .eq('external_session_id', externalSessionId);

  if (error) {
    console.error('[Supabase] Failed to store booking', error);
  }
}
