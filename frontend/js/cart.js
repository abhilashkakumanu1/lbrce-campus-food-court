/**
 * Cart page – uses STORAGE_KEYS.cart and API_ENDPOINTS.orders / .cart for checkout. Requires config, api, auth, main.
 */
var CART_KEY = (typeof STORAGE_KEYS !== 'undefined' && STORAGE_KEYS.cart) ? STORAGE_KEYS.cart : 'lbrce_cart';

function getCart() {
  var raw = localStorage.getItem(CART_KEY);
  return raw ? JSON.parse(raw) : (Array.isArray(raw) ? [] : { stall_id: null, stall_name: '', items: [] });
}

function setCart(data) {
  localStorage.setItem(CART_KEY, JSON.stringify(data));
}

function renderCart() {
  var list = document.getElementById('cart-list');
  var cartItems = document.getElementById('cartItems');
  var cart = getCart();
  var items = Array.isArray(cart) ? cart : (cart.items || cart);
  if (list) {
    if (!items || items.length === 0) {
      list.innerHTML = '<p>Your cart is empty.</p>';
      return;
    }
    list.innerHTML = items.map(function(it, idx) {
      var name = it.name || '';
      var price = it.price != null ? it.price : it.cost || 0;
      return '<div class="card mb-2"><div class="card-body d-flex justify-content-between align-items-center">' +
        '<div><h6>' + name + '</h6><small class="text-muted">₹' + price + '</small></div>' +
        '<button class="btn btn-sm btn-danger" onclick="removeFromCart(' + idx + ')">Remove</button></div></div>';
    }).join('');
  }
  if (cartItems) {
    var emptyState = document.getElementById('emptyState');
    var stallName = document.getElementById('stallName');
    var totalItems = document.getElementById('totalItems');
    var totalAmount = document.getElementById('totalAmount');
    if (!items || items.length === 0) {
      if (emptyState) emptyState.classList.remove('d-none');
      cartItems.innerHTML = '';
      return;
    }
    if (emptyState) emptyState.classList.add('d-none');
    if (stallName) stallName.textContent = cart.stall_name || 'Unknown Stall';
    if (totalItems) totalItems.textContent = items.reduce(function(s, i) { return s + (i.quantity || 1); }, 0);
    if (totalAmount) totalAmount.textContent = '₹' + items.reduce(function(s, i) { return s + (i.price || i.cost || 0) * (i.quantity || 1); }, 0);
    cartItems.innerHTML = items.map(function(item) {
      var q = item.quantity || 1;
      var p = item.price != null ? item.price : item.cost || 0;
      var mid = item.menu_item_id != null ? item.menu_item_id : item.id;
      return '<div class="list-group-item p-3"><div class="row align-items-center">' +
        '<div class="col"><h6 class="mb-1">' + (item.name || '') + '</h6><small class="text-muted">₹' + p + ' each</small></div>' +
        '<div class="col-auto"><strong>₹' + (p * q) + '</strong></div>' +
        '<div class="col-auto"><button class="btn btn-sm btn-danger" onclick="removeFromCartById(' + mid + ')">Remove</button></div></div></div>';
    }).join('');
  }
}

function removeFromCart(idx) {
  var cart = getCart();
  var items = Array.isArray(cart) ? cart : (cart.items || []);
  items.splice(idx, 1);
  if (Array.isArray(cart)) setCart(items); else { cart.items = items; setCart(cart); }
  renderCart();
  if (typeof updateCartBadge === 'function') updateCartBadge();
}

function removeFromCartById(menuItemId) {
  var cart = getCart();
  var items = Array.isArray(cart) ? cart : (cart.items || []);
  var next = items.filter(function(i) { return (i.menu_item_id != null ? i.menu_item_id : i.id) !== menuItemId; });
  if (Array.isArray(cart)) setCart(next); else { cart.items = next; setCart(cart); }
  renderCart();
  if (typeof updateCartBadge === 'function') updateCartBadge();
}

async function checkout() {
  if (typeof isAuthenticated === 'function' && !isAuthenticated()) {
    alert('Please login to checkout.');
    window.location.href = 'login.html';
    return;
  }
  var cart = getCart();
  var items = Array.isArray(cart) ? cart : (cart.items || cart);
  if (!items || items.length === 0) { alert('Cart empty'); return; }
  var ordersEndpoint = typeof API_ENDPOINTS !== 'undefined' && (API_ENDPOINTS.orders || API_ENDPOINTS.cart);
  var body = Array.isArray(cart) ? { items: cart } : { stall_id: cart.stall_id, items: (cart.items || []).map(function(i) { return { menu_item_id: i.menu_item_id != null ? i.menu_item_id : i.id, quantity: i.quantity || 1 }; }) };
  try {
    if (ordersEndpoint) await apiRequest(ordersEndpoint, { method: 'POST', body: body });
    setCart(Array.isArray(cart) ? [] : { stall_id: null, stall_name: '', items: [] });
    renderCart();
    if (typeof updateCartBadge === 'function') updateCartBadge();
    alert('Order placed successfully');
    window.location.href = 'orders.html';
  } catch (e) {
    console.error(e);
    alert('Checkout failed');
  }
}

function placeOrder() {
  checkout();
}

document.addEventListener('DOMContentLoaded', function() {
  renderCart();
  var checkoutBtn = document.getElementById('checkoutBtn');
  var placeOrderBtn = document.getElementById('placeOrderBtn');
  if (checkoutBtn) checkoutBtn.onclick = checkout;
  if (placeOrderBtn) placeOrderBtn.onclick = placeOrder;
});

window.removeFromCart = removeFromCart;
window.removeFromCartById = removeFromCartById;
window.renderCart = renderCart;
window.getCart = getCart;
window.placeOrder = placeOrder;
