/**
 * Service-role Supabase client. Server-only.
 *
 * The service role bypasses RLS entirely, so this key must never reach a
 * browser. `public.donations` has RLS on and no policies, which means the
 * service role is the ONLY way in — that is deliberate, and it is why this
 * module exists rather than reusing the browser client.
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

if (typeof window !== "undefined") {
  throw new Error(
    "lib/supabase-admin.ts is server-only. Importing it from a client component would ship the service-role key to the browser."
  );
}

let client: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
  if (!client) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !serviceKey) {
      throw new Error(
        "Supabase admin is not configured. Set NEXT_PUBLIC_SUPABASE_URL and " +
          "SUPABASE_SERVICE_ROLE_KEY in this environment. " +
          `Currently missing: ${[
            !url && "NEXT_PUBLIC_SUPABASE_URL",
            !serviceKey && "SUPABASE_SERVICE_ROLE_KEY",
          ]
            .filter(Boolean)
            .join(", ")}.`
      );
    }
    client = createClient(url, serviceKey, {
      // No session to persist or refresh in a serverless function, and
      // leaving these on makes the client try to write to storage that
      // does not exist.
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return client;
}
