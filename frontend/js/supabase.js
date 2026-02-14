/**
 * Supabase placeholder (supabase.js)
 * Optional. If you use Supabase, set SUPABASE_CONFIG in config.js and load the Supabase script before this file.
 */
function initSupabase() {
  if (typeof SUPABASE_CONFIG === 'undefined' || !window.supabase) return null;
  try {
    const client = window.supabase.createClient(SUPABASE_CONFIG.projectUrl, SUPABASE_CONFIG.anonKey);
    if (client) {
      client.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_IN' && session && session.user) {
          localStorage.setItem(typeof STORAGE_KEYS !== 'undefined' ? STORAGE_KEYS.user : 'user', JSON.stringify(session.user));
        } else if (event === 'SIGNED_OUT') {
          localStorage.removeItem(typeof STORAGE_KEYS !== 'undefined' ? STORAGE_KEYS.user : 'user');
          localStorage.removeItem(typeof STORAGE_KEYS !== 'undefined' ? STORAGE_KEYS.token : 'token');
        }
      });
    }
    return client;
  } catch (err) {
    return null;
  }
}
if (typeof window !== 'undefined') window.initSupabase = initSupabase;
