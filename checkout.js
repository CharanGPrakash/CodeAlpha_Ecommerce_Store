const API_URL = "http://localhost:5000/api";
const orderSummary = document.getElementById("order-summary");
const orderTotal = document.getElementById("order-total");
const checkoutForm = document.getElementById("checkout-form");
const confirmation = document.getElementById("confirmation");

let cart = JSON.parse(localStorage.getItem("cart")) || [];
const token = localStorage.getItem("token");
const user = JSON.parse(localStorage.getItem("user"));

// Redirect to login if not logged in
if (!token) {
  alert("Please login to checkout!");
  window.location.href = "login.html";
}

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
}

checkoutForm.addEventListener("submit", async function (e) {
  e.preventDefault();

  const address = document.getElementById("address").value;
  const phone = document.getElementById("phone").value;

  const orderItems = cart.map(item => ({
    product: item._id,
    name: item.name,
    price: item.price,
    quantity: 1
  }));

  const totalPrice = cart.reduce((sum, item) => sum + item.price, 0);

  try {
    const response = await fetch(`${API_URL}/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        items: orderItems,
        totalPrice,
        address,
        phone
      })
    });

    const data = await response.json();

    if (response.ok) {
      // Show confirmation
      document.getElementById("confirm-name").textContent = user.name;
      document.getElementById("confirm-address").textContent = address;
      checkoutForm.style.display = "none";
      confirmation.style.display = "block";

      // Clear cart
      localStorage.removeItem("cart");
    } else {
      alert(data.message);
    }

  } catch (err) {
    alert("Server error. Make sure backend is running.");
  }
});

renderOrderSummary();