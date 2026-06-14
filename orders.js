const API_URL = "http://localhost:5000/api";
const ordersList = document.getElementById("orders-list");
const token = localStorage.getItem("token");
const cartCount = document.getElementById("cart-count");

// Update cart count
let cart = JSON.parse(localStorage.getItem("cart")) || [];
if (cartCount) cartCount.textContent = cart.length;

// Redirect if not logged in
if (!token) {
  alert("Please login to view orders!");
  window.location.href = "login.html";
}

async function renderOrders() {
  try {
    const response = await fetch(`${API_URL}/orders/myorders`, {
      headers: { "Authorization": `Bearer ${token}` }
    });

    const orders = await response.json();

    if (orders.length === 0) {
      ordersList.innerHTML = `
        <div style="text-align:center;padding:60px;color:#888;">
          <div style="font-size:60px;margin-bottom:20px;">📦</div>
          <h3 style="margin-bottom:10px;">No orders yet</h3>
          <p>You haven't placed any orders yet</p>
          <a href="index.html"><button style="margin-top:20px;padding:12px 30px;background:#f5c518;color:#000;border:none;border-radius:8px;font-weight:600;cursor:pointer;">Shop Now</button></a>
        </div>
      `;
      return;
    }

    ordersList.innerHTML = "";

    orders.forEach(order => {
      const div = document.createElement("div");
      div.classList.add("order-card");
      div.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:15px;">
          <div>
            <p style="font-size:12px;color:#888;">Order ID</p>
            <p style="font-size:13px;font-weight:600;">${order._id}</p>
          </div>
          <span class="status">${order.status}</span>
        </div>
        <div style="display:flex;justify-content:space-between;margin-bottom:15px;">
          <div>
            <p style="font-size:12px;color:#888;">Date</p>
            <p style="font-size:13px;">${new Date(order.createdAt).toLocaleDateString('en-IN', {day:'numeric',month:'long',year:'numeric'})}</p>
          </div>
          <div style="text-align:right;">
            <p style="font-size:12px;color:#888;">Total</p>
            <p style="font-size:18px;font-weight:700;color:#f5c518;">₹${order.totalPrice}</p>
          </div>
        </div>
        <div style="border-top:1px solid #2a2a2a;padding-top:15px;">
          <p style="font-size:12px;color:#888;margin-bottom:8px;">Items Ordered</p>
          ${order.items.map(item => `
            <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:5px;">
              <span>${item.name} x${item.quantity}</span>
              <span style="color:#f5c518;">₹${item.price}</span>
            </div>
          `).join("")}
        </div>
        <div style="border-top:1px solid #2a2a2a;padding-top:15px;margin-top:10px;">
          <p style="font-size:12px;color:#888;">Delivery Address</p>
          <p style="font-size:13px;">${order.address}</p>
        </div>
      `;
      ordersList.appendChild(div);
    });

  } catch (err) {
    ordersList.innerHTML = "<p style='color:#888;text-align:center;padding:40px;'>Failed to load orders. Make sure backend is running.</p>";
  }
}

renderOrders();