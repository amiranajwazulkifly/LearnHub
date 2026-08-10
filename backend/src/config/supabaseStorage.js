const { createClient } = require("@supabase/supabase-js");
const env = require("./env");

// Service-role client — bypasses storage RLS entirely, so every write goes
// through this backend after our own auth/ownership checks. Never expose
// this key to the frontend.
const supabase = createClient(env.supabaseUrl, env.supabaseServiceRoleKey, {
  auth: { persistSession: false },
});

module.exports = supabase;
