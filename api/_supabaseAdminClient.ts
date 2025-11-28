import { createClient, type SupabaseClient, type PostgrestError } from "@supabase/supabase-js";

const RAW_SUPABASE_URL = process.env.VITE_SUPABASE_URL ?? process.env.SUPABASE_URL;
const RAW_SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!RAW_SUPABASE_URL) {
  throw new Error("Missing Supabase URL. Set SUPABASE_URL or VITE_SUPABASE_URL in Vercel env.");
}

if (!RAW_SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("Missing Supabase service role key. Set SUPABASE_SERVICE_ROLE_KEY in Vercel env.");
}

const SUPABASE_URL = RAW_SUPABASE_URL as string;
const SUPABASE_SERVICE_ROLE_KEY = RAW_SUPABASE_SERVICE_ROLE_KEY as string;

export function getSupabaseServiceClient(): SupabaseClient {
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: {
      headers: {
        "x-client-info": "vmca-web-admin-api",
      },
    },
  });
}

export function logSupabaseError(context: string, error: PostgrestError | Error | null) {
  if (!error) return;
  const pgError = error as PostgrestError;
  const message = error instanceof Error ? error.message : pgError.message ?? "Unknown Supabase error";
  console.error(`[Supabase] ${context}: ${message}`, error);
}
