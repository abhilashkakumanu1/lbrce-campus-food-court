/**
 * Orders Page Logic (orders.js)
 * ==============================
 * Displays user's order history and order tracking.
 */

// ──────────────────────────────────────────────
// Mock Orders Data
// ──────────────────────────────────────────────
const mockOrders = [
  {
    id: 'ORD001',
    stall: 'Pizza Corner',
    items: [{ name: 'Veg Pizza', qty: 2, price: 150 }],
    amount: 300,
    status: 'Delivered',
    createdAt: '2026-02-10 12:30',
    deliveredAt: '2026-02-10 12:45',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?w=100&h=100&fit=crop'
  },
  {
    id: 'ORD002',
    stall: 'South Indian Corner',
    items: [{ name: 'Masala Dosa', qty: 1, price: 120 }],
    amount: 120,
    status: 'Delivered',
    createdAt: '2026-02-09 13:15',
    deliveredAt: '2026-02-09 13:35',
    rating: 4,
    image: 'https://images.unsplash.com/photo-1585624798973-adf1ef931d1c?w=100&h=100&fit=crop'
  },
  {
    id: 'ORD003',
    stall: 'Meals & Curries',
    items: [{ name: 'Chicken Biryani', qty: 1, price: 200 }],
    amount: 200,
    status: 'Ready',
    createdAt: '2026-02-13 11:00',
    estimatedTime: '15 mins',
    image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=100&h=100&fit=crop'
  }
];

// ──────────────────────────────────────────────
// Load Orders
// ──────────────────────────────────────────────
async function loadOrders() {
  const container = document.getElementById('ordersContainer');
  
  try {
    const orders = await apiRequest(API_ENDPOINTS.userOrders);
    if (!orders || orders.length === 0) {
      container.innerHTML = `
        <div class="text-center py-5">
          <p class="text-muted">No orders yet</p>
          <a href="index.html" class="btn btn-primary">Start Ordering</a>
        </div>
      `;
      return;
    }
    container.innerHTML = orders.map(order => renderOrderCard(order)).join('');
  } catch (error) {
    console.error('Error loading orders:', error);
    container.innerHTML = '<p class="text-danger">Failed to fetch orders. Please try again later.</p>';
  }
}

// ──────────────────────────────────────────────
// Render Order Card
// ──────────────────────────────────────────────
function renderOrderCard(order) {
  const statusBadge = {
    'Delivered': 'success',
    'Ready': 'warning',
    'Pending': 'info',
    'Cancelled': 'danger'
  }[order.status] || 'secondary';

  return `
    <div class="col-md-6 mb-3">
      <div class="card">
        <div class="card-body">
          <div class="d-flex gap-3 mb-3">
            <img 
              src="${order.image}" 
              class="rounded" 
              style="width: 80px; height: 80px; object-fit: cover;"
              alt="${order.stall}"
            >
            <div class="flex-grow-1">
              <h5 class="mb-1">${order.stall}</h5>
              <small class="text-muted">${order.createdAt}</small>
              <div>
                <span class="badge bg-${statusBadge}">${order.status}</span>
              </div>
            </div>
          </div>

          <ul class="small mb-2">
            ${order.items.map(item => `<li>${item.name} x${item.qty}</li>`).join('')}
          </ul>

          <div class="d-flex justify-content-between align-items-center">
            <strong>₹${order.amount}</strong>
            <button class="btn btn-sm btn-outline-primary" onclick="viewOrderDetail('${order.id}')">
              View Details
            </button>
          </div>

          ${order.status === 'Delivered' && !order.rating ? `
            <div class="mt-2">
              <small class="text-muted">Rate this order:</small>
              <div class="mt-1">
                ${[1,2,3,4,5].map(star => `
                  <i class="bi bi-star" onclick="rateOrder('${order.id}', ${star})" 
                     style="cursor: pointer; color: #ffc107;"></i>
                `).join('')}
              </div>
            </div>
          ` : ''}

          ${order.rating ? `
            <div class="mt-2">
              <small class="text-muted">Rated: ${order.rating} ⭐</small>
            </div>
          ` : ''}
        </div>
      </div>
    </div>
  `;
}

// ──────────────────────────────────────────────
// View Order Detail
// ──────────────────────────────────────────────
function viewOrderDetail(orderId) {
  window.location.href = `orders.html?id=${orderId}`;
}

// ──────────────────────────────────────────────
// Rate Order
// ──────────────────────────────────────────────
async function rateOrder(orderId, rating) {
  try {
    await apiRequest(API_ENDPOINTS.orderDetail(orderId), {
      method: 'PUT',
      body: { rating },
    });
    alert(`Thanks for rating! ⭐ ${rating}`);
    loadOrders();
  } catch (error) {
    alert('Failed to save rating');
  }
}

// ──────────────────────────────────────────────
// Update Navigation Bar
// ──────────────────────────────────────────────
function updateNavBar() {
  const user = typeof getCurrentUser === 'function' ? getCurrentUser() : (() => {
    try { return JSON.parse(localStorage.getItem(typeof STORAGE_KEYS !== 'undefined' ? STORAGE_KEYS.user : 'user') || 'null'); } catch (e) { return null; }
  })();
  const authButtons = document.getElementById('authButtons');
  const logoutBtn = document.getElementById('logoutBtn');
  if (authButtons) authButtons.classList.toggle('d-none', !!user);
  if (logoutBtn) logoutBtn.classList.toggle('d-none', !user);
  if (!user) setTimeout(() => { window.location.href = 'login.html'; }, 1000);
}

// ──────────────────────────────────────────────
// Initialize Page
// ──────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  updateNavBar();
  loadOrders();

  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', logout);
  }
});
