const API_URL = "http://localhost:5000/api";

// DOM refs
const cartItemsDiv   = document.getElementById("cart-items");
const cartTotal      = document.getElementById("cart-total");
const cartTopay      = document.getElementById("cart-topay");
const cartCount      = document.getElementById("cart-count");
const cartItemCount  = document.getElementById("cart-item-count");
const cartDiscount   = document.getElementById("cart-discount");
const cartBadge      = document.getElementById("cart-badge");

let cart = JSON.parse(localStorage.getItem("cart")) || [];
let discountAmount = 0;
let promoApplied = false;

// ── RENDER CART ─────────────────────────────
function renderCart() {
  cartItemsDiv.innerHTML = "";

  if (cart.length === 0) {
    showEmptyCart();
    return;
  }

  // Badge
  cartBadge.textContent = `${cart.length} item${cart.length > 1 ? "s" : ""}`;

  let total = 0;
  cart.forEach((item, index) => {
    total += item.price * (item.qty || 1);
    cartItemsDiv.appendChild(createCartCard(item, index));
  });

  updateTotals(total);
  updateCartCount();

  // Show AI suggestion after short delay
  setTimeout(() => getAISuggestion(), 1000);
}

// ── CREATE CART ITEM CARD ───────────────────
function createCartCard(item, index) {
  const div = document.createElement("div");
  div.classList.add("cart-item-card");
  div.id = `cart-item-${index}`;
  div.style.animationDelay = `${index * 0.08}s`;

  const qty = item.qty || 1;

  div.innerHTML = `
    <div class="cart-item-img-wrap">
      <img src="${item.image}" alt="${item.name}">
    </div>
    <div class="cart-item-info">
      <h3>${item.name}</h3>
      <p class="cart-item-price">₹${(item.price * qty).toLocaleString()}</p>
      <p class="cart-unit-price">₹${item.price.toLocaleString()} each</p>
    </div>
    <div class="cart-item-actions">
      <div class="qty-control">
        <button class="qty-btn" onclick="changeQty(${index}, -1)">
          <i class="fa fa-minus"></i>
        </button>
        <span class="qty-value" id="qty-${index}">${qty}</span>
        <button class="qty-btn" onclick="changeQty(${index}, 1)">
          <i class="fa fa-plus"></i>
        </button>
      </div>
      <button class="cart-item-remove" onclick="removeFromCart(${index})">
        <i class="fa fa-trash"></i> Remove
      </button>
    </div>
  `;
  return div;
}

// ── EMPTY CART STATE ────────────────────────
function showEmptyCart() {
  cartBadge.textContent = "";
  cartItemsDiv.innerHTML = `
    <div class="empty-cart">
      <div class="empty-cart-icon">🛒</div>
      <h3>Your cart is empty!</h3>
      <p>Looks like you haven't added anything yet.</p>
      <a href="index.html">
        <button class="shop-now-btn">
          <i class="fa fa-store"></i> Start Shopping
        </button>
      </a>
    </div>
  `;
  cartCount.textContent = 0;
  cartItemCount.textContent = 0;
  cartTotal.textContent = 0;
  cartTopay.textContent = 0;
  cartDiscount.textContent = 0;
}

// ── UPDATE TOTALS ───────────────────────────
function updateTotals(total) {
  const finalTotal = Math.max(0, total - discountAmount);

  // Animate the number counting up
  animateNumber(cartTotal, total);
  animateNumber(cartTopay, finalTotal);
  animateNumber(cartDiscount, discountAmount);

  cartItemCount.textContent = cart.reduce((sum, i) => sum + (i.qty || 1), 0);

  // Free delivery above ₹999
  const deliveryEl = document.getElementById("delivery-charge");
  if (deliveryEl) {
    if (total >= 999) {
      deliveryEl.textContent = "FREE";
      deliveryEl.className = "free-delivery";
    } else {
      deliveryEl.textContent = "₹49";
      deliveryEl.className = "";
    }
  }
}

// ── ANIMATE NUMBER COUNTER ──────────────────
function animateNumber(el, target) {
  if (!el) return;
  const start = parseInt(el.textContent.replace(/,/g, "")) || 0;
  const diff = target - start;
  const duration = 400;
  const startTime = performance.now();

  function step(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3); // ease out cubic
    el.textContent = Math.round(start + diff * ease).toLocaleString();
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

// ── UPDATE CART COUNT IN HEADER ─────────────
function updateCartCount() {
  const total = cart.reduce((sum, i) => sum + (i.qty || 1), 0);
  if (cartCount) cartCount.textContent = total;
}

// ── CHANGE QUANTITY ─────────────────────────
function changeQty(index, delta) {
  const item = cart[index];
  if (!item) return;

  const newQty = (item.qty || 1) + delta;

  if (newQty <= 0) {
    removeFromCart(index);
    return;
  }

  cart[index].qty = newQty;
  localStorage.setItem("cart", JSON.stringify(cart));

  // Update qty display with bounce animation
  const qtyEl = document.getElementById(`qty-${index}`);
  if (qtyEl) {
    qtyEl.textContent = newQty;
    qtyEl.style.transform = "scale(1.4)";
    qtyEl.style.color = "#f5c518";
    setTimeout(() => {
      qtyEl.style.transform = "scale(1)";
      qtyEl.style.color = "";
    }, 200);
  }

  // Update price on card
  const card = document.getElementById(`cart-item-${index}`);
  if (card) {
    const priceEl = card.querySelector(".cart-item-price");
    if (priceEl) priceEl.textContent = `₹${(item.price * newQty).toLocaleString()}`;
  }

  // Recalculate totals
  const total = cart.reduce((sum, i) => sum + i.price * (i.qty || 1), 0);
  updateTotals(total);
  updateCartCount();
}

// ── REMOVE FROM CART ────────────────────────
function removeFromCart(index) {
  const card = document.getElementById(`cart-item-${index}`);

  if (card) {
    // Slide out animation
    card.style.transition = "all 0.35s ease";
    card.style.transform = "translateX(100px)";
    card.style.opacity = "0";
    card.style.maxHeight = card.offsetHeight + "px";

    setTimeout(() => {
      card.style.maxHeight = "0";
      card.style.padding = "0";
      card.style.margin = "0";
      card.style.overflow = "hidden";
    }, 200);

    setTimeout(() => {
      cart.splice(index, 1);
      localStorage.setItem("cart", JSON.stringify(cart));
      renderCart();
    }, 400);
  } else {
    cart.splice(index, 1);
    localStorage.setItem("cart", JSON.stringify(cart));
    renderCart();
  }
}

// ── PROMO CODE ──────────────────────────────
function applyPromo() {
  if (promoApplied) return;

  const code = document.getElementById("promo-input").value.trim().toUpperCase();
  const msg  = document.getElementById("promo-msg");
  const total = cart.reduce((sum, i) => sum + i.price * (i.qty || 1), 0);

  const promoCodes = {
    "BUYBEE10": 0.10,
    "SAVE20":   0.20,
    "STUDENT":  0.15
  };

  if (promoCodes[code]) {
    discountAmount = Math.round(total * promoCodes[code]);
    promoApplied = true;
    msg.style.color = "#22c55e";
    msg.textContent = `✅ ${Math.round(promoCodes[code] * 100)}% discount applied!`;
    document.getElementById("promo-input").disabled = true;
    updateTotals(total);

    // Animate discount row
    const discountRow = document.querySelector(".discount-row");
    if (discountRow) {
      discountRow.style.color = "#22c55e";
      discountRow.style.transform = "scale(1.04)";
      setTimeout(() => discountRow.style.transform = "", 300);
    }
  } else {
    msg.style.color = "#ef4444";
    msg.textContent = "❌ Invalid promo code";
    setTimeout(() => msg.textContent = "", 2000);
  }
}

// ── AI "COMPLETE THE LOOK" SUGGESTION ───────
async function getAISuggestion() {
  if (cart.length === 0) return;

  const GROQ_API_KEY = "Your Groq Key here";

  const itemNames = cart.map(i => i.name).join(", ");

  const box  = document.getElementById("ai-suggest-box");
  const text = document.getElementById("ai-suggest-text");
  if (!box || !text) return;

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        max_tokens: 80,
        messages: [
          {
            role: "system",
            content: "You are a fashion assistant. Given cart items, suggest ONE complementary product in 1-2 short sentences. Be specific and friendly. No bullet points."
          },
          {
            role: "user",
            content: `Cart contains: ${itemNames}. Suggest one more item to complete the look.`
          }
        ]
      })
    });

    const data = await response.json();
    const suggestion = data.choices?.[0]?.message?.content;

    if (suggestion) {
      box.style.display = "block";
      text.textContent = suggestion;
    }

  } catch (err) {
    console.log("AI suggestion error:", err.message);
  }
}

renderCart();