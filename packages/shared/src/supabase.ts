/**
 * Shared Supabase client factory.
 *
 * Each app calls createSavespotsClient with its own env-loaded url + anon key
 * (Next.js: process.env.NEXT_PUBLIC_*, Expo: process.env.EXPO_PUBLIC_*), so the
 * same query/auth code runs on web and mobile. Row-level security in Supabase
 * enforces "a host only sees/updates their own SaveBox" — never trust the client.
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export interface SavespotsClientConfig {
  url: string;
  anonKey: string;
}

export function createSavespotsClient(
  config: SavespotsClientConfig,
): SupabaseClient {
  if (!config.url || !config.anonKey) {
    throw new Error(
      "createSavespotsClient: missing Supabase url or anon key. " +
        "Set NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY (web) " +
        "or EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_ANON_KEY (mobile).",
    );
  }
  return createClient(config.url, config.anonKey);
}
