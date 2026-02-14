// main.js - shared UI helpers and navbar rendering
function renderNavbar() {
  const user = getCurrentUser();
  const auth = isAuthenticated();
  const isAdmin = user && user.role === 'admin';

  const nav = document.getElementById('navbar');
  if (!nav) return;

  nav.innerHTML = `
  <nav class="navbar navbar-expand-lg navbar-light bg-light">
    <div class="container">
      <a class="navbar-brand" href="index.html">Food Court</a>
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav me-auto mb-2 mb-lg-0">
          <li class="nav-item"><a class="nav-link" href="index.html">Home</a></li>
          <li class="nav-item"><a class="nav-link" href="menu.html">Menu</a></li>
          <li class="nav-item"><a class="nav-link" href="cart.html">Cart <span id="cart-badge" class="badge bg-danger ms-1">0</span></a></li>
          ${isAdmin?'<li class="nav-item"><a class="nav-link" href="admin.html">Admin</a></li>':''}
        </ul>
        <ul class="navbar-nav">
          ${auth?'<li class="nav-item"><a class="nav-link" href="#" id="logoutLink">Logout</a></li>':'<li class="nav-item"><a class="nav-link" href="login.html">Login</a></li>'}
        </ul>
      </div>
    </div>
  </nav>
  `;

  const logoutLink = document.getElementById('logoutLink');
  if (logoutLink) logoutLink.onclick = (e) => { e.preventDefault(); logout(); };
}

function updateCartBadge() {
  const cartKey = (typeof STORAGE_KEYS !== 'undefined' && STORAGE_KEYS.cart) ? STORAGE_KEYS.cart : 'cart';
  const raw = localStorage.getItem(cartKey) || localStorage.getItem('lbrce_cart') || '[]';
  let count = 0;
  try {
    const cart = JSON.parse(raw);
    count = Array.isArray(cart) ? cart.length : ((cart.items && cart.items.length) || 0);
  } catch (e) { count = 0; }
  const badge = document.getElementById('cart-badge');
  if (badge) badge.textContent = count;
}

document.addEventListener('DOMContentLoaded', () => {
  renderNavbar();
  updateCartBadge();
});

// Expose helpers globally
window.renderNavbar = renderNavbar;
window.updateCartBadge = updateCartBadge;
