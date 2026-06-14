const API_URL = "http://localhost:5000/api";
const cartItemsDiv = document.getElementById("cart-items");
const cartTotal = document.getElementById("cart-total");
const cartTopay = document.getElementById("cart-topay");
const cartCount = document.getElementById("cart-count");
const cartItemCount = document.getElementById("cart-item-count");

let cart = JSON.parse(localStorage.getItem("cart")) || [];

function renderCart() {
  cartItemsDiv.innerHTML = "";

  if (cart.length === 0) {
    cartItemsDiv.innerHTML = `
      <div style="text-align:center;padding:60px;color:#888;">
        <div style="font-size:60px;margin-bottom:20px;">🛒</div>
        <h3 style="margin-bottom:10px;">Your cart is empty</h3>
        <p>Add some products to get started</p>
        <a href="index.html"><button style="margin-top:20px;padding:12px 30px;background:#f5c518;color:#000;border:none;border-radius:8px;font-weight:600;cursor:pointer;">Shop Now</button></a>
      </div>
    `;
    cartCount.textContent = 0;
    cartItemCount.textContent = 0;
    cartTotal.textContent = 0;
    cartTopay.textContent = 0;
    return;
  }

  let total = 0;

  cart.forEach((item, index) => {
    total += item.price;

    const itemDiv = document.createElement("div");
    itemDiv.classList.add("cart-item-card");
    itemDiv.innerHTML = `
      <img src="${item.image}" alt="${item.name}">
      <div class="cart-item-info">
        <h3>${item.name}</h3>
        <p>₹${item.price}</p>
      </div>
      <button class="cart-item-remove" onclick="removeFromCart(${index})">
        🗑️ Remove
      </button>
    `;
    cartItemsDiv.appendChild(itemDiv);
  });

  cartTotal.textContent = total;
  cartTopay.textContent = total;
  cartCount.textContent = cart.length;
  cartItemCount.textContent = cart.length;
}

function removeFromCart(index) {
  cart.splice(index, 1);
  localStorage.setItem("cart", JSON.stringify(cart));
  renderCart();
}

renderCart();