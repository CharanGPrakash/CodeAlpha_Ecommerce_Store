// Sample product data
const products = [
  { id: 1, name: "T-Shirt", price: 499, image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300" },
  { id: 2, name: "Sneakers", price: 1999, image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300" },
  { id: 3, name: "Backpack", price: 1299, image: "https://images.unsplash.com/photo-1547949003-9792a18a2601?w=300" },
  { id: 4, name: "Watch", price: 2499, image: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=300" },
  { id: 5, name: "Sunglasses", price: 799, image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=300" },
  { id: 6, name: "Cap", price: 399, image: "https://images.unsplash.com/photo-1521369909029-2afed882baee?w=300" },
  { id: 7, name: "Jacket", price: 2999, image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=300" },
  { id: 8, name: "Headphones", price: 1599, image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300" },
  { id: 9, name: "Wallet", price: 699, image: "https://images.unsplash.com/photo-1627123424574-724758594e93?w=300" },
  { id: 10, name: "Shoes", price: 2199, image: "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=300" }
];


const productList = document.getElementById("product-list");
const cartCount = document.getElementById("cart-count");

// Render products
function renderProducts() {
  productList.innerHTML = "";
  products.forEach(product => {
    const card = document.createElement("div");
    card.classList.add("product-card");
    card.innerHTML = `
      <img src="${product.image}" alt="${product.name}">
      <h3>${product.name}</h3>
      <p>₹${product.price}</p>
      <button onclick="addToCart(${product.id})">Add to Cart</button>
    `;
    productList.appendChild(card);
  });
}

// Add to cart
function addToCart(id) {
  const product = products.find(p => p.id === id);

  // Load existing cart from localStorage
  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  cart.push(product);

  // Save back to localStorage
  localStorage.setItem("cart", JSON.stringify(cart));

  cartCount.textContent = cart.length;
}

// On page load, set cart count from localStorage
function updateCartCount() {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  cartCount.textContent = cart.length;
}
renderProducts();
updateCartCount();