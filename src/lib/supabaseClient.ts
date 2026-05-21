import { createClient } from "@supabase/supabase-js";

export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
export const SUPABASE_PUBLISHABLE_KEY = import.meta.env
  .VITE_SUPABASE_PUBLISHABLE_KEY;
// console.log("Supabase URL:", SUPABASE_URL);
// console.log("Supabase Publishable Key:", SUPABASE_PUBLISHABLE_KEY);
if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
  throw new Error("Missing Supabase environment variables.");
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
