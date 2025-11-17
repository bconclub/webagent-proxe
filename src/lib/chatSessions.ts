import { getSupabaseClient } from './supabaseClient';

// Channel type definition
// NOTE: Full type includes all 4 channels for future use
// Current build (goproxe.com) only uses: 'web' and 'voice'
// WhatsApp and Social are ready for future implementation
export type Channel = 'web' | 'whatsapp' | 'voice' | 'social';

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
  channel: Channel;
  channelData: Record<string, any>;
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

const TABLE_SESSIONS = 'sessions';

// Helper function to create channel-specific session record
async function createChannelSession(
  sessionId: string,
  channel: Channel,
  brand: 'proxe' | 'windchasers'
): Promise<void> {
  const supabase = getSupabaseClient(brand);
  if (!supabase) {
    return;
  }

  const channelTableMap: Record<Channel, string> = {
    web: 'web_sessions',
    whatsapp: 'whatsapp_sessions',
    voice: 'voice_sessions',
    social: 'social_sessions',
  };

  const tableName = channelTableMap[channel];
  if (!tableName) {
    console.warn('[chatSessions] Unknown channel', { channel });
    return;
  }

  const { error } = await supabase
    .from(tableName)
    .insert({ session_id: sessionId })
    .select();

  if (error) {
    // Ignore duplicate key errors (session might already exist)
    if (error.code !== '23505') {
      console.warn(`[chatSessions] Failed to create ${channel} session`, error);
    }
  }
}

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
    channel: row.channel ?? 'web',
    channelData: row.channel_data ?? {},
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function ensureSession(
  externalSessionId: string,
  channel: Channel,
  brand: 'proxe' | 'windchasers' = 'proxe'
): Promise<SessionRecord | null> {
  const supabase = getSupabaseClient(brand);
  if (!supabase) {
    console.warn('[chatSessions] Supabase client unavailable in ensureSession', { brand, channel });
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
    // Ensure channel-specific record exists even for existing sessions
    await ensureChannelSessionExists(data.id, channel, brand);
    return mapSession(data);
  }

  const { data: created, error: insertError } = await supabase
    .from(TABLE_SESSIONS)
    .insert({ 
      external_session_id: externalSessionId,
      brand: brand,
      channel: channel,
      channel_data: {},
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

      if (existing) {
        // Ensure channel-specific record exists
        await ensureChannelSessionExists(existing.id, channel, brand);
        return mapSession(existing);
      }
      return null;
    }

    console.error('[Supabase] Failed to create session', insertError);
    return null;
  }

  // Create channel-specific session record
  if (created) {
    await createChannelSession(created.id, channel, brand);
    return mapSession(created);
  }

  return null;
}

// Helper function to ensure channel-specific session record exists
async function ensureChannelSessionExists(
  sessionId: string,
  channel: Channel,
  brand: 'proxe' | 'windchasers'
): Promise<void> {
  const supabase = getSupabaseClient(brand);
  if (!supabase) {
    return;
  }

  const channelTableMap: Record<Channel, string> = {
    web: 'web_sessions',
    whatsapp: 'whatsapp_sessions',
    voice: 'voice_sessions',
    social: 'social_sessions',
  };

  const tableName = channelTableMap[channel];
  if (!tableName) {
    return;
  }

  // Check if channel-specific record already exists
  const { data: existing, error: checkError } = await supabase
    .from(tableName)
    .select('id')
    .eq('session_id', sessionId)
    .maybeSingle();

  if (checkError) {
    console.warn(`[chatSessions] Failed to check ${channel} session`, checkError);
    return;
  }

  // Create if it doesn't exist
  if (!existing) {
    await createChannelSession(sessionId, channel, brand);
  }
}

// Helper function to check if a lead is complete (has name, email, and phone)
function isCompleteLead(profile: { userName?: string | null; phone?: string | null; email?: string | null }): boolean {
  const hasName = Boolean(profile.userName && profile.userName.trim());
  const hasEmail = Boolean(profile.email && profile.email.trim());
  const hasPhone = Boolean(profile.phone && profile.phone.trim());
  return hasName && hasEmail && hasPhone;
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

  // Check if this is a complete lead before creating/updating session
  const completeLead = isCompleteLead({
    userName: profile.userName,
    email: profile.email,
    phone: profile.phone,
  });

  if (!completeLead) {
    if (process.env.NODE_ENV !== 'production') {
      console.log('[chatSessions] Skipping session update - incomplete lead (missing name, email, or phone)', {
        hasName: Boolean(profile.userName?.trim()),
        hasEmail: Boolean(profile.email?.trim()),
        hasPhone: Boolean(profile.phone?.trim()),
      });
    }
    return;
  }

  // Ensure session exists for complete leads
  await ensureSession(externalSessionId, 'web', brand);

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
  } else if (process.env.NODE_ENV !== 'production') {
    console.log('[Supabase] Successfully updated session profile for complete lead', { externalSessionId });
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

  // Check if session exists and is a complete lead before adding input
  const { data: existingSession } = await supabase
    .from(TABLE_SESSIONS)
    .select('user_name, email, phone')
    .eq('external_session_id', externalSessionId)
    .maybeSingle();

  // Only add user input if this is a complete lead (has name, email, phone)
  const isComplete = existingSession && 
    existingSession.user_name?.trim() && 
    existingSession.email?.trim() && 
    existingSession.phone?.trim();

  if (!isComplete) {
    if (process.env.NODE_ENV !== 'production') {
      console.log('[chatSessions] Skipping user input - incomplete lead (missing name, email, or phone)', {
        hasSession: Boolean(existingSession),
        hasName: Boolean(existingSession?.user_name?.trim()),
        hasEmail: Boolean(existingSession?.email?.trim()),
        hasPhone: Boolean(existingSession?.phone?.trim()),
      });
    }
    return;
  }

  // Fetch current session to get existing user_inputs_summary
  const { data: currentSession, error: fetchError } = await supabase
    .from(TABLE_SESSIONS)
    .select('user_inputs_summary, message_count')
    .eq('external_session_id', externalSessionId)
    .maybeSingle();

  if (fetchError) {
    console.error('[Supabase] Failed to fetch session for addUserInput', fetchError);
    return;
  }

  if (!currentSession) {
    console.error('[Supabase] Session not found for addUserInput', { externalSessionId, brand });
    return;
  }

  const existingInputs: UserInput[] = Array.isArray(currentSession?.user_inputs_summary) 
    ? currentSession.user_inputs_summary 
    : [];

  const newInput: UserInput = {
    input: input.trim(),
    intent: intent,
    created_at: new Date().toISOString(),
  };

  // Add new input and keep last 20 inputs
  const updatedInputs = [...existingInputs, newInput].slice(-20);
  const messageCount = (currentSession?.message_count ?? 0) + 1;

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
  } else if (process.env.NODE_ENV !== 'production') {
    console.log('[Supabase] Successfully added user input', { externalSessionId, messageCount });
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

  // Only update summary for complete leads
  const { data: existingSession } = await supabase
    .from(TABLE_SESSIONS)
    .select('user_name, email, phone')
    .eq('external_session_id', externalSessionId)
    .maybeSingle();

  const isComplete = existingSession && 
    existingSession.user_name?.trim() && 
    existingSession.email?.trim() && 
    existingSession.phone?.trim();

  if (!isComplete) {
    if (process.env.NODE_ENV !== 'production') {
      console.log('[chatSessions] Skipping summary update - incomplete lead');
    }
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

  // Only store booking for complete leads
  const { data: existingSession } = await supabase
    .from(TABLE_SESSIONS)
    .select('user_name, email, phone')
    .eq('external_session_id', externalSessionId)
    .maybeSingle();

  const isComplete = existingSession && 
    existingSession.user_name?.trim() && 
    existingSession.email?.trim() && 
    existingSession.phone?.trim();

  if (!isComplete) {
    if (process.env.NODE_ENV !== 'production') {
      console.log('[chatSessions] Skipping booking storage - incomplete lead');
    }
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

export async function updateChannelData(
  externalSessionId: string,
  channelData: Record<string, any>,
  brand: 'proxe' | 'windchasers' = 'proxe'
) {
  const supabase = getSupabaseClient(brand);
  if (!supabase) {
    console.warn('[chatSessions] Supabase client unavailable in updateChannelData', { brand });
    return;
  }

  // Fetch current channel_data to merge
  const { data: session, error: fetchError } = await supabase
    .from(TABLE_SESSIONS)
    .select('channel_data')
    .eq('external_session_id', externalSessionId)
    .maybeSingle();

  if (fetchError) {
    console.error('[Supabase] Failed to fetch session for updateChannelData', fetchError);
    return;
  }

  const currentData = session?.channel_data ?? {};
  const mergedData = { ...currentData, ...channelData };

  const { error } = await supabase
    .from(TABLE_SESSIONS)
    .update({ channel_data: mergedData })
    .eq('external_session_id', externalSessionId);

  if (error) {
    console.error('[Supabase] Failed to update channel data', error);
  }
}
