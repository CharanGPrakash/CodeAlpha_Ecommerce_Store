const API_URL = "http://localhost:5000/api";
const authMessage = document.getElementById("auth-message");

// Toggle between login and register forms
function toggleForm() {
  const loginSection = document.getElementById("login-section");
  const registerSection = document.getElementById("register-section");

  if (loginSection.style.display === "none") {
    loginSection.style.display = "block";
    registerSection.style.display = "none";
  } else {
    loginSection.style.display = "none";
    registerSection.style.display = "block";
  }
}

// Login
async function login() {
  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;

  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (response.ok) {
      // Save token and user info
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      authMessage.style.color = "green";
      authMessage.textContent = "Login successful! Redirecting...";
      setTimeout(() => window.location.href = "index.html", 1000);
    } else {
      authMessage.textContent = data.message;
    }

  } catch (err) {
    authMessage.textContent = "Server error. Make sure backend is running.";
  }
}

// Register
async function register() {
  const name = document.getElementById("reg-name").value;
  const email = document.getElementById("reg-email").value;
  const password = document.getElementById("reg-password").value;

  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password })
    });

    const data = await response.json();

    if (response.ok) {
      authMessage.style.color = "green";
      authMessage.textContent = "Registered successfully! Please login.";
      setTimeout(() => toggleForm(), 1000);
    } else {
      authMessage.textContent = data.message;
    }

  } catch (err) {
    authMessage.textContent = "Server error. Make sure backend is running.";
  }
}