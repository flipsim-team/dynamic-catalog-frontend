import { createClient } from "@supabase/supabase-js";

export const SUPABASE_URL = "https://lkvbsgtgyppvzcfjkwja.supabase.co";
export const SUPABASE_PUBLISHABLE_KEY =
  "sb_publishable_mts108-fx7W3gGmG602XgA_sBw1LBUw";

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
