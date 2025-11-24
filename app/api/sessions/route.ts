import { NextRequest } from 'next/server';
import { getSupabaseClient } from '@/src/lib/supabaseClient';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const channel = searchParams.get('channel'); // web, voice, whatsapp, social
    const brand = searchParams.get('brand') || 'proxe';
    const externalSessionId = searchParams.get('externalSessionId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    const supabase = getSupabaseClient(brand as 'proxe');
    if (!supabase) {
      return Response.json(
        { error: 'Supabase client not configured for this brand' },
        { status: 500 }
      );
    }

    // Determine which table to query based on channel
    const channelTableMap: Record<string, string> = {
      web: 'web_sessions',
      voice: 'voice_sessions',
      whatsapp: 'whatsapp_sessions',
      social: 'social_sessions',
    };

    const tableName = channel ? (channelTableMap[channel] || 'sessions') : 'sessions';

    // Build query - use channel-specific table if channel is specified
    let query = supabase
      .from(tableName)
      .select('*')
      .order('created_at', { ascending: false });

    // Filter by brand
    if (brand) {
      query = query.eq('brand', brand.toLowerCase());
    }

    // Filter by external session ID
    if (externalSessionId) {
      query = query.eq('external_session_id', externalSessionId);
    }

    // Filter by date range
    if (startDate) {
      query = query.gte('created_at', startDate);
    }
    if (endDate) {
      query = query.lte('created_at', endDate);
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data, error } = await query;

    if (error) {
      // Fallback to old sessions table if channel table doesn't exist
      if ((error.code === '42P01' || error.code === '42703') && channel) {
        console.log(`[Sessions API] ${tableName} table not found, using fallback`);
        let fallbackQuery = supabase
          .from('sessions')
          .select('*')
          .order('created_at', { ascending: false });

        if (channel) {
          fallbackQuery = fallbackQuery.eq('channel', channel);
        }
        if (brand) {
          fallbackQuery = fallbackQuery.eq('brand', brand.toLowerCase());
        }
        if (externalSessionId) {
          fallbackQuery = fallbackQuery.eq('external_session_id', externalSessionId);
        }
        if (startDate) {
          fallbackQuery = fallbackQuery.gte('created_at', startDate);
        }
        if (endDate) {
          fallbackQuery = fallbackQuery.lte('created_at', endDate);
        }
        fallbackQuery = fallbackQuery.range(offset, offset + limit - 1);

        const { data: fallbackData, error: fallbackError } = await fallbackQuery;
        
        if (fallbackError) {
          console.error('[Sessions API] Fallback query error:', fallbackError);
          return Response.json(
            { error: 'Failed to fetch sessions', details: fallbackError.message },
            { status: 500 }
          );
        }

        // Get total count for pagination (fallback)
        let fallbackCountQuery = supabase
          .from('sessions')
          .select('*', { count: 'exact', head: true });

        if (channel) {
          fallbackCountQuery = fallbackCountQuery.eq('channel', channel);
        }
        if (brand) {
          fallbackCountQuery = fallbackCountQuery.eq('brand', brand.toLowerCase());
        }
        if (externalSessionId) {
          fallbackCountQuery = fallbackCountQuery.eq('external_session_id', externalSessionId);
        }
        if (startDate) {
          fallbackCountQuery = fallbackCountQuery.gte('created_at', startDate);
        }
        if (endDate) {
          fallbackCountQuery = fallbackCountQuery.lte('created_at', endDate);
        }

        const { count: fallbackTotalCount } = await fallbackCountQuery;

        return Response.json({
          sessions: fallbackData || [],
          pagination: {
            limit,
            offset,
            total: fallbackTotalCount || 0,
            hasMore: (fallbackTotalCount || 0) > offset + limit,
          },
          filters: {
            channel: channel || null,
            brand: brand || null,
            externalSessionId: externalSessionId || null,
            startDate: startDate || null,
            endDate: endDate || null,
          },
        });
      }

      console.error('[Sessions API] Query error:', error);
      return Response.json(
        { error: 'Failed to fetch sessions', details: error.message },
        { status: 500 }
      );
    }

    // Get total count for pagination (without limit)
    let countQuery = supabase
      .from(tableName)
      .select('*', { count: 'exact', head: true });

    if (brand) {
      countQuery = countQuery.eq('brand', brand.toLowerCase());
    }
    if (externalSessionId) {
      countQuery = countQuery.eq('external_session_id', externalSessionId);
    }
    if (startDate) {
      countQuery = countQuery.gte('created_at', startDate);
    }
    if (endDate) {
      countQuery = countQuery.lte('created_at', endDate);
    }

    const { count: totalCount } = await countQuery;

    return Response.json({
      sessions: data || [],
      pagination: {
        limit,
        offset,
        total: totalCount || 0,
        hasMore: (totalCount || 0) > offset + limit,
      },
      filters: {
        channel: channel || null,
        brand: brand || null,
        externalSessionId: externalSessionId || null,
        startDate: startDate || null,
        endDate: endDate || null,
      },
    });
  } catch (error: any) {
    console.error('[Sessions API] Error:', error);
    return Response.json(
      { error: 'Error processing request', message: error.message },
      { status: 500 }
    );
  }
}

