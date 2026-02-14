/**
 * Home Page (index.html) – stalls list and nav. Uses config.js, api.js, auth.js.
 */
var mockStalls = [
  { id: 1, name: 'Pizza Corner', description: 'Delicious wood-fired pizzas and Italian cuisine', image_url: 'https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?w=400&h=200&fit=crop' },
  { id: 2, name: 'South Indian Corner', description: 'Authentic South Indian dishes - Dosas, Idli, Vada', image_url: 'https://images.unsplash.com/photo-1585624798973-adf1ef931d1c?w=400&h=200&fit=crop' },
  { id: 3, name: 'Meals & Curries', description: 'Traditional meals and variety of curries', image_url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=200&fit=crop' }
];

function renderStallCard(stall) {
  return '<div class="col-md-4"><div class="card h-100 shadow-sm">' +
    '<div style="height:200px;overflow:hidden;"><img src="' + (stall.image_url || 'https://via.placeholder.com/400x200') + '" class="card-img-top" alt="' + stall.name + '" style="width:100%;height:100%;object-fit:cover;" onerror="this.src=\'https://via.placeholder.com/400x200?text=' + stall.name + '\'"></div>' +
    '<div class="card-body"><h5 class="card-title">' + stall.name + '</h5><p class="card-text text-muted">' + (stall.description || '') + '</p>' +
    '<a href="menu.html?stall_id=' + stall.id + '" class="btn btn-primary w-100">View Menu →</a></div></div></div>';
}

function updateNavBar() {
  var user = typeof getCurrentUser === 'function' ? getCurrentUser() : (function() {
    try { return JSON.parse(localStorage.getItem(typeof STORAGE_KEYS !== 'undefined' ? STORAGE_KEYS.user : 'user') || 'null'); } catch (e) { return null; }
  })();
  var authButtons = document.getElementById('authButtons');
  var logoutBtn = document.getElementById('logoutBtn');
  var adminLink = document.getElementById('adminLink');
  if (authButtons) authButtons.classList.toggle('d-none', !!user);
  if (logoutBtn) logoutBtn.classList.toggle('d-none', !user);
  if (adminLink) adminLink.classList.toggle('d-none', !user || user.role !== 'admin');
  if (!user && authButtons) {
    var links = authButtons.querySelectorAll('a');
    if (links.length >= 2) { links[0].href = 'login.html'; links[1].href = 'login.html'; }
  }
}

async function loadStalls() {
  var spinner = document.getElementById('loadingSpinner');
  var emptyState = document.getElementById('emptyState');
  var stallList = document.getElementById('stallList');
  if (!stallList) return;
  if (spinner) spinner.classList.remove('d-none');
  if (emptyState) emptyState.classList.add('d-none');
  try {
    var stalls = mockStalls;
    if (typeof apiRequest === 'function' && typeof API_ENDPOINTS !== 'undefined' && (API_ENDPOINTS.stalls || API_ENDPOINTS.menu)) {
      var endpoint = API_ENDPOINTS.stalls || API_ENDPOINTS.menu;
      var data = await apiRequest(endpoint);
      var arr = Array.isArray(data) ? data : (data.stalls || data.items || []);
      if (arr.length) stalls = arr;
    }
  } catch (e) { console.warn('Stalls API failed, using mock:', e); }
  if (spinner) spinner.classList.add('d-none');
  if (!stalls || stalls.length === 0) {
    if (emptyState) emptyState.classList.remove('d-none');
    stallList.innerHTML = '';
    return;
  }
  if (emptyState) emptyState.classList.add('d-none');
  stallList.innerHTML = stalls.map(renderStallCard).join('');
}

document.addEventListener('DOMContentLoaded', function() {
  updateNavBar();
  loadStalls();
  var logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) logoutBtn.addEventListener('click', function() { if (typeof logout === 'function') logout(); });
});
