import { createClient } from "@supabase/supabase-js";
import { supabase as customerSupabase } from "./supabaseClient";

export const supabase = createClient(
  customerSupabase.supabaseUrl,
  customerSupabase.supabaseKey,
  {
    auth: {
      storageKey: "sb-shindara-admin-auth",
      persistSession: true,
      autoRefreshToken: true,
    },
  }
);
