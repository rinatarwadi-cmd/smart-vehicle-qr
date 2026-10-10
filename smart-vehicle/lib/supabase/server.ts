import { createClient, SupabaseClient } from "@supabase/supabase-js";

/**
 * SERVER-ONLY Supabase admin client factory.
 *
 * This client has full database access and MUST never be imported in
 * any file that gets bundled for the browser (client components, browser
 * route handlers, etc.).
 *
 * Safe locations:
 *  - Server Components (async components without "use client")
 *  - Route Handlers in app/api/** with no "use client" boundary
 *  - Server Actions (files with "use server" directive)
 *
 * The client is lazily instantiated per-call so that missing env vars
 * throw at call-time (inside a try/catch in the caller) rather than
 * crashing the entire module graph at startup.
 */
let _client: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
  if (_client) return _client;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error(
      "[Supabase] Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. " +
        "Add them to .env.local — see .env.example for the template."
    );
  }

  _client = createClient(url, serviceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return _client;
}
