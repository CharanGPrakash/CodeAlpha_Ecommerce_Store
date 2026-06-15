const API_URL = "http://localhost:5000/api";

// ── Switch between Login / Register tabs ────
function switchTab(tab) {
  document.querySelectorAll(".auth-tab").forEach((t, i) => {
    t.classList.toggle("active", (i === 0 && tab === "login") || (i === 1 && tab === "register"));
  });
  document.getElementById("login-section").classList.toggle("active", tab === "login");
  document.getElementById("register-section").classList.toggle("active", tab === "register");
  clearMessage();
}

// Keep old toggleForm() working if called anywhere
function toggleForm() {
  const isLogin = document.getElementById("login-section").classList.contains("active");
  switchTab(isLogin ? "register" : "login");
}

// ── Show message ────────────────────────────
function showMessage(text, type = "error") {
  const el = document.getElementById("auth-message");
  el.textContent = text;
  el.className = type; // "success" or "error"
}

function clearMessage() {
  const el = document.getElementById("auth-message");
  el.textContent = "";
  el.className = "";
}

// ── Password show/hide toggle ───────────────
function togglePwd(inputId, btn) {
  const input = document.getElementById(inputId);
  const icon = btn.querySelector("i");
  if (input.type === "password") {
    input.type = "text";
    icon.className = "fa fa-eye-slash";
  } else {
    input.type = "password";
    icon.className = "fa fa-eye";
  }
}

// ── Set button loading state ────────────────
function setLoading(btnId, loading) {
  const btn = document.getElementById(btnId);
  if (loading) btn.classList.add("loading");
  else btn.classList.remove("loading");
}

// ── Show success overlay ────────────────────
function showSuccess() {
  document.getElementById("success-overlay").classList.add("show");
}

// ── Login ───────────────────────────────────
async function login() {
  const email    = document.getElementById("login-email").value.trim();
  const password = document.getElementById("login-password").value;

  if (!email || !password) {
    showMessage("Please fill in all fields ⚠️");
    return;
  }

  setLoading("login-btn", true);
  clearMessage();

  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (response.ok) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      showSuccess();
      setTimeout(() => window.location.href = "index.html", 1800);
    } else {
      showMessage(data.message || "Login failed. Try again.");
      setLoading("login-btn", false);
    }

  } catch (err) {
    showMessage("Cannot connect to server. Make sure backend is running. 🔌");
    setLoading("login-btn", false);
  }
}

// ── Register ────────────────────────────────
async function register() {
  const name     = document.getElementById("reg-name").value.trim();
  const email    = document.getElementById("reg-email").value.trim();
  const password = document.getElementById("reg-password").value;

  if (!name || !email || !password) {
    showMessage("Please fill in all fields ⚠️");
    return;
  }

  if (password.length < 6) {
    showMessage("Password must be at least 6 characters 🔒");
    return;
  }

  setLoading("register-btn", true);
  clearMessage();

  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password })
    });

    const data = await response.json();

    if (response.ok) {
      showMessage("Account created! Switching to login... 🎉", "success");
      setLoading("register-btn", false);
      setTimeout(() => switchTab("login"), 1500);
    } else {
      showMessage(data.message || "Registration failed.");
      setLoading("register-btn", false);
    }

  } catch (err) {
    showMessage("Cannot connect to server. Make sure backend is running. 🔌");
    setLoading("register-btn", false);
  }
}