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

    // Build query - filter by web channel
    let query = supabase
      .from('sessions')
      .select('*')
      .eq('channel', 'web')
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
      console.error('[Web Sessions API] Query error:', error);
      return Response.json(
        { error: 'Failed to fetch web sessions', details: error.message },
        { status: 500 }
      );
    }

    // Get total count for pagination
    let countQuery = supabase
      .from('sessions')
      .select('*', { count: 'exact', head: true })
      .eq('channel', 'web');

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
      channel: 'web',
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
    console.error('[Web Sessions API] Error:', error);
    return Response.json(
      { error: 'Error processing request', message: error.message },
      { status: 500 }
    );
  }
}

