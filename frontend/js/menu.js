/**
 * Menu page – list from API or mock; cart uses STORAGE_KEYS. Requires config, api, auth, main.
 */
document.addEventListener('DOMContentLoaded', async function() {
  var container = document.getElementById('menu-list');
  if (!container) return;
  var cartKey = typeof STORAGE_KEYS !== 'undefined' ? STORAGE_KEYS.cart : 'lbrce_cart';
  try {
    var endpoint = (typeof API_ENDPOINTS !== 'undefined' && (API_ENDPOINTS.menu || API_ENDPOINTS.stalls)) ? (API_ENDPOINTS.menu || API_ENDPOINTS.stalls) : null;
    var menu = endpoint ? await apiRequest(endpoint) : [];
    var items = Array.isArray(menu) ? menu : (menu.items || menu.stalls || []);
    if (!items.length) {
      container.innerHTML = '<p class="text-muted">No menu items available.</p>';
      return;
    }
    container.innerHTML = items.map(function(item) {
      return '<div class="col-md-4"><div class="card"><div class="card-body">' +
        '<h5 class="card-title">' + (item.name || '') + '</h5>' +
        '<p class="card-text">' + (item.description || '') + '</p>' +
        '<p class="card-text"><strong>₹' + (item.price != null ? item.price : item.cost || 0) + '</strong></p>' +
        '<button class="btn btn-primary add-to-cart" data-id="' + item.id + '">Add to Cart</button></div></div></div>';
    }).join('');
    container.querySelectorAll('.add-to-cart').forEach(function(btn) {
      btn.onclick = function() {
        var id = btn.dataset.id;
        var itm = items.find(function(i) { return String(i.id) === String(id); });
        if (!itm) return;
        var cart = JSON.parse(localStorage.getItem(cartKey) || '[]');
        cart.push(itm);
        localStorage.setItem(cartKey, JSON.stringify(cart));
        if (typeof updateCartBadge === 'function') updateCartBadge();
        alert('Added to cart');
      };
    });
  } catch (e) {
    console.error(e);
    container.innerHTML = '<p class="text-danger">Failed to load menu.</p>';
  }
});
