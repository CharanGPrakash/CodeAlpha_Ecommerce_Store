const GROQ_API_KEY = "Your groq key here"; // ← paste your gsk_... key here

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

let chatOpen = false;
let chatHistory = [];
let isTyping = false;

const SYSTEM_PROMPT = `You are BuyBee's friendly AI shopping assistant 🐝.
You help users find products, compare items, suggest outfits, and answer shopping questions.
BuyBee sells: clothing, footwear, accessories, electronics, and bags.
Top brands available: Nike, Adidas, Puma, Levi's, Zara, H&M, Reebok, Tommy Hilfiger.
Keep responses short, friendly and helpful. Use emojis occasionally.
If asked about prices, mention items range from ₹499 to ₹5000+.
Never make up specific product details that aren't in the store.`;

function toggleChat() {
  const box = document.getElementById("ai-chat-box");
  const toggle = document.getElementById("ai-chat-toggle");
  chatOpen = !chatOpen;

  if (chatOpen) {
    box.style.display = "flex";
    box.style.flexDirection = "column";
    toggle.classList.add("active");
    if (chatHistory.length === 0) {
      appendMessage("bot", "Hey there! 👋 I'm BuyBee's AI assistant. I can help you find products, suggest outfits, compare brands, or answer any shopping questions. What are you looking for today?");
      showSuggestions();
    }
    document.getElementById("chat-input").focus();
  } else {
    box.style.display = "none";
    toggle.classList.remove("active");
  }
}

function showSuggestions() {
  const messages = document.getElementById("chat-messages");
  const chips = document.createElement("div");
  chips.className = "chat-chips";
  chips.id = "chat-chips";
  chips.innerHTML = `
    <button onclick="sendQuickMessage('Show me trending products')">🔥 Trending</button>
    <button onclick="sendQuickMessage('Suggest an outfit under ₹2000')">👕 Outfit ideas</button>
    <button onclick="sendQuickMessage('Best Nike shoes available')">👟 Nike shoes</button>
    <button onclick="sendQuickMessage('What electronics do you have?')">🎧 Electronics</button>
  `;
  messages.appendChild(chips);
  messages.scrollTop = messages.scrollHeight;
}

async function sendChat() {
  const input = document.getElementById("chat-input");
  const message = input.value.trim();
  if (!message || isTyping) return;

  const chips = document.getElementById("chat-chips");
  if (chips) chips.remove();

  input.value = "";
  appendMessage("user", message);
  chatHistory.push({ role: "user", content: message });

  showTyping();

  try {
    const messages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...chatHistory.slice(-10)
    ];

    const response = await fetch(GROQ_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages,
        max_tokens: 300,
        temperature: 0.7
      })
    });

    const data = await response.json();

    if (!response.ok) throw new Error(`${response.status}: ${data.error?.message}`);

    const reply = data.choices[0].message.content;
    chatHistory.push({ role: "assistant", content: reply });

    hideTyping();
    appendMessage("bot", reply);

  } catch (err) {
    hideTyping();
    appendMessage("bot", "Sorry, I'm having trouble connecting 😅 Please try again!");
    console.error("Chatbot error:", err);
  }
}

function sendQuickMessage(msg) {
  document.getElementById("chat-input").value = msg;
  sendChat();
}

function appendMessage(sender, text) {
  const messages = document.getElementById("chat-messages");
  const bubble = document.createElement("div");
  bubble.classList.add("chat-bubble", sender === "user" ? "user-bubble" : "bot-bubble");
  bubble.innerHTML = text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\n/g, "<br>");
  messages.appendChild(bubble);
  messages.scrollTop = messages.scrollHeight;
}

function showTyping() {
  isTyping = true;
  const messages = document.getElementById("chat-messages");
  const typing = document.createElement("div");
  typing.classList.add("chat-bubble", "bot-bubble", "typing-indicator");
  typing.id = "typing-dots";
  typing.innerHTML = `<span></span><span></span><span></span>`;
  messages.appendChild(typing);
  messages.scrollTop = messages.scrollHeight;
}

function hideTyping() {
  isTyping = false;
  const dots = document.getElementById("typing-dots");
  if (dots) dots.remove();
}

document.addEventListener("click", (e) => {
  const widget = document.getElementById("ai-chat-widget");
  if (chatOpen && widget && !widget.contains(e.target)) toggleChat();
});
// Force chatbot widget to always stay on top
function fixChatWidget() {
  const widget = document.getElementById('ai-chat-widget');
  const toggle = document.getElementById('ai-chat-toggle');
  if (!widget || !toggle) return;

  widget.style.cssText = `
    position: fixed !important;
    bottom: 30px !important;
    right: 30px !important;
    z-index: 2147483647 !important;
    pointer-events: all !important;
  `;

  toggle.style.cssText = `
    width: 60px !important;
    height: 60px !important;
    border-radius: 50% !important;
    background: #f5c518 !important;
    border: none !important;
    font-size: 24px !important;
    cursor: pointer !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    box-shadow: 0 4px 20px rgba(245,197,24,0.5) !important;
    position: relative !important;
    z-index: 2147483647 !important;
    pointer-events: all !important;
  `;
}

// Run immediately and on every scroll
fixChatWidget();
window.addEventListener('scroll', fixChatWidget);
window.addEventListener('resize', fixChatWidget);