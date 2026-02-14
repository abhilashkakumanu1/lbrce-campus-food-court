/**
 * API Client (api.js)
 * Uses config.js: API_BASE_URL, STORAGE_KEYS. Load config.js before this script.
 */
async function apiRequest(endpoint, options = {}) {
  const resolved = typeof endpoint === 'function' ? endpoint() : endpoint;
  const url = (typeof resolved === 'string' && resolved.startsWith('http'))
    ? resolved
    : (typeof API_BASE_URL !== 'undefined' ? API_BASE_URL : '') + resolved;

  const token = (typeof STORAGE_KEYS !== 'undefined' && localStorage.getItem(STORAGE_KEYS.token))
    || localStorage.getItem('token') || null;
  const headers = Object.assign(
    { 'Content-Type': 'application/json' },
    options.headers || {},
    token ? { Authorization: `Bearer ${token}` } : {}
  );

  const fetchOptions = {
    method: options.method || 'GET',
    headers,
  };
  if (options.body != null) fetchOptions.body = JSON.stringify(options.body);

  const res = await fetch(url, fetchOptions);
  const ct = res.headers.get('content-type') || '';
  const isJson = ct.includes('application/json');

  if (!res.ok) {
    const text = await res.text();
    const err = isJson ? (JSON.parse(text).error || text) : (text || `${res.status} ${res.statusText}`);
    throw new Error(typeof err === 'string' ? err : JSON.stringify(err));
  }

  if (isJson) return res.json();
  return res.text();
}
