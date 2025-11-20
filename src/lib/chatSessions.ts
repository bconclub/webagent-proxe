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

// Get the table name for a channel
// New structure: web_sessions is self-contained (not sessions)
function getChannelTable(channel: Channel): string {
  const channelTableMap: Record<Channel, string> = {
    web: 'web_sessions',
    whatsapp: 'whatsapp_sessions',
    voice: 'voice_sessions',
    social: 'social_sessions',
  };
  return channelTableMap[channel] || 'web_sessions';
}

// Helper function to normalize phone number for all_leads deduplication
function normalizePhone(phone: string | null | undefined): string | null {
  if (!phone) return null;
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');
  return digits || null;
}

// Helper function to ensure all_leads record exists and return lead_id
async function ensureAllLeads(
  customerName: string | null,
  email: string | null,
  phone: string | null,
  brand: 'proxe' | 'windchasers'
): Promise<string | null> {
  const supabase = getSupabaseClient(brand);
  if (!supabase) {
    return null;
  }

  // Need at least phone for deduplication
  const normalizedPhone = normalizePhone(phone);
  if (!normalizedPhone) {
    return null;
  }

  try {
    // Check if all_leads table exists (might not be migrated yet)
    const { data: existing, error: fetchError } = await supabase
      .from('all_leads')
      .select('id')
      .eq('customer_phone_normalized', normalizedPhone)
      .eq('brand', brand)
      .maybeSingle();

    if (fetchError) {
      // Table might not exist yet - that's okay, we'll continue without lead_id
      if (fetchError.code === '42P01') {
        console.log('[chatSessions] all_leads table not found, continuing without lead_id');
        return null;
      }
      console.warn('[chatSessions] Failed to check all_leads', fetchError);
      return null;
    }

    if (existing) {
      // Update last_touchpoint and last_interaction_at
      await supabase
        .from('all_leads')
        .update({
          last_touchpoint: 'web',
          last_interaction_at: new Date().toISOString(),
          customer_name: customerName || undefined,
          email: email || undefined,
          phone: phone || undefined,
        })
        .eq('id', existing.id);
      return existing.id;
    }

    // Create new all_leads record
    const { data: created, error: createError } = await supabase
      .from('all_leads')
      .insert({
        customer_name: customerName,
        email: email,
        phone: phone,
        customer_phone_normalized: normalizedPhone,
        first_touchpoint: 'web',
        last_touchpoint: 'web',
        last_interaction_at: new Date().toISOString(),
        brand: brand,
      })
      .select('id')
      .single();

    if (createError) {
      console.warn('[chatSessions] Failed to create all_leads', createError);
      return null;
    }

    return created?.id || null;
  } catch (error) {
    console.warn('[chatSessions] Error ensuring all_leads', error);
    return null;
  }
}

function mapSession(row: any): SessionRecord {
  // Support both old (sessions) and new (web_sessions) column names
  return {
    id: row.id,
    externalSessionId: row.external_session_id || row.externalSessionId,
    userName: row.customer_name ?? row.user_name ?? null,
    phone: row.customer_phone ?? row.phone ?? null,
    email: row.customer_email ?? row.email ?? null,
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

  const tableName = getChannelTable(channel);

  // Try to fetch existing session from channel-specific table
  const { data, error } = await supabase
    .from(tableName)
    .select('*')
    .eq('external_session_id', externalSessionId)
    .maybeSingle();

  if (error) {
    // If table doesn't exist or column doesn't exist, try old sessions table as fallback
    if (error.code === '42P01' || error.code === '42703') {
      console.log('[chatSessions] Channel table not available, trying fallback');
      // Fallback to old sessions table if web_sessions doesn't exist yet
      const { data: fallbackData, error: fallbackError } = await supabase
        .from('sessions')
        .select('*')
        .eq('external_session_id', externalSessionId)
        .maybeSingle();
      
      if (fallbackError) {
        console.error('[Supabase] Failed to fetch session', fallbackError);
        return null;
      }
      
      if (fallbackData) {
        return mapSession(fallbackData);
      }
    } else {
      console.error('[Supabase] Failed to fetch session', error);
      return null;
    }
  }

  if (data) {
    return mapSession(data);
  }

  // Create new session in channel-specific table
  // For web_sessions, we need: external_session_id, brand, session_status
  // lead_id is optional initially (will be set when customer data is available)
  const insertData: Record<string, any> = {
    external_session_id: externalSessionId,
    brand: brand,
    session_status: 'active',
  };

  // Only add channel_data if the table supports it
  // web_sessions uses channel_data, but we'll add it conditionally
  insertData.channel_data = {};

  const { data: created, error: insertError } = await supabase
    .from(tableName)
    .insert(insertData)
    .select('*')
    .single();

  if (insertError) {
    // Handle duplicate key errors (23505 = unique constraint violation, HTTP 409)
    if (insertError.code === '23505' || 
        insertError.message?.includes('duplicate key value') ||
        insertError.message?.includes('already exists')) {
      console.log('[chatSessions] Duplicate session detected, fetching existing session');
      // Try to fetch the existing record
      const { data: existing, error: fetchError } = await supabase
        .from(tableName)
        .select('*')
        .eq('external_session_id', externalSessionId)
        .maybeSingle();

      if (fetchError) {
        console.error('[Supabase] Failed to fetch existing session after conflict', fetchError);
        return null;
      }

      if (existing) {
        console.log('[chatSessions] Returning existing session');
        return mapSession(existing);
      }
      return null;
    }

    // If table doesn't exist or has wrong structure, try fallback to old sessions table
    if (insertError.code === '42P01' || insertError.code === '42703' || insertError.code === '42702') {
      console.log('[chatSessions] Channel table not available or wrong structure, creating in fallback sessions table', insertError);
      const { data: fallbackCreated, error: fallbackError } = await supabase
        .from('sessions')
        .insert({ 
          external_session_id: externalSessionId,
          brand: brand,
          channel: channel,
          channel_data: {},
        })
        .select('*')
        .single();
      
      if (fallbackError) {
        console.error('[Supabase] Failed to create session in fallback table', fallbackError);
        return null;
      }
      
      if (fallbackCreated) {
        return mapSession(fallbackCreated);
      }
    } else {
      // Log detailed error information for debugging
      console.error('[Supabase] Failed to create session', { 
        error: insertError, 
        code: insertError.code,
        message: insertError.message,
        details: insertError.details,
        hint: insertError.hint,
        tableName,
        insertData
      });
      
      // If it's a NOT NULL constraint error (23502), try with minimal fields only
      // This happens when lead_id is required but we don't have customer data yet
      if (insertError.code === '23502' || insertError.code === '42702' || insertError.code === '42703') {
        console.log('[chatSessions] Trying minimal insert (external_session_id and brand only) - constraint violation detected');
        const minimalInsert: Record<string, any> = {
          external_session_id: externalSessionId,
          brand: brand,
        };
        
        // Don't include lead_id, session_status, or channel_data if they're causing issues
        // Let database defaults handle them
        
        const { data: minimalCreated, error: minimalError } = await supabase
          .from(tableName)
          .insert(minimalInsert)
          .select('*')
          .single();
        
        if (minimalError) {
          // If still failing, try fallback to old sessions table
          if (minimalError.code === '23502' || minimalError.code === '42P01') {
            console.log('[chatSessions] Minimal insert failed, trying fallback to sessions table');
            const { data: fallbackCreated, error: fallbackError } = await supabase
              .from('sessions')
              .insert({ 
                external_session_id: externalSessionId,
                brand: brand,
                channel: channel,
                channel_data: {},
              })
              .select('*')
              .single();
            
            if (fallbackError) {
              console.error('[Supabase] Failed to create session in fallback table', fallbackError);
              return null;
            }
            
            if (fallbackCreated) {
              return mapSession(fallbackCreated);
            }
          }
          console.error('[Supabase] Failed to create session with minimal fields', minimalError);
          return null;
        }
        
        if (minimalCreated) {
          return mapSession(minimalCreated);
        }
      }
      
      return null;
    }
  }

  if (created) {
    return mapSession(created);
  }

  return null;
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
  console.log('[updateSessionProfile] Called', { externalSessionId, brand, profile });
  
  const supabase = getSupabaseClient(brand);
  if (!supabase) {
    console.warn('[chatSessions] Supabase client unavailable in updateSessionProfile', { brand });
    return;
  }

  // Ensure session exists first
  const session = await ensureSession(externalSessionId, 'web', brand);
  console.log('[updateSessionProfile] Session ensured', { sessionId: session?.id, externalSessionId });

  // Build updates object with new column names (customer_name, customer_email, customer_phone)
  const updates: Record<string, string | null | undefined> = {};
  if (typeof profile.userName === 'string') {
    updates.customer_name = profile.userName.trim() || null;
  }
  if (profile.phone !== undefined) {
    updates.customer_phone = profile.phone ? profile.phone.trim() : null;
  }
  if (profile.email !== undefined) {
    updates.customer_email = profile.email ? profile.email.trim() : null;
  }
  if (profile.websiteUrl !== undefined) {
    updates.website_url = profile.websiteUrl ? profile.websiteUrl.trim() : null;
  }
  
  console.log('[updateSessionProfile] Updates to apply', { updates, updateCount: Object.keys(updates).length });
  
  // If no updates to make, return early
  if (Object.keys(updates).length === 0) {
    console.warn('[updateSessionProfile] No updates to apply, returning early');
    return;
  }

  const tableName = getChannelTable('web');

  // Perform the update
  console.log('[updateSessionProfile] Executing Supabase update', { externalSessionId, updates });
  const { data, error } = await supabase
    .from(tableName)
    .update(updates)
    .eq('external_session_id', externalSessionId)
    .select();

  if (error) {
    // Fallback to old sessions table if web_sessions doesn't exist
    if (error.code === '42P01' || error.code === '42703') {
      console.log('[updateSessionProfile] Trying fallback to sessions table');
      const fallbackUpdates: Record<string, string | null | undefined> = {};
      if (typeof profile.userName === 'string') {
        fallbackUpdates.user_name = profile.userName.trim() || null;
      }
      if (profile.phone !== undefined) {
        fallbackUpdates.phone = profile.phone ? profile.phone.trim() : null;
      }
      if (profile.email !== undefined) {
        fallbackUpdates.email = profile.email ? profile.email.trim() : null;
      }
      if (profile.websiteUrl !== undefined) {
        fallbackUpdates.website_url = profile.websiteUrl ? profile.websiteUrl.trim() : null;
      }
      
      const { error: fallbackError } = await supabase
        .from('sessions')
        .update(fallbackUpdates)
        .eq('external_session_id', externalSessionId);
      
      if (fallbackError) {
        console.error('[Supabase] Failed to update session profile (fallback)', { error: fallbackError, externalSessionId });
        return;
      }
    } else {
      console.error('[Supabase] Failed to update session profile', { error, externalSessionId, updates });
      return;
    }
  }

  console.log('[updateSessionProfile] Update successful', { externalSessionId, updatedRows: data?.length });

  // Ensure all_leads record exists/updated after profile update and link it
  if (profile.userName || profile.email || profile.phone) {
    const leadId = await ensureAllLeads(
      profile.userName || null,
      profile.email || null,
      profile.phone || null,
      brand
    );

    // Update web_sessions with lead_id if we got one
    if (leadId) {
      const { error: leadIdError } = await supabase
        .from(tableName)
        .update({ lead_id: leadId })
        .eq('external_session_id', externalSessionId);

      if (leadIdError && leadIdError.code !== '42702') { // Ignore "column doesn't exist" errors
        console.warn('[updateSessionProfile] Failed to update lead_id', leadIdError);
      }
    }
  }

  // After successful update, check if we now have a complete lead
  const { data: updatedSession } = await supabase
    .from(tableName)
    .select('customer_name, customer_email, customer_phone')
    .eq('external_session_id', externalSessionId)
    .maybeSingle();

  if (updatedSession) {
    const mergedProfile = {
      userName: updatedSession.customer_name ?? null,
      email: updatedSession.customer_email ?? null,
      phone: updatedSession.customer_phone ?? null,
    };
    const completeLead = isCompleteLead(mergedProfile);
    
    console.log('[Supabase] Session profile updated', { 
      externalSessionId,
      completeLead,
      hasName: Boolean(mergedProfile.userName?.trim()),
      hasEmail: Boolean(mergedProfile.email?.trim()),
      hasPhone: Boolean(mergedProfile.phone?.trim()),
      userName: mergedProfile.userName,
      email: mergedProfile.email,
      phone: mergedProfile.phone,
    });
  } else {
    console.warn('[updateSessionProfile] Could not fetch updated session', { externalSessionId });
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

  // First, ensure session exists (create if it doesn't)
  await ensureSession(externalSessionId, 'web', brand);

  const tableName = getChannelTable('web');

  // Always save user input, regardless of lead completeness
  // This ensures all conversations are tracked in web_sessions
  // The lead can be completed later, but we want to capture all interactions

  // Fetch current session to get existing user_inputs_summary
  const { data: currentSession, error: fetchError } = await supabase
    .from(tableName)
    .select('user_inputs_summary, message_count')
    .eq('external_session_id', externalSessionId)
    .maybeSingle();

  if (fetchError) {
    // Try fallback
    if (fetchError.code === '42P01' || fetchError.code === '42703') {
      const { data: fallbackSession, error: fallbackError } = await supabase
        .from('sessions')
        .select('user_inputs_summary, message_count')
        .eq('external_session_id', externalSessionId)
        .maybeSingle();
      
      if (fallbackError || !fallbackSession) {
        console.error('[Supabase] Failed to fetch session for addUserInput', fallbackError || 'Session not found');
        return;
      }
      
      const existingInputs: UserInput[] = Array.isArray(fallbackSession?.user_inputs_summary) 
        ? fallbackSession.user_inputs_summary 
        : [];
      
      const newInput: UserInput = {
        input: input.trim(),
        intent: intent,
        created_at: new Date().toISOString(),
      };
      
      const updatedInputs = [...existingInputs, newInput].slice(-20);
      const messageCount = (fallbackSession?.message_count ?? 0) + 1;

      const { error } = await supabase
        .from('sessions')
        .update({
          user_inputs_summary: updatedInputs,
          message_count: messageCount,
          last_message_at: new Date().toISOString(),
        })
        .eq('external_session_id', externalSessionId);

      if (error) {
        console.error('[Supabase] Failed to add user input', error);
      }
      return;
    }
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
    .from(tableName)
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
  console.log('[upsertSummary] Called', { externalSessionId, brand, summaryLength: summary.length });
  
  const supabase = getSupabaseClient(brand);
  if (!supabase) {
    console.warn('[chatSessions] Supabase client unavailable in upsertSummary', { brand });
    return;
  }

  // Ensure session exists first
  await ensureSession(externalSessionId, 'web', brand);

  const tableName = getChannelTable('web');

  // Always update summary (don't require complete lead)
  // Summaries are useful for maintaining conversation context even before lead is complete
  console.log('[upsertSummary] Updating summary', { externalSessionId, summaryLength: summary.length });
  
  const { data, error } = await supabase
    .from(tableName)
    .update({
      conversation_summary: summary,
      last_message_at: lastMessageCreatedAt,
    })
    .eq('external_session_id', externalSessionId)
    .select();

  if (error) {
    // Fallback to old sessions table
    if (error.code === '42P01' || error.code === '42703') {
      const { error: fallbackError } = await supabase
        .from('sessions')
        .update({
          conversation_summary: summary,
          last_message_at: lastMessageCreatedAt,
        })
        .eq('external_session_id', externalSessionId);
      
      if (fallbackError) {
        console.error('[Supabase] Failed to upsert summary (fallback)', { error: fallbackError, externalSessionId });
      } else {
        console.log('[Supabase] Successfully updated summary (fallback)', { externalSessionId });
      }
    } else {
      console.error('[Supabase] Failed to upsert summary', { error, externalSessionId });
    }
  } else {
    console.log('[Supabase] Successfully updated summary', { externalSessionId, updatedRows: data?.length });
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

  const tableName = getChannelTable('web');

  const { data, error } = await supabase
    .from(tableName)
    .select('conversation_summary, last_message_at')
    .eq('external_session_id', externalSessionId)
    .maybeSingle();

  if (error) {
    // Fallback to old sessions table
    if (error.code === '42P01' || error.code === '42703') {
      const { data: fallbackData, error: fallbackError } = await supabase
        .from('sessions')
        .select('conversation_summary, last_message_at')
        .eq('external_session_id', externalSessionId)
        .maybeSingle();
      
      if (fallbackError) {
        console.error('[Supabase] Failed to fetch summary (fallback)', fallbackError);
        return null;
      }
      
      if (!fallbackData || !fallbackData.conversation_summary) return null;
      
      return {
        summary: fallbackData.conversation_summary,
        lastMessageCreatedAt: fallbackData.last_message_at || new Date().toISOString(),
      };
    }
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

  const tableName = getChannelTable('web');

  // Only store booking for complete leads
  const { data: existingSession, error: sessionError } = await supabase
    .from(tableName)
    .select('customer_name, customer_email, customer_phone')
    .eq('external_session_id', externalSessionId)
    .maybeSingle();

  let isComplete = false;
  if (sessionError && (sessionError.code === '42P01' || sessionError.code === '42703')) {
    const { data: fallbackSession } = await supabase
      .from('sessions')
      .select('user_name, email, phone')
      .eq('external_session_id', externalSessionId)
      .maybeSingle();
    
    isComplete = fallbackSession && 
      fallbackSession.user_name?.trim() && 
      fallbackSession.email?.trim() && 
      fallbackSession.phone?.trim();
  } else if (existingSession) {
    isComplete = existingSession.customer_name?.trim() && 
      existingSession.customer_email?.trim() && 
      existingSession.customer_phone?.trim();
  }

  if (!isComplete) {
    if (process.env.NODE_ENV !== 'production') {
      console.log('[chatSessions] Skipping booking storage - incomplete lead');
    }
    return;
  }

  const { error } = await supabase
    .from(tableName)
    .update({
      booking_date: booking.date,
      booking_time: booking.time,
      google_event_id: booking.googleEventId ?? null,
      booking_status: booking.status ?? 'confirmed',
      booking_created_at: new Date().toISOString(),
    })
    .eq('external_session_id', externalSessionId);

  if (error) {
    // Fallback to old sessions table
    if (error.code === '42P01' || error.code === '42703') {
      const { error: fallbackError } = await supabase
        .from('sessions')
        .update({
          booking_date: booking.date,
          booking_time: booking.time,
          google_event_id: booking.googleEventId ?? null,
          booking_status: booking.status ?? 'confirmed',
          booking_created_at: new Date().toISOString(),
        })
        .eq('external_session_id', externalSessionId);
      
      if (fallbackError) {
        console.error('[Supabase] Failed to store booking (fallback)', fallbackError);
      }
    } else {
      console.error('[Supabase] Failed to store booking', error);
    }
  }
}

export async function checkExistingBooking(
  phone?: string | null,
  email?: string | null,
  brand: 'proxe' | 'windchasers' = 'proxe'
): Promise<{
  exists: boolean;
  bookingDate?: string | null;
  bookingTime?: string | null;
  bookingStatus?: 'pending' | 'confirmed' | 'cancelled' | null;
  bookingCreatedAt?: string | null;
} | null> {
  const supabase = getSupabaseClient(brand);
  if (!supabase) {
    console.warn('[chatSessions] Supabase client unavailable in checkExistingBooking', { brand });
    return null;
  }

  if (!phone && !email) {
    return { exists: false };
  }

  const tableName = getChannelTable('web');

  try {
    // Normalize phone number if provided (remove spaces, dashes, parentheses)
    const normalizedPhone = phone ? phone.replace(/[\s\-\(\)]/g, '').replace(/^\+91/, '').replace(/^0/, '') : null;

    // Build query - check by phone or email
    // Try phone first, then email, then both
    let data = null;
    let error = null;

    if (normalizedPhone) {
      // Try by phone
      const { data: phoneData, error: phoneError } = await supabase
        .from(tableName)
        .select('booking_date, booking_time, booking_status, booking_created_at')
        .eq('brand', brand.toLowerCase())
        .eq('customer_phone', phone)
        .not('booking_date', 'is', null)
        .not('booking_time', 'is', null)
        .order('booking_created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (phoneData && phoneData.booking_date) {
        data = phoneData;
      } else {
        // Try normalized phone
        const { data: normalizedData, error: normalizedError } = await supabase
          .from(tableName)
          .select('booking_date, booking_time, booking_status, booking_created_at')
          .eq('brand', brand.toLowerCase())
          .eq('customer_phone_normalized', normalizedPhone)
          .not('booking_date', 'is', null)
          .not('booking_time', 'is', null)
          .order('booking_created_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        
        if (normalizedData && normalizedData.booking_date) {
          data = normalizedData;
        } else {
          error = normalizedError || phoneError;
        }
      }
    }

    // If no phone match and email provided, try email
    if (!data && email) {
      const { data: emailData, error: emailError } = await supabase
        .from(tableName)
        .select('booking_date, booking_time, booking_status, booking_created_at')
        .eq('brand', brand.toLowerCase())
        .eq('customer_email', email)
        .not('booking_date', 'is', null)
        .not('booking_time', 'is', null)
        .order('booking_created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (emailData && emailData.booking_date) {
        data = emailData;
      } else {
        error = emailError || error;
      }
    }

    if (error) {
      // Fallback to old sessions table
      if (error.code === '42P01' || error.code === '42703') {
        // Try phone first in fallback
        let fallbackData = null;
        let fallbackError = null;

        if (phone) {
          const { data: phoneData, error: phoneErr } = await supabase
            .from('sessions')
            .select('booking_date, booking_time, booking_status, booking_created_at')
            .eq('brand', brand.toLowerCase())
            .eq('phone', phone)
            .not('booking_date', 'is', null)
            .not('booking_time', 'is', null)
            .order('booking_created_at', { ascending: false })
            .limit(1)
            .maybeSingle();
          
          if (phoneData && phoneData.booking_date) {
            fallbackData = phoneData;
          } else {
            fallbackError = phoneErr;
          }
        }

        // If no phone match, try email
        if (!fallbackData && email) {
          const { data: emailData, error: emailErr } = await supabase
            .from('sessions')
            .select('booking_date, booking_time, booking_status, booking_created_at')
            .eq('brand', brand.toLowerCase())
            .eq('email', email)
            .not('booking_date', 'is', null)
            .not('booking_time', 'is', null)
            .order('booking_created_at', { ascending: false })
            .limit(1)
            .maybeSingle();
          
          if (emailData && emailData.booking_date) {
            fallbackData = emailData;
          } else {
            fallbackError = emailErr || fallbackError;
          }
        }

        if (fallbackError || !fallbackData) {
          return { exists: false };
        }

        return {
          exists: true,
          bookingDate: fallbackData.booking_date,
          bookingTime: fallbackData.booking_time,
          bookingStatus: fallbackData.booking_status,
          bookingCreatedAt: fallbackData.booking_created_at,
        };
      }

      console.error('[Supabase] Failed to check existing booking', error);
      return { exists: false };
    }

    if (!data || !data.booking_date || !data.booking_time) {
      return { exists: false };
    }

    return {
      exists: true,
      bookingDate: data.booking_date,
      bookingTime: data.booking_time,
      bookingStatus: data.booking_status,
      bookingCreatedAt: data.booking_created_at,
    };
  } catch (error) {
    console.error('[chatSessions] Error checking existing booking', error);
    return { exists: false };
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

  const tableName = getChannelTable('web');

  // Fetch current channel_data to merge
  const { data: session, error: fetchError } = await supabase
    .from(tableName)
    .select('channel_data')
    .eq('external_session_id', externalSessionId)
    .maybeSingle();

  if (fetchError) {
    // Fallback to old sessions table
    if (fetchError.code === '42P01' || fetchError.code === '42703') {
      const { data: fallbackSession, error: fallbackError } = await supabase
        .from('sessions')
        .select('channel_data')
        .eq('external_session_id', externalSessionId)
        .maybeSingle();
      
      if (fallbackError) {
        console.error('[Supabase] Failed to fetch session for updateChannelData (fallback)', fallbackError);
        return;
      }
      
      const currentData = fallbackSession?.channel_data ?? {};
      const mergedData = { ...currentData, ...channelData };

      const { error } = await supabase
        .from('sessions')
        .update({ channel_data: mergedData })
        .eq('external_session_id', externalSessionId);

      if (error) {
        console.error('[Supabase] Failed to update channel data (fallback)', error);
      }
      return;
    }
    console.error('[Supabase] Failed to fetch session for updateChannelData', fetchError);
    return;
  }

  const currentData = session?.channel_data ?? {};
  const mergedData = { ...currentData, ...channelData };

  const { error } = await supabase
    .from(tableName)
    .update({ channel_data: mergedData })
    .eq('external_session_id', externalSessionId);

  if (error) {
    console.error('[Supabase] Failed to update channel data', error);
  }
}
