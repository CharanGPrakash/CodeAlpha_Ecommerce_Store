const API_URL = "http://localhost:5000/api";
let currentPage = 1;
let currentCategory = "all";
let currentSort = "default";
let currentSearch = "";
let isLoading = false;
let hasMore = true;
let currentMinPrice = null;
let currentMaxPrice = null;

// Toast notification
function showToast(message) {
  const toast = document.createElement("div");
  toast.classList.add("toast");
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 2500);
}

// Build API URL with filters
function buildURL() {
  let url = `${API_URL}/products?page=${currentPage}&limit=20`;
  if (currentCategory !== "all") url += `&category=${currentCategory}`;
  if (currentSearch) url += `&search=${currentSearch}`;
  if (currentSort !== "default") url += `&sort=${currentSort}`;
  if (currentMinPrice) url += `&minPrice=${currentMinPrice}`;
  if (currentMaxPrice) url += `&maxPrice=${currentMaxPrice}`;
  return url;
}

// Scroll reveal observer
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
    }
  });
}, { threshold: 0.1 });

function observeCards() {
  document.querySelectorAll(".product-card").forEach(card => {
    observer.observe(card);
  });
}

// Fetch and render products
async function fetchProducts(reset = false) {
  if (isLoading || (!hasMore && !reset)) return;

  const productList = document.getElementById("product-list");
  if (!productList) return;

  if (reset) {
    currentPage = 1;
    hasMore = true;
    productList.innerHTML = "";
  }

  isLoading = true;

  const spinner = document.createElement("div");
  spinner.id = "spinner";
  spinner.innerHTML = `<div class="spinner"></div>`;
  productList.appendChild(spinner);

  try {
    const response = await fetch(buildURL());
    const data = await response.json();

    const s = document.getElementById("spinner");
    if (s) s.remove();

    if (data.products.length === 0 && currentPage === 1) {
      productList.innerHTML = "<p style='color:#888;text-align:center;padding:40px;'>No products found.</p>";
      isLoading = false;
      return;
    }

    data.products.forEach((product, index) => {
      const card = document.createElement("div");
      card.classList.add("product-card");
      card.style.animationDelay = `${index * 0.05}s`;

      const stars = "⭐".repeat(Math.round(product.rating));

      card.innerHTML = `
        <div class="product-image-wrap">
          <img src="${product.image}" alt="${product.name}" loading="lazy">
          <div class="product-badge">${product.brand}</div>
        </div>
        <div class="product-info">
          <p class="product-seller">🏪 ${product.seller}</p>
          <h3>${product.name}</h3>
          <p class="desc">${product.description}</p>
          <div class="product-rating">${stars} <span>(${product.rating})</span></div>
          <p class="price">₹${product.price}</p>
          <button onclick="addToCart('${product._id}', '${product.name}', ${product.price}, '${product.image}')">
            🛒 Add to Cart
          </button>
        </div>
      `;
      productList.appendChild(card);
    });

    hasMore = data.hasMore;
    currentPage++;

    const countEl = document.getElementById("product-count");
    if (countEl) countEl.textContent = `${data.total.toLocaleString()} products found`;

    // Trigger scroll reveal on new cards
    observeCards();

  } catch (err) {
    const s = document.getElementById("spinner");
    if (s) s.remove();
    console.error(err);
  }

  isLoading = false;
}

// Infinite scroll
window.addEventListener("scroll", () => {
  if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 500) {
    fetchProducts();
  }
});

// Filter by category
function filterCategory(category, el) {
  currentCategory = category;
  currentSearch = "";
  const searchInput = document.getElementById("search-input");
  if (searchInput) searchInput.value = "";

  document.querySelectorAll(".cat-link").forEach(l => l.classList.remove("active"));
  if (el) el.classList.add("active");

  fetchProducts(true);
  document.querySelector(".products-section").scrollIntoView({ behavior: "smooth" });
}

// Search
// Search
let searchTimeout;
function searchProducts() {
  clearTimeout(searchTimeout);
  const query = document.getElementById("search-input").value.trim();
  const clearBtn = document.getElementById("search-clear");
  if (clearBtn) clearBtn.style.display = query ? "block" : "none";

  if (query.length > 0) showSuggestions(query);
  else closeSuggestions();

  searchTimeout = setTimeout(() => {
    currentSearch = query;
    currentCategory = "all";
    document.querySelectorAll(".cat-link").forEach(l => l.classList.remove("active"));
    fetchProducts(true);
  }, 400);
}
// Sort
function sortProducts() {
  currentSort = document.getElementById("sort-select").value;
  fetchProducts(true);
}

// Filter by price
function filterPrice() {
  const value = document.getElementById("price-filter").value;
  if (!value) {
    currentMinPrice = null;
    currentMaxPrice = null;
  } else {
    const [min, max] = value.split("-");
    currentMinPrice = min;
    currentMaxPrice = max;
  }
  fetchProducts(true);
}

// Add to cart
function addToCart(id, name, price, image) {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  cart.push({ _id: id, name, price, image });
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartCount();
  showToast(`✅ ${name} added to cart!`);
}

// Update cart count
function updateCartCount() {
  const cartCount = document.getElementById("cart-count");
  if (cartCount) {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    cartCount.textContent = cart.length;
  }
}

// Update header
function updateHeader() {
  const user = JSON.parse(localStorage.getItem("user"));
  const nav = document.getElementById("main-nav");
  if (!nav) return;

  if (user) {
    nav.innerHTML = `
      <span style="color:#888;font-size:13px;">Hi, ${user.name} 👋</span>
      <a href="orders.html"><i class="fa fa-box"></i> Orders</a>
      <a href="#" onclick="logout()"><i class="fa fa-sign-out-alt"></i> Logout</a>
      <a href="cart.html" class="cart-btn">🛒 Cart (<span id="cart-count">0</span>)</a>
    `;
  } else {
    nav.innerHTML = `
      <a href="login.html"><i class="fa fa-user"></i> Login</a>
      <a href="cart.html" class="cart-btn">🛒 Cart (<span id="cart-count">0</span>)</a>
    `;
  }
  updateCartCount();
}

// Logout
function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.location.href = "login.html";
}
// ── WISHLIST ──────────────────────────────────
function toggleWishlist(e, id, name, price, image) {
  e.stopPropagation();
  let wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
  const exists = wishlist.some(w => w._id === id);
  const btn = e.currentTarget;

  if (exists) {
    wishlist = wishlist.filter(w => w._id !== id);
    btn.innerHTML = "🤍";
    btn.classList.remove("active");
    showToast("💔 Removed from wishlist");
  } else {
    wishlist.push({ _id: id, name, price, image });
    btn.innerHTML = "❤️";
    btn.classList.add("active");
    showToast(`❤️ ${name} saved to wishlist!`);
    btn.style.transform = "scale(1.5)";
    setTimeout(() => btn.style.transform = "", 300);
  }
  localStorage.setItem("wishlist", JSON.stringify(wishlist));
}

// ── HEADER SEARCH ─────────────────────────────
const BRANDS = ["Nike", "Adidas", "Puma", "Levi's", "Zara", "H&M", "Reebok", "Tommy"];

function showSuggestions(query) {
  const box = document.getElementById("search-suggestions");
  if (!box || !query) { closeSuggestions(); return; }

  const q = query.toLowerCase();
  let html = "";

  const brandMatches = BRANDS.filter(b => b.toLowerCase().includes(q));
  if (brandMatches.length > 0) {
    html += `<div class="suggestion-group-label">Brands</div>`;
    brandMatches.slice(0, 3).forEach(brand => {
      const hl = brand.replace(new RegExp(`(${query})`, "gi"), "<b>$1</b>");
      html += `<div class="suggestion-item" onclick="selectSuggestion('${brand}')">
        <span class="s-icon">🏷️</span><span>${hl}</span></div>`;
    });
  }

  if (html === "") {
    html = `<div class="suggestion-no-results">No results for "${query}"</div>`;
  }

  box.innerHTML = html;
  box.classList.add("open");
}

function selectSuggestion(name) {
  const input = document.getElementById("search-input");
  const clearBtn = document.getElementById("search-clear");
  if (input) input.value = name;
  if (clearBtn) clearBtn.style.display = "block";
  closeSuggestions();
  currentSearch = name;
  fetchProducts(true);
}

function clearSearch() {
  const input = document.getElementById("search-input");
  const clearBtn = document.getElementById("search-clear");
  if (input) input.value = "";
  if (clearBtn) clearBtn.style.display = "none";
  closeSuggestions();
  currentSearch = "";
  fetchProducts(true);
  input.focus();
}

function closeSuggestions() {
  const box = document.getElementById("search-suggestions");
  if (box) box.classList.remove("open");
}

function handleSearchKey(e) {
  const box = document.getElementById("search-suggestions");
  if (!box) return;
  const items = box.querySelectorAll(".suggestion-item");
  const active = box.querySelector(".suggestion-item.active");
  let idx = Array.from(items).indexOf(active);

  if (e.key === "ArrowDown") {
    e.preventDefault();
    if (active) active.classList.remove("active");
    items[Math.min(idx + 1, items.length - 1)]?.classList.add("active");
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    if (active) active.classList.remove("active");
    items[Math.max(idx - 1, 0)]?.classList.add("active");
  } else if (e.key === "Enter") {
    if (active) active.click();
    else closeSuggestions();
  } else if (e.key === "Escape") {
    clearSearch();
  }
}

// Close suggestions on outside click
document.addEventListener("click", (e) => {
  if (!document.querySelector(".header-search")?.contains(e.target)) {
    closeSuggestions();
  }
});

fetchProducts(true);
updateHeader();