import {
  createClient,
  type PostgrestError,
  type SupabaseClient,
} from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_ROLE_KEY = import.meta.env.SUPABASE_SERVICE_ROLE_KEY as
  | string
  | undefined;
const STORAGE_KEY = "vmca.supabase.auth";

const memoryStorage = {
  getItem: (_key: string) => null,
  setItem: (_key: string, _value: string) => {
    // no-op in SSR / non-browser environments
  },
  removeItem: (_key: string) => {
    // no-op in SSR / non-browser environments
  },
};

let cachedClient: SupabaseClient | null = null;
let cachedAdminClient: SupabaseClient | null = null;

function getStorage() {
  if (typeof window === "undefined") {
    return memoryStorage;
  }
  return window.localStorage;
}

function ensureEnv() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error(
      "Missing Supabase env vars. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY."
    );
  }
}

export function getSupabaseClient() {
  if (cachedClient) {
    return cachedClient;
  }

  ensureEnv();

  cachedClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      storage: getStorage(),
      storageKey: STORAGE_KEY,
    },
    global: {
      headers: {
        "x-client-info": "vmca-web",
      },
    },
  });

  return cachedClient;
}

export function getSupabaseAdminClient() {
  // Fallback to anon client if no service key (e.g., local dev without secrets)
  if (!SUPABASE_SERVICE_ROLE_KEY) {
    return getSupabaseClient();
  }
  if (cachedAdminClient) {
    return cachedAdminClient;
  }
  ensureEnv();
  cachedAdminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      storage: getStorage(),
      storageKey: `${STORAGE_KEY}.admin`,
    },
    global: {
      headers: {
        "x-client-info": "vmca-web-admin",
      },
    },
  });
  return cachedAdminClient;
}

export function logSupabaseError(
  context: string,
  error: PostgrestError | Error | null
) {
  if (!error) return;
  const pgError = error as PostgrestError;
  const message =
    error instanceof Error
      ? error.message
      : (pgError.message ?? "Unknown Supabase error");
  console.error(`[Supabase] ${context}: ${message}`, error);
}
