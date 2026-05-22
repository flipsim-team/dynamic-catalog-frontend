import { createClient } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";

export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
export const SUPABASE_PUBLISHABLE_KEY = import.meta.env
  .VITE_SUPABASE_PUBLISHABLE_KEY;

export class SupabaseConfigError extends Error {
  constructor() {
    super(
      "Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in your environment.",
    );
    this.name = "SupabaseConfigError";
  }
}

let supabaseClient: SupabaseClient | null = null;

export function getSupabaseClient() {
  if (supabaseClient) {
    return supabaseClient;
  }

  if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
    throw new SupabaseConfigError();
  }

  supabaseClient = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
  return supabaseClient;
}
