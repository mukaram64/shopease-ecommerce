const API_URL = "https://fakestoreapi.com/products";
const TAX_RATE = 0.08;
const SHIPPING_FEE = 5.99;
const FREE_SHIPPING_THRESHOLD = 75;

const productGrid = document.getElementById("productGrid");
const searchInput = document.getElementById("searchInput");
const resultCount = document.getElementById("resultCount");
const statusMessage = document.getElementById("statusMessage");
const categoryFilters = document.getElementById("categoryFilters");
const cartButton = document.getElementById("cartButton");
const cartDrawer = document.getElementById("cartDrawer");
const drawerOverlay = document.getElementById("drawerOverlay");
const cartItemsEl = document.getElementById("cartItems");
const emptyCart = document.getElementById("emptyCart");
const cartSummary = document.getElementById("cartSummary");

let products = [];
let activeCategory = "all";
let searchTerm = "";
let cart = loadCart();

function loadCart() {
  try {
    const saved = JSON.parse(localStorage.getItem("shopease-cart") || "[]");
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}
function saveCart() {
  localStorage.setItem("shopease-cart", JSON.stringify(cart));
}
function money(amount) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
}
function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[char]));
}
function categoryLabel(category) {
  return ({ electronics: "Electronics", jewelery: "Jewelry", "men's clothing": "Men's clothing", "women's clothing": "Women's clothing" })[category] || category;
}
function badgeFor(product) {
  if (product.rating?.rate >= 4.5) return "Top rated";
  if (product.rating?.count >= 250) return "Popular";
  return "Picked for you";
}
async function fetchProducts() {
  statusMessage.textContent = "Fetching products from FakeStoreAPI…";
  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error("API returned an error.");
    products = await response.json();
    statusMessage.textContent = "";
    renderProducts();
    renderCart();
  } catch (error) {
    statusMessage.textContent = "Could not load products. Check your internet connection and refresh the page.";
    resultCount.textContent = "Products unavailable";
  }
}
function getFilteredProducts() {
  return products.filter(product => {
    const matchesCategory = activeCategory === "all" || product.category === activeCategory;
    const matchesSearch = `${product.title} ${product.description} ${product.category}`.toLowerCase().includes(searchTerm);
    return matchesCategory && matchesSearch;
  });
}
function renderProducts() {
  const filtered = getFilteredProducts();
  resultCount.textContent = `${filtered.length} ${filtered.length === 1 ? "product" : "products"}`;
  if (!filtered.length) {
    productGrid.innerHTML = '<div class="empty-results"><h3>No products found</h3><p>Try another search or category.</p></div>';
    return;
  }
  productGrid.innerHTML = filtered.map(product => `
    <article class="product-card">
      <div class="product-image-wrap">
        <span class="product-badge">${escapeHtml(badgeFor(product))}</span>
        <img class="product-image" src="${escapeHtml(product.image)}" alt="${escapeHtml(product.title)}" loading="lazy" />
      </div>
      <div class="product-info">
        <p class="product-category">${escapeHtml(categoryLabel(product.category))}</p>
        <h3 class="product-title" title="${escapeHtml(product.title)}">${escapeHtml(product.title)}</h3>
        <div class="rating"><span class="stars">★★★★★</span> ${Number(product.rating?.rate || 0).toFixed(1)} <span>(${product.rating?.count || 0})</span></div>
        <div class="product-bottom"><span class="price">${money(product.price)}</span>
          <button class="add-button" data-add="${product.id}" aria-label="Add ${escapeHtml(product.title)} to cart" title="Add to cart">+</button>
        </div>
      </div>
    </article>`).join("");
}
function addToCart(productId) {
  const product = products.find(item => item.id === Number(productId));
  if (!product) return;
  const existing = cart.find(item => item.id === product.id);
  if (existing) existing.quantity += 1;
  else cart.push({ id: product.id, title: product.title, price: product.price, image: product.image, quantity: 1 });
  saveCart();
  renderCart();
  openCart();
}
function removeFromCart(productId) {
  cart = cart.filter(item => item.id !== Number(productId));
  saveCart();
  renderCart();
}
function updateQuantity(productId, change) {
  const item = cart.find(item => item.id === Number(productId));
  if (!item) return;
  item.quantity += Number(change);
  if (item.quantity <= 0) removeFromCart(productId);
  else { saveCart(); renderCart(); }
}
function calculateTotal() {
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * TAX_RATE;
  const shipping = subtotal === 0 || subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  return { subtotal, tax, shipping, total: subtotal + tax + shipping };
}
function renderCart() {
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  document.getElementById("cartCount").textContent = count;
  document.getElementById("drawerCount").textContent = `(${count})`;
  emptyCart.style.display = cart.length ? "none" : "flex";
  cartItemsEl.style.display = cart.length ? "block" : "none";
  cartSummary.style.display = cart.length ? "block" : "none";
  cartItemsEl.innerHTML = cart.map(item => `
    <div class="cart-item">
      <img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.title)}" />
      <div><p class="cart-item-title">${escapeHtml(item.title)}</p><span class="cart-item-price">${money(item.price * item.quantity)}</span>
        <div class="quantity-control"><button data-quantity="${item.id}" data-change="-1" aria-label="Decrease quantity">−</button><span>${item.quantity}</span><button data-quantity="${item.id}" data-change="1" aria-label="Increase quantity">+</button></div>
      </div>
      <button class="remove-button" data-remove="${item.id}" aria-label="Remove item">×</button>
    </div>`).join("");
  const totals = calculateTotal();
  document.getElementById("subtotal").textContent = money(totals.subtotal);
  document.getElementById("tax").textContent = money(totals.tax);
  document.getElementById("shipping").textContent = totals.shipping === 0 ? "Free" : money(totals.shipping);
  document.getElementById("total").textContent = money(totals.total);
  document.getElementById("modalTotal").textContent = money(totals.total);
}
function openCart() {
  cartDrawer.classList.add("open");
  drawerOverlay.classList.add("open");
  cartDrawer.setAttribute("aria-hidden", "false");
}
function closeCart() {
  cartDrawer.classList.remove("open");
  drawerOverlay.classList.remove("open");
  cartDrawer.setAttribute("aria-hidden", "true");
}
function openCheckout() {
  if (!cart.length) return;
  closeCart();
  document.getElementById("checkoutFormView").hidden = false;
  document.getElementById("orderSuccess").hidden = true;
  document.getElementById("checkoutModal").classList.add("open");
}
function closeCheckout() {
  document.getElementById("checkoutModal").classList.remove("open");
}

searchInput.addEventListener("input", event => {
  searchTerm = event.target.value.trim().toLowerCase();
  renderProducts();
});
categoryFilters.addEventListener("click", event => {
  const button = event.target.closest("[data-category]");
  if (!button) return;
  activeCategory = button.dataset.category;
  categoryFilters.querySelectorAll(".filter-button").forEach(item => item.classList.toggle("active", item === button));
  renderProducts();
});
productGrid.addEventListener("click", event => {
  const button = event.target.closest("[data-add]");
  if (button) addToCart(button.dataset.add);
});
cartItemsEl.addEventListener("click", event => {
  const removeButton = event.target.closest("[data-remove]");
  const quantityButton = event.target.closest("[data-quantity]");
  if (removeButton) removeFromCart(removeButton.dataset.remove);
  if (quantityButton) updateQuantity(quantityButton.dataset.quantity, quantityButton.dataset.change);
});
cartButton.addEventListener("click", openCart);
document.getElementById("closeCart").addEventListener("click", closeCart);
drawerOverlay.addEventListener("click", closeCart);
document.getElementById("continueShopping").addEventListener("click", closeCart);
document.getElementById("checkoutButton").addEventListener("click", openCheckout);
document.getElementById("closeModal").addEventListener("click", closeCheckout);
document.getElementById("checkoutModal").addEventListener("click", event => {
  if (event.target.id === "checkoutModal") closeCheckout();
});
document.getElementById("checkoutForm").addEventListener("submit", event => {
  event.preventDefault();
  const formData = new FormData(event.currentTarget);
  const firstName = String(formData.get("name")).trim().split(/\s+/)[0] || "there";
  const orderNumber = `SE-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
  document.getElementById("successMessage").textContent = `Thanks, ${firstName}! Your demo order ${orderNumber} is confirmed. No payment was taken.`;
  document.getElementById("checkoutFormView").hidden = true;
  document.getElementById("orderSuccess").hidden = false;
  cart = [];
  saveCart();
  renderCart();
  event.currentTarget.reset();
});
document.getElementById("finishOrder").addEventListener("click", () => {
  closeCheckout();
  closeCart();
});
document.addEventListener("keydown", event => {
  if (event.key === "Escape") { closeCart(); closeCheckout(); }
});

renderCart();
fetchProducts();
