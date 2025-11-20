import { NextRequest } from 'next/server';
import { getSupabaseClient } from '@/src/lib/supabaseClient';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const brand = searchParams.get('brand') || 'proxe';
    const externalSessionId = searchParams.get('externalSessionId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    const supabase = getSupabaseClient(brand as 'proxe' | 'windchasers');
    if (!supabase) {
      return Response.json(
        { error: 'Supabase client not configured for this brand' },
        { status: 500 }
      );
    }

    // Build query - use voice_sessions table (new structure)
    let query = supabase
      .from('voice_sessions')
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
      // Fallback to old sessions table if voice_sessions doesn't exist
      if (error.code === '42P01' || error.code === '42703') {
        console.log('[Voice Sessions API] voice_sessions table not found, using fallback');
        let fallbackQuery = supabase
          .from('sessions')
          .select('*')
          .eq('channel', 'voice')
          .order('created_at', { ascending: false });

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
          console.error('[Voice Sessions API] Fallback query error:', fallbackError);
          return Response.json(
            { error: 'Failed to fetch voice sessions', details: fallbackError.message },
            { status: 500 }
          );
        }

        // Get total count for pagination (fallback)
        let fallbackCountQuery = supabase
          .from('sessions')
          .select('*', { count: 'exact', head: true })
          .eq('channel', 'voice');

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
          channel: 'voice',
          pagination: {
            limit,
            offset,
            total: fallbackTotalCount || 0,
            hasMore: (fallbackTotalCount || 0) > offset + limit,
          },
          filters: {
            brand: brand || null,
            externalSessionId: externalSessionId || null,
            startDate: startDate || null,
            endDate: endDate || null,
          },
        });
      }

      console.error('[Voice Sessions API] Query error:', error);
      return Response.json(
        { error: 'Failed to fetch voice sessions', details: error.message },
        { status: 500 }
      );
    }

    // Get total count for pagination
    let countQuery = supabase
      .from('voice_sessions')
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
      channel: 'voice',
      pagination: {
        limit,
        offset,
        total: totalCount || 0,
        hasMore: (totalCount || 0) > offset + limit,
      },
      filters: {
        brand: brand || null,
        externalSessionId: externalSessionId || null,
        startDate: startDate || null,
        endDate: endDate || null,
      },
    });
  } catch (error: any) {
    console.error('[Voice Sessions API] Error:', error);
    return Response.json(
      { error: 'Error processing request', message: error.message },
      { status: 500 }
    );
  }
}

