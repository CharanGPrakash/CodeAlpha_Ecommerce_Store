const orderSummary = document.getElementById("order-summary");
const orderTotal = document.getElementById("order-total");
const cartCount = document.getElementById("cart-count");
const checkoutForm = document.getElementById("checkout-form");
const confirmation = document.getElementById("confirmation");

let cart = JSON.parse(localStorage.getItem("cart")) || [];

function renderOrderSummary() {
  orderSummary.innerHTML = "";
  let total = 0;

  cart.forEach(item => {
    total += item.price;
    const p = document.createElement("p");
    p.textContent = `${item.name} - ₹${item.price}`;
    orderSummary.appendChild(p);
  });

  orderTotal.textContent = total;
  cartCount.textContent = cart.length;
}

checkoutForm.addEventListener("submit", function (e) {
  e.preventDefault();

  const name = document.getElementById("name").value;
  const address = document.getElementById("address").value;

  // Show confirmation
  document.getElementById("confirm-name").textContent = name;
  document.getElementById("confirm-address").textContent = address;

  checkoutForm.style.display = "none";
  confirmation.style.display = "block";

  // Clear cart
  localStorage.removeItem("cart");
  cartCount.textContent = "0";
});

renderOrderSummary();