/**
 * Configuration File (config.js)
 * Centralized API base URL, endpoints, and storage keys. Change API_BASE_URL for production.
 */

// ──────────────────────────────────────────────
// API Configuration (change API_BASE_URL for production)
// ──────────────────────────────────────────────
const API_BASE_URL = 'http://localhost:5001/api';

const API_ENDPOINTS = {
  // Auth
  login: `${API_BASE_URL}/auth/login`,
  register: `${API_BASE_URL}/auth/register`,
  logout: `${API_BASE_URL}/auth/logout`,
  refreshToken: `${API_BASE_URL}/auth/refresh`,

  // Menu
  stalls: `${API_BASE_URL}/menu/stalls`,
  stallItems: (stallId) => `${API_BASE_URL}/menu/stalls/${stallId}/items`,
  menuItem: (itemId) => `${API_BASE_URL}/menu/items/${itemId}`,

  // Orders
  orders: `${API_BASE_URL}/orders`,
  orderDetail: (orderId) => `${API_BASE_URL}/orders/${orderId}`,
  orderStatus: (orderId) => `${API_BASE_URL}/orders/${orderId}/status`,

  // User
  profile: `${API_BASE_URL}/users/profile`,
  updateProfile: `${API_BASE_URL}/users/profile`,
  userOrders: `${API_BASE_URL}/users/orders`,

  // Admin
  adminStats: `${API_BASE_URL}/admin/stats`,
  adminPendingOrders: `${API_BASE_URL}/admin/orders/pending`,
  adminAllOrders: `${API_BASE_URL}/admin/orders`,
  adminApproveOrder: (orderId) => `${API_BASE_URL}/admin/orders/${orderId}/approve`,
  adminRejectOrder: (orderId) => `${API_BASE_URL}/admin/orders/${orderId}/reject`,
  adminAddMenuItem: (stallId) => `${API_BASE_URL}/admin/stalls/${stallId}/items`,
  adminUpdateMenuItem: (itemId) => `${API_BASE_URL}/admin/items/${itemId}`,
  adminDeleteMenuItem: (itemId) => `${API_BASE_URL}/admin/items/${itemId}`,
};

// ──────────────────────────────────────────────
// Supabase Configuration
// ──────────────────────────────────────────────
const SUPABASE_CONFIG = {
  projectUrl: 'https://your-project.supabase.co',
  anonKey: 'your-anon-key',
};

// ──────────────────────────────────────────────
// App Configuration
// ──────────────────────────────────────────────
const APP_CONFIG = {
  appName: 'LBRCE Food Court',
  environment: 'development',
  debug: true,
  cart: { maxItems: 50 },
  order: { defaultEstimatedTime: 15 },
  ui: { theme: 'light', itemsPerPage: 12 },
};

// ──────────────────────────────────────────────
// Storage Keys
// ──────────────────────────────────────────────
const STORAGE_KEYS = {
  user: 'lbrce_user',
  token: 'lbrce_token',
  cart: 'lbrce_cart',
};

// ──────────────────────────────────────────────
// Supabase Storage
// ──────────────────────────────────────────────
// Bucket name for menu item images
// const STORAGE_BUCKET = 'menu-images';

// -----------------------------
// Simple endpoint aliases
// These provide short names used by the frontend modules
// (keeps backward compatibility with modules that expect
// `API_ENDPOINTS.menu`, `API_ENDPOINTS.cart`, etc.)
// -----------------------------
API_ENDPOINTS.menu = `${API_BASE_URL}/menu`;
API_ENDPOINTS.cart = `${API_BASE_URL}/cart`;
API_ENDPOINTS.login = `${API_BASE_URL}/auth/login`;
API_ENDPOINTS.register = `${API_BASE_URL}/auth/register`;
API_ENDPOINTS.userOrders = `${API_BASE_URL}/users/orders`;
API_ENDPOINTS.adminMenu = `${API_BASE_URL}/admin/stalls`;
API_ENDPOINTS.adminOrders = `${API_BASE_URL}/admin/orders`;

