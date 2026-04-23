/*
  Project Title : E-Commerce Website — ShopNest
  Experiment    : 7
  File          : script.js
  Description   : All JavaScript logic — product rendering, cart management,
                  quantity controls, search & filter, coupon system,
                  localStorage persistence, checkout simulation, and confirmation modal.
*/

// ============================================================
//  1. PRODUCT DATA
// ============================================================

/**
 * Product catalog. Each product has:
 *  id, name, category, price, originalPrice, description, emoji, badge, rating, reviews
 */
const products = [
  {
    id: 1,
    name: "Wireless Noise-Cancelling Headphones",
    category: "electronics",
    price: 4999,
    originalPrice: 7999,
    description: "40hr battery, Bluetooth 5.3, foldable design. Studio-quality sound.",
    emoji: "🎧",
    badge: "Best Seller",
    rating: 4.8,
    reviews: 1243
  },
  {
    id: 2,
    name: "Mechanical Keyboard (RGB)",
    category: "electronics",
    price: 3499,
    originalPrice: 5500,
    description: "TKL layout, tactile switches, per-key RGB. Built for coders & gamers.",
    emoji: "⌨️",
    badge: "Hot",
    rating: 4.6,
    reviews: 867
  },
  {
    id: 3,
    name: "Smart Running Watch",
    category: "sports",
    price: 6999,
    originalPrice: 9999,
    description: "GPS, heart-rate monitor, sleep tracking. 10-day battery life.",
    emoji: "⌚",
    badge: "New",
    rating: 4.7,
    reviews: 534
  },
  {
    id: 4,
    name: "Premium Cotton Hoodie",
    category: "fashion",
    price: 1299,
    originalPrice: 2199,
    description: "Unisex oversized fit. 100% organic cotton. 8 colour options.",
    emoji: "👕",
    badge: "Sale",
    rating: 4.5,
    reviews: 2301
  },
  {
    id: 5,
    name: "Portable Bluetooth Speaker",
    category: "electronics",
    price: 2199,
    originalPrice: 3499,
    description: "360° surround sound, waterproof IPX7, 24hr playtime.",
    emoji: "🔊",
    badge: null,
    rating: 4.4,
    reviews: 678
  },
  {
    id: 6,
    name: "Yoga Mat (Anti-Slip)",
    category: "sports",
    price: 799,
    originalPrice: 1299,
    description: "6mm thick, eco-friendly TPE, non-toxic. Includes carry strap.",
    emoji: "🧘",
    badge: "Popular",
    rating: 4.3,
    reviews: 1102
  },
  {
    id: 7,
    name: "Minimalist Leather Wallet",
    category: "fashion",
    price: 899,
    originalPrice: 1599,
    description: "RFID-blocking, holds 8 cards + cash. Full-grain leather.",
    emoji: "👜",
    badge: null,
    rating: 4.6,
    reviews: 445
  },
  {
    id: 8,
    name: "Smart LED Desk Lamp",
    category: "home",
    price: 1599,
    originalPrice: 2499,
    description: "Adjustable colour temp & brightness. USB-C charging port built in.",
    emoji: "💡",
    badge: "New",
    rating: 4.5,
    reviews: 312
  },
  {
    id: 9,
    name: "Stainless Steel Water Bottle",
    category: "home",
    price: 599,
    originalPrice: 999,
    description: "1L, triple-wall insulation. Keeps drinks cold 24h, hot 12h.",
    emoji: "🧴",
    badge: "Eco",
    rating: 4.7,
    reviews: 3420
  }
];


// ============================================================
//  2. CART STATE
// ============================================================

/**
 * cart: Array of { ...product, quantity }
 * Persisted in localStorage under key 'shopnest_cart'
 */
let cart = loadCartFromStorage();
let activeCategory = "all";
let couponApplied = false;
const COUPON_CODE = "SAVE10";       // 10% discount code
const FREE_SHIPPING_THRESHOLD = 999; // free shipping above this amount


// ============================================================
//  3. INIT
// ============================================================

/** Called once DOM is ready */
document.addEventListener("DOMContentLoaded", () => {
  renderProducts(products);
  renderAllCartViews();
});


// ============================================================
//  4. PRODUCT RENDERING
// ============================================================

/**
 * Generates star string based on rating (out of 5)
 * @param {number} rating
 * @returns {string} star emoji string
 */
function getStars(rating) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;
  return "★".repeat(full) + (half ? "½" : "") + "☆".repeat(empty);
}

/**
 * Renders an array of products into #productGrid
 * @param {Array} list - filtered or full product array
 */
function renderProducts(list) {
  const grid = document.getElementById("productGrid");
  const noResults = document.getElementById("noResults");
  const countEl = document.getElementById("productCount");

  grid.innerHTML = "";

  if (list.length === 0) {
    noResults.classList.remove("hidden");
    countEl.textContent = "0 products found";
    return;
  }

  noResults.classList.add("hidden");
  countEl.textContent = `Showing ${list.length} product${list.length > 1 ? "s" : ""}`;

  list.forEach((p, index) => {
    const discount = Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100);
    const inCart = cart.find(c => c.id === p.id);

    const card = document.createElement("div");
    card.className = "product-card";
    card.style.animationDelay = `${index * 60}ms`;
    card.dataset.id = p.id;

    card.innerHTML = `
      <div class="product-image-wrap">
        <span>${p.emoji}</span>
        ${p.badge ? `<span class="product-badge">${p.badge}</span>` : ""}
        <button class="wishlist-btn" onclick="toggleWishlist(this)" title="Add to wishlist">♡</button>
      </div>
      <div class="product-info">
        <div class="product-category">${p.category}</div>
        <div class="product-name">${p.name}</div>
        <div class="product-desc">${p.description}</div>
        <div class="product-rating">
          <span class="stars">${getStars(p.rating)}</span>
          <span class="rating-count">${p.rating} (${p.reviews.toLocaleString()})</span>
        </div>
        <div class="product-footer">
          <div class="price-block">
            <span class="price-original">₹${p.originalPrice.toLocaleString()} <span style="color:var(--green);font-size:11px;">${discount}% off</span></span>
            <span class="price-current">₹${p.price.toLocaleString()}</span>
          </div>
          <button
            class="add-to-cart-btn ${inCart ? "added" : ""}"
            onclick="addToCart(${p.id}, this)"
          >
            ${inCart ? "✓ Added" : "+ Cart"}
          </button>
        </div>
      </div>
    `;

    grid.appendChild(card);
  });
}


// ============================================================
//  5. SEARCH & FILTER
// ============================================================

/**
 * Filters products based on the search input value and active category pill
 */
function filterProducts() {
  const query = document.getElementById("searchInput").value.toLowerCase().trim();
  applyFilters(query, activeCategory);
}

/**
 * Filters products by category pill click
 * @param {string} category
 * @param {HTMLElement} el - the clicked pill button
 */
function filterByCategory(category, el) {
  // Update active pill styling
  document.querySelectorAll(".pill").forEach(p => p.classList.remove("active"));
  el.classList.add("active");

  activeCategory = category;
  const query = document.getElementById("searchInput").value.toLowerCase().trim();
  applyFilters(query, category);
}

/**
 * Core filter logic — combines text search + category
 * @param {string} query
 * @param {string} category
 */
function applyFilters(query, category) {
  let filtered = products;

  // Category filter
  if (category !== "all") {
    filtered = filtered.filter(p => p.category === category);
  }

  // Text filter: name, description, category
  if (query) {
    filtered = filtered.filter(p =>
      p.name.toLowerCase().includes(query) ||
      p.description.toLowerCase().includes(query) ||
      p.category.toLowerCase().includes(query)
    );
  }

  renderProducts(filtered);
}

/**
 * Clears the search input and resets product list
 */
function clearSearch() {
  document.getElementById("searchInput").value = "";
  applyFilters("", activeCategory);
}


// ============================================================
//  6. CART — ADD / REMOVE / UPDATE
// ============================================================

/**
 * Adds a product to the cart or increments quantity if already present
 * @param {number} id - product id
 * @param {HTMLElement} btn - the clicked button (for visual feedback)
 */
function addToCart(id, btn) {
  const product = products.find(p => p.id === id);
  if (!product) return;

  const existing = cart.find(c => c.id === id);

  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ ...product, quantity: 1 });
  }

  // Button feedback
  btn.textContent = "✓ Added";
  btn.classList.add("added");

  saveCartToStorage();
  renderAllCartViews();
  showCartSidebar(); // open sidebar briefly
}

/**
 * Removes a product entirely from the cart
 * @param {number} id
 */
function removeFromCart(id) {
  cart = cart.filter(c => c.id !== id);
  saveCartToStorage();
  renderAllCartViews();
  refreshProductButtons();
}

/**
 * Updates the quantity of a cart item (+1 or -1)
 * @param {number} id
 * @param {number} delta - +1 or -1
 */
function updateQty(id, delta) {
  const item = cart.find(c => c.id === id);
  if (!item) return;

  item.quantity += delta;

  if (item.quantity <= 0) {
    removeFromCart(id);
    return;
  }

  saveCartToStorage();
  renderAllCartViews();
}

/**
 * Empties the entire cart
 */
function clearCart() {
  cart = [];
  couponApplied = false;
  saveCartToStorage();
  renderAllCartViews();
  refreshProductButtons();
}


// ============================================================
//  7. CART RENDERING
// ============================================================

/**
 * Re-renders all three cart views: sidebar, inline section, and checkout review
 */
function renderAllCartViews() {
  renderCartSidebar();
  renderCartInline();
  renderCheckoutReview();
  updateBadge();
}

/**
 * Renders cart items inside the slide-out sidebar
 */
function renderCartSidebar() {
  const container = document.getElementById("cartItems");
  const { subtotal, shipping, total } = calcTotals();

  if (cart.length === 0) {
    container.innerHTML = `<p style="color:var(--muted);padding:40px 0;text-align:center;">Your cart is empty.</p>`;
  } else {
    container.innerHTML = cart.map(item => `
      <div class="cart-item">
        <span class="cart-item-emoji">${item.emoji}</span>
        <div class="cart-item-info">
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-price">₹${item.price.toLocaleString()} each</div>
          <div class="qty-controls">
            <button class="qty-btn" onclick="updateQty(${item.id}, -1)">−</button>
            <span class="qty-num">${item.quantity}</span>
            <button class="qty-btn" onclick="updateQty(${item.id}, +1)">+</button>
          </div>
        </div>
        <button class="cart-item-remove" onclick="removeFromCart(${item.id})" title="Remove">✕</button>
      </div>
    `).join("");
  }

  document.getElementById("cartSubtotal").textContent = `₹${subtotal.toLocaleString()}`;
  document.getElementById("cartShipping").textContent  = shipping === 0 ? "Free" : `₹${shipping}`;
  document.getElementById("cartTotal").textContent     = `₹${total.toLocaleString()}`;
}

/**
 * Renders cart items in the inline cart section on the page
 */
function renderCartInline() {
  const container = document.getElementById("cartInlineItems");
  const emptyMsg  = document.getElementById("emptyCartMsg");
  const { subtotal, shipping, total, discount } = calcTotals();

  if (cart.length === 0) {
    container.innerHTML = "";
    emptyMsg.classList.remove("hidden");
  } else {
    emptyMsg.classList.add("hidden");
    container.innerHTML = cart.map(item => `
      <div class="cart-inline-item">
        <span class="ci-emoji">${item.emoji}</span>
        <div class="ci-info">
          <div class="ci-name">${item.name}</div>
          <div class="ci-unit">₹${item.price.toLocaleString()} × ${item.quantity}</div>
        </div>
        <div class="qty-controls">
          <button class="qty-btn" onclick="updateQty(${item.id}, -1)">−</button>
          <span class="qty-num">${item.quantity}</span>
          <button class="qty-btn" onclick="updateQty(${item.id}, +1)">+</button>
        </div>
        <span class="ci-subtotal">₹${(item.price * item.quantity).toLocaleString()}</span>
        <button class="cart-item-remove" onclick="removeFromCart(${item.id})" title="Remove">✕</button>
      </div>
    `).join("");
  }

  // Update summary box
  document.getElementById("summarySubtotal").textContent = `₹${subtotal.toLocaleString()}`;
  document.getElementById("summaryShipping").textContent  = shipping === 0 ? "Free 🎉" : `₹${shipping}`;
  document.getElementById("summaryTotal").textContent     = `₹${total.toLocaleString()}`;

  const discountRow = document.getElementById("discountRow");
  if (couponApplied && discount > 0) {
    discountRow.classList.remove("hidden");
    document.getElementById("summaryDiscount").textContent = `-₹${discount.toLocaleString()}`;
  } else {
    discountRow.classList.add("hidden");
  }
}

/**
 * Renders the order review panel in the checkout section
 */
function renderCheckoutReview() {
  const container = document.getElementById("checkoutItems");
  const { subtotal, shipping, total } = calcTotals();

  if (cart.length === 0) {
    container.innerHTML = `<p class="empty-msg">No items in cart yet.</p>`;
  } else {
    container.innerHTML = cart.map(item => `
      <div class="checkout-review-item">
        <span class="cr-emoji">${item.emoji}</span>
        <div class="cr-info">
          <div class="cr-name">${item.name}</div>
          <div class="cr-qty">Qty: ${item.quantity}</div>
        </div>
        <span class="cr-price">₹${(item.price * item.quantity).toLocaleString()}</span>
      </div>
    `).join("");
  }

  document.getElementById("reviewSubtotal").textContent = `₹${subtotal.toLocaleString()}`;
  document.getElementById("reviewShipping").textContent  = shipping === 0 ? "Free" : `₹${shipping}`;
  document.getElementById("reviewTotal").textContent     = `₹${total.toLocaleString()}`;
}

/**
 * Updates the cart badge number on the navbar button
 */
function updateBadge() {
  const total = cart.reduce((acc, item) => acc + item.quantity, 0);
  document.getElementById("cartBadge").textContent = total;
}

/**
 * Refreshes "Added / + Cart" state on product card buttons after cart changes
 */
function refreshProductButtons() {
  document.querySelectorAll(".product-card").forEach(card => {
    const id  = parseInt(card.dataset.id);
    const btn = card.querySelector(".add-to-cart-btn");
    if (!btn) return;
    const inCart = cart.find(c => c.id === id);
    btn.textContent = inCart ? "✓ Added" : "+ Cart";
    inCart ? btn.classList.add("added") : btn.classList.remove("added");
  });
}


// ============================================================
//  8. TOTALS CALCULATION
// ============================================================

/**
 * Calculates cart totals including optional coupon discount and shipping
 * @returns {{ subtotal, discount, shipping, total }}
 */
function calcTotals() {
  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const discount = couponApplied ? Math.round(subtotal * 0.10) : 0;
  const afterDiscount = subtotal - discount;
  const shipping = (afterDiscount === 0 || afterDiscount >= FREE_SHIPPING_THRESHOLD) ? 0 : 99;
  const total = afterDiscount + shipping;

  return { subtotal, discount, shipping, total };
}


// ============================================================
//  9. COUPON
// ============================================================

/**
 * Validates the coupon code entered by the user
 */
function applyCoupon() {
  const input = document.getElementById("couponInput").value.trim().toUpperCase();
  const msgEl = document.getElementById("couponMsg");

  if (cart.length === 0) {
    msgEl.textContent = "Add items to cart first.";
    msgEl.className = "coupon-msg error";
    return;
  }

  if (input === COUPON_CODE) {
    if (couponApplied) {
      msgEl.textContent = "Coupon already applied!";
      msgEl.className = "coupon-msg error";
      return;
    }
    couponApplied = true;
    msgEl.textContent = "✓ 10% discount applied!";
    msgEl.className = "coupon-msg success";
    renderAllCartViews();
  } else {
    msgEl.textContent = "Invalid coupon code.";
    msgEl.className = "coupon-msg error";
  }
}


// ============================================================
//  10. CART SIDEBAR TOGGLE
// ============================================================

/**
 * Opens the cart sidebar (called after adding an item)
 */
function showCartSidebar() {
  document.getElementById("cartSidebar").classList.add("open");
  document.getElementById("cartOverlay").classList.add("active");
}

/**
 * Toggles the cart sidebar open/close
 */
function toggleCart() {
  document.getElementById("cartSidebar").classList.toggle("open");
  document.getElementById("cartOverlay").classList.toggle("active");
}

// Navbar cart button
document.getElementById("cartToggleBtn").addEventListener("click", toggleCart);


// ============================================================
//  11. WISHLIST (visual only — bonus UX)
// ============================================================

/**
 * Toggles the wishlist heart icon state
 * @param {HTMLElement} btn
 */
function toggleWishlist(btn) {
  btn.classList.toggle("wishlisted");
  btn.textContent = btn.classList.contains("wishlisted") ? "♥" : "♡";
}


// ============================================================
//  12. CHECKOUT
// ============================================================

/**
 * Smoothly scrolls to the checkout section
 */
function scrollToCheckout() {
  document.getElementById("checkout-section").scrollIntoView({ behavior: "smooth" });
  // Close sidebar if open
  document.getElementById("cartSidebar").classList.remove("open");
  document.getElementById("cartOverlay").classList.remove("active");
}

/**
 * Handles checkout form submission
 * Validates cart is not empty, then shows confirmation modal
 * @param {Event} e
 */
function placeOrder(e) {
  e.preventDefault();

  if (cart.length === 0) {
    alert("Your cart is empty! Add some products before placing an order.");
    return;
  }

  // Read form values
  const firstName = document.getElementById("firstName").value.trim();
  const lastName  = document.getElementById("lastName").value.trim();
  const email     = document.getElementById("email").value.trim();
  const city      = document.getElementById("city").value.trim();
  const payment   = document.querySelector('input[name="payment"]:checked').value;

  const { total, shipping } = calcTotals();
  const orderNo = "SN-" + Date.now().toString().slice(-7);

  const paymentLabels = { upi: "UPI", card: "Credit / Debit Card", cod: "Cash on Delivery" };

  // Populate modal
  document.getElementById("confirmName").textContent  = `${firstName} ${lastName}`;
  document.getElementById("confirmEmail").textContent = email;
  document.getElementById("modalDetails").innerHTML   = `
    <strong>Order #:</strong> ${orderNo}<br>
    <strong>Items:</strong> ${cart.reduce((a,i) => a + i.quantity, 0)}<br>
    <strong>Shipping to:</strong> ${city}<br>
    <strong>Payment:</strong> ${paymentLabels[payment]}<br>
    <strong>Shipping:</strong> ${shipping === 0 ? "Free" : "₹" + shipping}<br>
    <strong>Total Paid:</strong> ₹${total.toLocaleString()}
  `;

  // Show modal
  document.getElementById("confirmModal").classList.remove("hidden");

  // Clear cart after order
  cart = [];
  couponApplied = false;
  saveCartToStorage();
  renderAllCartViews();
  refreshProductButtons();
  document.getElementById("checkoutForm").reset();
}

/**
 * Closes the confirmation modal
 */
function closeModal() {
  document.getElementById("confirmModal").classList.add("hidden");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// Close modal on overlay click
document.getElementById("confirmModal").addEventListener("click", function(e) {
  if (e.target === this) closeModal();
});


// ============================================================
//  13. LOCALSTORAGE PERSISTENCE (Bonus Task)
// ============================================================

/**
 * Saves the current cart array to localStorage
 */
function saveCartToStorage() {
  localStorage.setItem("shopnest_cart", JSON.stringify(cart));
}

/**
 * Loads the cart array from localStorage (returns [] if nothing found)
 * @returns {Array}
 */
function loadCartFromStorage() {
  try {
    const stored = localStorage.getItem("shopnest_cart");
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    return [];
  }
}


// ============================================================
//  14. KEYBOARD ACCESSIBILITY
// ============================================================

// Close cart on Escape key
document.addEventListener("keydown", e => {
  if (e.key === "Escape") {
    document.getElementById("cartSidebar").classList.remove("open");
    document.getElementById("cartOverlay").classList.remove("active");
    closeModal();
  }
});