// admin.js - simple admin dashboard to view menu and orders
document.addEventListener('DOMContentLoaded', async () => {
  if (!isAuthenticated() || !(getCurrentUser() && getCurrentUser().role === 'admin')) {
    window.location.href = 'login.html';
    return;
  }
  loadAdminMenu();
  loadAdminOrders();
});

async function loadAdminMenu() {
  const el = document.getElementById('admin-menu-list');
  if (!el) return;
  try {
    const menu = await apiRequest(API_ENDPOINTS.adminMenu);
    const items = Array.isArray(menu) ? menu : (menu.items || []);
    el.innerHTML = items.map(i => `
      <div class="card mb-2"><div class="card-body d-flex justify-content-between">
        <div><strong>${i.name}</strong><div class="text-muted">₹${i.price||0}</div></div>
      </div></div>
    `).join('');
  } catch (e) { el.innerHTML = '<p class="text-danger">Failed to load admin menu</p>'; }
}

async function loadAdminOrders() {
  const el = document.getElementById('admin-orders-list');
  if (!el) return;
  try {
    const orders = await apiRequest(API_ENDPOINTS.adminOrders);
    el.innerHTML = (orders||[]).map(o => `
      <div class="card mb-2"><div class="card-body">
        <h6>Order #${o.id}</h6>
        <p class="mb-0">User: ${o.user?.name || 'N/A'}</p>
        <p class="mb-0">Items: ${(o.items||[]).map(i=>i.name).join(', ')}</p>
      </div></div>
    `).join('');
  } catch (e) { el.innerHTML = '<p class="text-danger">Failed to load admin orders</p>'; }
}
/**
 * Admin Dashboard Logic (admin.html)
 * ==================================
 * Manages order approval/rejection, stats display, and order management.
 */

// ──────────────────────────────────────────────
// Mock API Data (Replace with real API calls)
// ──────────────────────────────────────────────
let stats = {
  todayOrders: 32,
  pendingOrders: 3,
  revenue: 5400,
  popularItem: "Veg Pizza (18)"
};

let pendingOrders = [
  {
    id: 101,
    student: "Rahul",
    phone: "9876543210",
    stall: "Pizza Corner",
    items: ["Veg Pizza x2", "Garlic Bread x1"],
    amount: 300,
    timeAgo: "5 minutes ago",
    image: "https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?w=100&h=100&fit=crop"
  },
  {
    id: 102,
    student: "Priya",
    phone: "9123456789",
    stall: "South Indian Corner",
    items: ["Masala Dosa x1", "Filter Coffee x2"],
    amount: 180,
    timeAgo: "3 minutes ago",
    image: "https://images.unsplash.com/photo-1585624798973-adf1ef931d1c?w=100&h=100&fit=crop"
  },
  {
    id: 103,
    student: "Arjun",
    phone: "9987654321",
    stall: "Meals & Curries",
    items: ["Chicken Biryani x1"],
    amount: 200,
    timeAgo: "2 minutes ago",
    image: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=100&h=100&fit=crop"
  }
];

let orders = [
  { id: 101, student: "Rahul", stall: "Pizza", amount: 300, status: "Pending", time: "12:05" },
  { id: 102, student: "Anu", stall: "Meals", amount: 120, status: "Approved", time: "12:10" }
];

let selectedOrderId = null;

// ──────────────────────────────────────────────
// Auth Guard
// ──────────────────────────────────────────────
function requireAdmin() {
  const user = typeof getCurrentUser === 'function' ? getCurrentUser() : (() => {
    try { return JSON.parse(localStorage.getItem(typeof STORAGE_KEYS !== 'undefined' ? STORAGE_KEYS.user : 'user') || '{}'); } catch (e) { return {}; }
  })();
  if (!user || !user.id || user.role !== 'admin') {
    window.location.href = 'index.html';
  }
}

// ──────────────────────────────────────────────
// Render Stats Cards
// ──────────────────────────────────────────────
function renderStats() {
  const row = document.getElementById('statsRow');
  row.innerHTML = `
    ${createStatCard('bi-bag', "Today's Orders", stats.todayOrders)}
    ${createStatCard('bi-clock', 'Pending', stats.pendingOrders, stats.pendingOrders > 0 ? 'border-warning' : '')}
    ${createStatCard('bi-currency-rupee', 'Revenue', '₹' + stats.revenue)}
    ${createStatCard('bi-star', 'Popular', stats.popularItem)}
  `;
}

function createStatCard(icon, title, value, extra = '') {
  return `
    <div class="col-md-3">
      <div class="card p-3 ${extra}">
        <div class="d-flex justify-content-between">
          <div>
            <small>${title}</small>
            <h4>${value}</h4>
          </div>
          <i class="bi ${icon} fs-3 text-muted"></i>
        </div>
      </div>
    </div>
  `;
}

// ──────────────────────────────────────────────
// Render Pending Orders
// ──────────────────────────────────────────────
function renderPending() {
  document.getElementById('pendingCount').textContent = pendingOrders.length;
  const container = document.getElementById('pendingOrders');

  if (pendingOrders.length === 0) {
    container.innerHTML = '<div class="col-12"><p class="text-muted">No pending orders</p></div>';
    return;
  }

  container.innerHTML = pendingOrders.map(o => `
    <div class="col-md-4">
      <div class="card p-3 h-100">
        <div class="d-flex gap-2 mb-2">
          <img src="${o.image || 'https://via.placeholder.com/60'}" 
               class="rounded" 
               style="width: 60px; height: 60px; object-fit: cover;"
               alt="${o.stall}">
          <div>
            <h6>${o.student}</h6>
            <small class="text-muted">${o.phone}</small>
          </div>
        </div>
        <small class="text-primary fw-bold">${o.stall}</small>
        <ul class="small mt-2 mb-2">
          ${o.items.map(i => `<li>${i}</li>`).join('')}
        </ul>
        <div class="d-flex justify-content-between align-items-center mb-2">
          <strong>₹${o.amount}</strong>
          <small class="text-muted">${o.timeAgo}</small>
        </div>
        <div class="d-flex gap-2">
          <button class="btn btn-success btn-sm flex-grow-1" onclick="openApprove(${o.id})">✓ Approve</button>
          <button class="btn btn-danger btn-sm flex-grow-1" onclick="openReject(${o.id})">✗ Reject</button>
        </div>
      </div>
    </div>
  `).join('');
}

// ──────────────────────────────────────────────
// Open Approve Modal
// ──────────────────────────────────────────────
function openApprove(id) {
  selectedOrderId = id;
  document.getElementById('estTime').value = '15';
  new bootstrap.Modal(document.getElementById('approveModal')).show();
}

// ──────────────────────────────────────────────
// Open Reject Modal
// ──────────────────────────────────────────────
function openReject(id) {
  selectedOrderId = id;
  document.getElementById('rejectReason').value = '';
  new bootstrap.Modal(document.getElementById('rejectModal')).show();
}

// ──────────────────────────────────────────────
// Approve Order
// ──────────────────────────────────────────────
function confirmApprove() {
  const estTime = document.getElementById('estTime').value;
  
  if (!estTime || estTime <= 0) {
    alert('Please enter a valid estimated time');
    return;
  }

  try {
    if (typeof apiRequest === 'function' && typeof API_ENDPOINTS !== 'undefined' && API_ENDPOINTS.adminApproveOrder) {
      await apiRequest(API_ENDPOINTS.adminApproveOrder(selectedOrderId), { method: 'POST', body: { estimated_time: parseInt(estTime, 10) } });
    }
  } catch (err) { console.warn('Approve API failed', err); }
  pendingOrders = pendingOrders.filter(o => o.id !== selectedOrderId);
  showToast(`Order Approved | Estimated: ${estTime} mins`);
  renderPending();
  bootstrap.Modal.getInstance(document.getElementById('approveModal')).hide();
}

// ──────────────────────────────────────────────
// Reject Order
// ──────────────────────────────────────────────
function confirmReject() {
  const reason = document.getElementById('rejectReason').value.trim();

  if (!reason) {
    alert('Please provide a reason for rejection');
    return;
  }

  try {
    if (typeof apiRequest === 'function' && typeof API_ENDPOINTS !== 'undefined' && API_ENDPOINTS.adminRejectOrder) {
      await apiRequest(API_ENDPOINTS.adminRejectOrder(selectedOrderId), { method: 'POST', body: { reason } });
    }
  } catch (err) { console.warn('Reject API failed', err); }
  pendingOrders = pendingOrders.filter(o => o.id !== selectedOrderId);
  showToast('Order Rejected');
  renderPending();
  bootstrap.Modal.getInstance(document.getElementById('rejectModal')).hide();
}

// ──────────────────────────────────────────────
// Render Recent Orders Table
// ──────────────────────────────────────────────
function renderOrders() {
  const body = document.getElementById('ordersTable');

  if (orders.length === 0) {
    body.innerHTML = '<tr><td colspan="7" class="text-center text-muted">No orders today</td></tr>';
    return;
  }

  body.innerHTML = orders.map(o => `
    <tr>
      <td>#${o.id}</td>
      <td>${o.student}</td>
      <td>${o.stall}</td>
      <td>₹${o.amount}</td>
      <td><span class="badge bg-secondary">${o.status}</span></td>
      <td>${o.time}</td>
      <td>
        ${o.status === 'Approved' ? '<button class="btn btn-sm btn-primary" onclick="markReady(' + o.id + ')">Mark Ready</button>' : ''}
        ${o.status === 'Ready' ? '<button class="btn btn-sm btn-success" onclick="completeOrder(' + o.id + ')">Complete</button>' : ''}
      </td>
    </tr>
  `).join('');
}

// ──────────────────────────────────────────────
// Mark Order Ready
// ──────────────────────────────────────────────
function markReady(orderId) {
  const order = orders.find(o => o.id === orderId);
  if (order) {
    order.status = 'Ready';
    renderOrders();
    showToast('Order marked as ready');
  }
}

// ──────────────────────────────────────────────
// Complete Order
// ──────────────────────────────────────────────
function completeOrder(orderId) {
  const order = orders.find(o => o.id === orderId);
  if (order) {
    order.status = 'Completed';
    renderOrders();
    showToast('Order completed');
  }
}

// ──────────────────────────────────────────────
// Show Toast Notification
// ──────────────────────────────────────────────
function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.querySelector('.toast-body').textContent = msg;
  new bootstrap.Toast(toast).show();
}

// ──────────────────────────────────────────────
// Initialize on Page Load
// ──────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // Require admin role
  requireAdmin();

  // Attach modal confirm buttons
  document.getElementById('confirmApprove').addEventListener('click', confirmApprove);
  document.getElementById('confirmReject').addEventListener('click', confirmReject);

  // Initial render
  renderStats();
  renderPending();
  renderOrders();

  // Auto-refresh pending orders every 15 seconds
  setInterval(() => {
    renderPending();
    renderStats();
  }, 15000);
});
