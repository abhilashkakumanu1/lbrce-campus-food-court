/**
 * Authentication (auth.js)
 * Uses config.js: API_ENDPOINTS, STORAGE_KEYS. Uses api.js: apiRequest. Load config and api before this script.
 */
function isAuthenticated() {
  const token = typeof STORAGE_KEYS !== 'undefined' ? localStorage.getItem(STORAGE_KEYS.token) : null;
  return !!token || !!localStorage.getItem('token');
}

function getCurrentUser() {
  try {
    const key = typeof STORAGE_KEYS !== 'undefined' ? STORAGE_KEYS.user : 'user';
    const raw = localStorage.getItem(key) || localStorage.getItem('user') || 'null';
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

function setAuth(user, token) {
  const sk = typeof STORAGE_KEYS !== 'undefined' ? STORAGE_KEYS : { user: 'user', token: 'token' };
  if (user) localStorage.setItem(sk.user, JSON.stringify(user));
  if (token) localStorage.setItem(sk.token, token);
}

function clearAuth() {
  const sk = typeof STORAGE_KEYS !== 'undefined' ? STORAGE_KEYS : { user: 'user', token: 'token', cart: 'cart' };
  localStorage.removeItem(sk.user);
  localStorage.removeItem(sk.token);
  localStorage.removeItem('user');
  localStorage.removeItem('token');
}

async function login(email, password) {
  const url = typeof API_ENDPOINTS !== 'undefined' ? API_ENDPOINTS.login : null;
  if (!url) throw new Error('API_ENDPOINTS not loaded');
  const response = await apiRequest(url, { method: 'POST', body: { email, password } });
  const token = response.token || response.accessToken || response.data?.token;
  const user = response.user || response.data?.user || response;
  if (token) setAuth(user, token);
  return response;
}

async function register() {
  let name, email, password, phone;
  if (arguments.length === 1 && typeof arguments[0] === 'object') {
    ({ name, email, password, phone } = arguments[0]);
  } else if (arguments.length === 3) {
    name = arguments[0];
    email = arguments[1];
    password = arguments[2];
    phone = '';
  } else if (arguments.length >= 4) {
    name = arguments[0];
    email = arguments[1];
    password = arguments[2];
    phone = arguments[3] || '';
  }
  if (!email || !password || !name) throw new Error('Missing registration fields');
  const url = typeof API_ENDPOINTS !== 'undefined' ? API_ENDPOINTS.register : null;
  if (!url) throw new Error('API_ENDPOINTS not loaded');
  const response = await apiRequest(url, { method: 'POST', body: { name, email, password, phone } });
  const token = response.token || response.accessToken || response.data?.token;
  const user = response.user || response.data?.user || response;
  if (token) setAuth(user, token);
  return response;
}

async function logout() {
  try {
    if (typeof API_ENDPOINTS !== 'undefined' && API_ENDPOINTS.logout) {
      await apiRequest(API_ENDPOINTS.logout, { method: 'POST' });
    }
  } catch (e) { /* ignore */ }
  finally {
    clearAuth();
    const sk = typeof STORAGE_KEYS !== 'undefined' ? STORAGE_KEYS : {};
    if (sk.cart) localStorage.removeItem(sk.cart);
    window.location.href = 'index.html';
  }
}

window.isAuthenticated = isAuthenticated;
window.getCurrentUser = getCurrentUser;
window.setAuth = setAuth;
window.clearAuth = clearAuth;
window.login = login;
window.register = register;
window.logout = logout;
