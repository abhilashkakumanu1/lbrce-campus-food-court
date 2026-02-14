/**
 * Admin Menu Management Logic (admin-menu.js)
 * ==========================================
 * Add, edit, and delete menu items for admin stalls.
 */

// ──────────────────────────────────────────────
// Mock Stalls Data
// ──────────────────────────────────────────────
const adminStalls = [
  { id: 1, name: 'Pizza Corner' },
  { id: 2, name: 'South Indian Corner' },
  { id: 3, name: 'Meals & Curries' }
];

// ──────────────────────────────────────────────
// Load Stalls (from API or mock)
// ──────────────────────────────────────────────
async function loadStallsForAdmin() {
  const stallSelect = document.getElementById('stallSelect');
  let stalls = adminStalls;
  try {
    if (typeof apiRequest === 'function' && typeof API_ENDPOINTS !== 'undefined' && (API_ENDPOINTS.adminMenu || API_ENDPOINTS.stalls)) {
      const data = await apiRequest(API_ENDPOINTS.adminMenu || API_ENDPOINTS.stalls);
      const arr = Array.isArray(data) ? data : (data.stalls || data.items || []);
      if (arr.length) stalls = arr;
    }
  } catch (e) { console.warn('Stalls API failed, using mock', e); }
  stallSelect.innerHTML = '<option value="">Select a stall</option>' +
    stalls.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
  stallSelect.addEventListener('change', (e) => {
    if (e.target.value) loadMenuItems(e.target.value);
  });
}

// ──────────────────────────────────────────────
// Load Menu Items for Stall
// ──────────────────────────────────────────────
async function loadMenuItems(stallId) {
  const container = document.getElementById('menuItemsContainer');
  
  try {
    let items = [];
    if (typeof apiRequest === 'function' && typeof API_ENDPOINTS !== 'undefined' && API_ENDPOINTS.stallItems) {
      try {
        const data = await apiRequest(API_ENDPOINTS.stallItems(stallId));
        items = Array.isArray(data) ? data : (data.items || []);
      } catch (err) { console.warn('Stall items API failed', err); }
    }
    if (items.length === 0) {
    const mockItems = {
      1: [
        { id: 1, name: 'Veg Pizza', price: 150, category: 'Main', available: true },
        { id: 2, name: 'Garlic Bread', price: 80, category: 'Snack', available: true }
      ],
      2: [
        { id: 3, name: 'Masala Dosa', price: 120, category: 'Main', available: true },
        { id: 4, name: 'Vada', price: 40, category: 'Snack', available: false }
      ],
      3: [
        { id: 6, name: 'Chicken Biryani', price: 200, category: 'Main', available: true }
      ]
    };
    items = mockItems[stallId] || [];
    }

    container.innerHTML = items.length === 0 ? 
      '<p class="text-muted">No items found</p>' :
      items.map(item => renderMenuItemRow(item)).join('');

  } catch (error) {
    console.error('Error loading menu items:', error);
  }
}

// ──────────────────────────────────────────────
// Render Menu Item Row
// ──────────────────────────────────────────────
function renderMenuItemRow(item) {
  return `
    <div class="card mb-2">
      <div class="card-body">
        <div class="row align-items-center">
          <div class="col-md-3">
            <strong>${item.name}</strong>
            <small class="text-muted d-block">${item.category}</small>
          </div>
          <div class="col-md-2">
            <span class="badge bg-success">₹${item.price}</span>
          </div>
          <div class="col-md-2">
            <input 
              type="checkbox" 
              class="form-check-input" 
              ${item.available ? 'checked' : ''}
              onchange="toggleItemAvailability(${item.id}, this.checked)"
            >
            <label class="form-check-label ms-2">Available</label>
          </div>
          <div class="col-md-3">
            <button class="btn btn-sm btn-warning" onclick="editMenuItem(${item.id})">Edit</button>
            <button class="btn btn-sm btn-danger" onclick="deleteMenuItem(${item.id})">Delete</button>
          </div>
        </div>
      </div>
    </div>
  `;
}

// ──────────────────────────────────────────────
// Add New Item
// ──────────────────────────────────────────────
async function addMenuItem() {
  const stallId = document.getElementById('stallSelect').value;
  const itemName = document.getElementById('itemName').value.trim();
  const itemPrice = document.getElementById('itemPrice').value;
  const itemCategory = document.getElementById('itemCategory').value;

  if (!stallId || !itemName || !itemPrice || !itemCategory) {
    alert('All fields are required');
    return;
  }

  try {
    const formData = {
      name: itemName,
      price: parseFloat(itemPrice),
      category: itemCategory,
      description: document.getElementById('itemDescription').value || '',
    };

    if (typeof apiRequest === 'function' && typeof API_ENDPOINTS !== 'undefined' && API_ENDPOINTS.adminAddMenuItem) {
      await apiRequest(API_ENDPOINTS.adminAddMenuItem(stallId), { method: 'POST', body: formData });
    }
    alert('Menu item added successfully!');

    // Clear form
    document.getElementById('itemName').value = '';
    document.getElementById('itemPrice').value = '';
    document.getElementById('itemCategory').value = '';
    document.getElementById('itemDescription').value = '';

    // Reload items
    loadMenuItems(stallId);
  } catch (error) {
    console.error('Error adding item:', error);
    alert('Failed to add menu item');
  }
}

// ──────────────────────────────────────────────
// Edit Menu Item
// ──────────────────────────────────────────────
function editMenuItem(itemId) {
  alert(`Edit functionality for item ${itemId} - TODO: Implement form modal`);
}

// ──────────────────────────────────────────────
// Delete Menu Item
// ──────────────────────────────────────────────
async function deleteMenuItem(itemId) {
  if (!confirm('Are you sure you want to delete this item?')) {
    return;
  }

  try {
    if (typeof apiRequest === 'function' && typeof API_ENDPOINTS !== 'undefined' && API_ENDPOINTS.adminDeleteMenuItem) {
      await apiRequest(API_ENDPOINTS.adminDeleteMenuItem(itemId), { method: 'DELETE' });
    }
    alert('Menu item deleted successfully!');

    const stallId = document.getElementById('stallSelect').value;
    loadMenuItems(stallId);
  } catch (error) {
    console.error('Error deleting item:', error);
    alert('Failed to delete menu item');
  }
}

// ──────────────────────────────────────────────
// Toggle Item Availability
// ──────────────────────────────────────────────
async function toggleItemAvailability(itemId, available) {
  try {
    // TODO: Call API to update availability
    console.log(`Item ${itemId} availability: ${available}`);
  } catch (error) {
    console.error('Error updating availability:', error);
  }
}

// ──────────────────────────────────────────────
// Auth Guard
// ──────────────────────────────────────────────
function requireAdmin() {
  const user = getCurrentUser();
  if (!user || user.role !== 'admin') {
    window.location.href = 'index.html';
  }
}

// ──────────────────────────────────────────────
// Initialize Page
// ──────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  requireAdmin();
  loadStallsForAdmin();

  // Attach button listeners
  document.getElementById('btnAddItem')?.addEventListener('click', addMenuItem);

  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', logout);
  }
});
