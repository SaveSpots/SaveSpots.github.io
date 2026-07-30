"use client";

/**
 * Browser Supabase client for the volunteer portal (singleton).
 * Sessions persist in localStorage.
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!client) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    // Fail with something actionable. Supabase's own error is just
    // "supabaseUrl is required", which says nothing about which of the two vars
    // is missing or where to set it — and it surfaces during a deploy build,
    // far from the code that caused it.
    if (!url || !anonKey) {
      throw new Error(
        "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and " +
          "NEXT_PUBLIC_SUPABASE_ANON_KEY in this environment " +
          "(local: apps/web/.env — deployed: the host's environment variables). " +
          `Currently missing: ${[
            !url && "NEXT_PUBLIC_SUPABASE_URL",
            !anonKey && "NEXT_PUBLIC_SUPABASE_ANON_KEY",
          ]
            .filter(Boolean)
            .join(", ")}.`,
      );
    }
    client = createClient(url, anonKey);
  }
  return client;
}
