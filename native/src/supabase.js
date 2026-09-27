// Supabase client — reuses the SAME backend as the PWA/web.
// The anon (publishable) key is public-safe; RLS protects data.
// DO NOT put the service_role key here.
export const SUPABASE_URL = 'https://qraplgjkmtyhxymgtpvw.supabase.co';
export const SUPABASE_ANON =
  'sb_publishable_rrYZ48rGgNaXmEnOLD0Y2g_LCAUjFBZ';

import { createClient } from '@supabase/supabase-js';
export const sb = createClient(SUPABASE_URL, SUPABASE_ANON, {
  auth: { persistSession: false },
});

// Public read view (filters supplier_whatsapp) — same as the web app.
export const PUBLIC_VIEW = 'listings_public';

export const BUCKET = 'listing-images';
