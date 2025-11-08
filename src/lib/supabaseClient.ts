import { createClient, type SupabaseClient } from '@supabase/supabase-js';

export type SupabaseBrandKey = 'proxe' | 'windchasers';

const clientCache: Partial<Record<SupabaseBrandKey, SupabaseClient>> = {};

const clientConfig: Record<SupabaseBrandKey, { url?: string; anonKey?: string }> = {
  proxe: {
    url: process.env.NEXT_PUBLIC_PROXE_SUPABASE_URL ?? process.env.PROXE_SUPABASE_URL,
    anonKey: process.env.NEXT_PUBLIC_PROXE_SUPABASE_ANON_KEY ?? process.env.PROXE_SUPABASE_ANON_KEY,
  },
  windchasers: {
    url:
      process.env.NEXT_PUBLIC_WINDCHASERS_SUPABASE_URL ?? process.env.WINDCHASERS_SUPABASE_URL,
    anonKey:
      process.env.NEXT_PUBLIC_WINDCHASERS_SUPABASE_ANON_KEY ??
      process.env.WINDCHASERS_SUPABASE_ANON_KEY,
  },
};

export function getSupabaseClient(brand: SupabaseBrandKey): SupabaseClient | null {
  if (clientCache[brand]) {
    return clientCache[brand]!;
  }

  const config = clientConfig[brand];
  if (!config?.url || !config?.anonKey) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`[Supabase] Missing Supabase URL or anon key for brand "${brand}".`, {
        url: config?.url,
        anonKeyPresent: Boolean(config?.anonKey),
      });
    }
    return null;
  }

  if (process.env.NODE_ENV !== 'production') {
    console.log(`[Supabase] Creating client for brand "${brand}"`, {
      url: config.url?.replace(/(https?:\/\/)|\..*/g, '$1***'),
    });
  }

  const client = createClient(config.url, config.anonKey, {
    auth: {
      persistSession: false,
    },
  });

  clientCache[brand] = client;
  return client;
}

