/**
 * Food Court — Single shared script
 * Handles: navbar, menu data, reusable menu cards, cart, item page, auth state
 * ==========================================================================
 */

/* ─────────────────────────────────────────────────────────────────────────
   Menu data: categories and items (with Unsplash/Pexels placeholder images)
   ───────────────────────────────────────────────────────────────────────── */
const MENU_DATA = {
  'South Indian': [
    { id: 'meals', name: 'Meals', price: 80, image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&h=250&fit=crop', description: 'Traditional South Indian meals with rice, sambar, curries and curd.' },
    { id: 'vada', name: 'Vada', price: 30, image: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=400&h=250&fit=crop', description: 'Crispy lentil donuts with chutney.' },
    { id: 'dosa-si', name: 'Dosa', price: 50, image: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=400&h=250&fit=crop', description: 'Crispy rice crepe with chutney and sambar.' }
  ],
  'Breakfast': [
    { id: 'dosa', name: 'Dosa', price: 50, image: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=400&h=250&fit=crop', description: 'Crispy rice crepe with chutney and sambar.' },
    { id: 'idly', name: 'Idly', price: 40, image: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=400&h=250&fit=crop', description: 'Steamed rice cakes with sambar and chutney.' }
  ],
  'Chinese': [
    { id: 'noodles', name: 'Noodles', price: 70, image: 'https://images.unsplash.com/photo-1569718212165-3a244bf8fbb6?w=400&h=250&fit=crop', description: 'Stir-fried noodles with vegetables.' },
    { id: 'fried-rice', name: 'Fried Rice', price: 75, image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&h=250&fit=crop', description: 'Wok-fried rice with veggies and sauces.' },
    { id: 'manchuria', name: 'Manchuria', price: 60, image: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=400&h=250&fit=crop', description: 'Crispy veg balls in spicy sauce.' }
  ]
};

/* Cart and auth stored in localStorage */
const CART_KEY = 'foodcourt_cart';
const USER_KEY = 'foodcourt_user';
const TOKEN_KEY = 'foodcourt_token';

function getCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY) || '[]');
  } catch (e) {
    return [];
  }
}

function setCart(items) {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
}

function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY) || 'null');
  } catch (e) {
    return null;
  }
}

function isLoggedIn() {
  return !!localStorage.getItem(TOKEN_KEY) || !!getCurrentUser();
}

function isAdmin() {
  const user = getCurrentUser();
  return user && (user.role === 'admin' || user.role === 'Admin');
}

/* ─────────────────────────────────────────────────────────────────────────
   Reusable menu card component (returns HTML string)
   ───────────────────────────────────────────────────────────────────────── */
function renderMenuCard(item, categoryName) {
  const url = `item.html?id=${encodeURIComponent(item.id)}&cat=${encodeURIComponent(categoryName)}`;
  return `
    <div class="menu-card">
      <a href="${url}" class="menu-card-img-wrap d-block">
        <img src="${item.image}" alt="${item.name}" loading="lazy" onerror="this.src='https://via.placeholder.com/400x250?text=${encodeURIComponent(item.name)}'">
      </a>
      <div class="menu-card-body">
        <h3 class="menu-card-title">${item.name}</h3>
        <p class="text-accent menu-card-price">₹${item.price}</p>
        <a href="${url}" class="btn btn-primary btn-accent">View & Add to Cart</a>
      </div>
    </div>
  `;
}

/* ─────────────────────────────────────────────────────────────────────────
   Common navbar (injected into #navbar on every page)
   ───────────────────────────────────────────────────────────────────────── */
function renderNavbar() {
  const el = document.getElementById('navbar');
  if (!el) return;
  const user = getCurrentUser();
  const loggedIn = isLoggedIn();
  const admin = isAdmin();
  const cart = getCart();
  const cartCount = cart.reduce((s, i) => s + (i.quantity || 1), 0);

  const currentPage = (window.location.pathname || '').split('/').pop() || 'index.html';
  const isActive = (path) => (currentPage === path || (currentPage === '' && path === 'index.html')) ? ' active' : '';
  el.innerHTML = `
    <nav class="navbar navbar-expand-lg navbar-dark">
      <div class="container">
        <a class="navbar-brand" href="index.html">🍽️ Food Court</a>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navMenu" aria-controls="navMenu" aria-expanded="false" aria-label="Toggle navigation">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navMenu">
          <ul class="navbar-nav me-auto mb-2 mb-lg-0">
            <li class="nav-item"><a class="nav-link${isActive('index.html')}" href="index.html">Home</a></li>
            <li class="nav-item"><a class="nav-link${isActive('menu.html')}" href="menu.html">Menu</a></li>
            <li class="nav-item">
              <a class="nav-link${isActive('cart.html')}" href="cart.html">Cart <span class="cart-badge" id="cartBadge">${cartCount}</span></a>
            </li>
            ${admin ? '<li class="nav-item"><a class="nav-link' + isActive('admin.html') + '" href="admin.html">Admin</a></li>' : ''}
          </ul>
          <ul class="navbar-nav">
            ${loggedIn ? `
              <li class="nav-item"><a class="nav-link" href="profile.html">Profile</a></li>
              <li class="nav-item"><a class="nav-link" href="orders.html">Orders</a></li>
              <li class="nav-item"><a class="nav-link" href="#" id="logoutBtn">Logout</a></li>
            ` : `
              <li class="nav-item"><a class="nav-link btn-nav ms-2" href="login.html">Login / Register</a></li>
            `}
          </ul>
        </div>
      </div>
    </nav>
  `;

  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', function(e) {
      e.preventDefault();
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      window.location.href = 'index.html';
    });
  }
}

function updateCartBadge() {
  const badge = document.getElementById('cartBadge');
  if (badge) {
    const cart = getCart();
    badge.textContent = cart.reduce((s, i) => s + (i.quantity || 1), 0);
  }
}

/* ─────────────────────────────────────────────────────────────────────────
   Get item by id (and optional category)
   ───────────────────────────────────────────────────────────────────────── */
function getItemById(id, categoryName) {
  if (categoryName && MENU_DATA[categoryName]) {
    const found = MENU_DATA[categoryName].find(i => i.id === id);
    if (found) return { ...found, categoryName };
  }
  for (const cat of Object.keys(MENU_DATA)) {
    const found = MENU_DATA[cat].find(i => i.id === id);
    if (found) return { ...found, categoryName: cat };
  }
  return null;
}

/* ─────────────────────────────────────────────────────────────────────────
   Add to cart (used on item page and optionally from menu)
   ───────────────────────────────────────────────────────────────────────── */
function addToCart(item, quantity) {
  const cart = getCart();
  const q = Math.max(1, parseInt(quantity, 10) || 1);
  const existing = cart.find(i => i.id === item.id && i.categoryName === (item.categoryName || ''));
  if (existing) {
    existing.quantity = (existing.quantity || 1) + q;
  } else {
    cart.push({
      id: item.id,
      name: item.name,
      price: item.price,
      image: item.image,
      categoryName: item.categoryName || '',
      quantity: q
    });
  }
  setCart(cart);
  updateCartBadge();
}

/* ─────────────────────────────────────────────────────────────────────────
   Initialize: navbar + cart badge on every page
   ───────────────────────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', function() {
  renderNavbar();
  updateCartBadge();
});

/* Expose for use in inline or other scripts */
window.MENU_DATA = MENU_DATA;
window.getCart = getCart;
window.setCart = setCart;
window.getCurrentUser = getCurrentUser;
window.isLoggedIn = isLoggedIn;
window.isAdmin = isAdmin;
window.renderMenuCard = renderMenuCard;
window.renderNavbar = renderNavbar;
window.updateCartBadge = updateCartBadge;
window.getItemById = getItemById;
window.addToCart = addToCart;
window.CART_KEY = CART_KEY;
window.USER_KEY = USER_KEY;
window.TOKEN_KEY = TOKEN_KEY;
