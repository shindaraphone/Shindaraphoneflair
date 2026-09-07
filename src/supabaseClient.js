// supabaseClient.js
//
// A SEPARATE Supabase client used only by the admin portal
// (Admin.js, AdminLogin.jsx, ProtectedAdmin.jsx).
//
// Why this file exists: the admin portal and the customer storefront
// were sharing one Supabase client, which means they shared ONE
// login session in the browser's storage. Logging in as admin
// overwrote the customer's session (and vice versa) — that's the
// "admin login logs out the customer" bug.
//
// This client reuses your existing project's URL and key (pulled
// directly off the working customer client below, so there's no
// need to copy/paste them anywhere) but saves its session under a
// DIFFERENT storage key. That's the whole fix: two separate
// storage slots, so the two logins can never collide again.

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