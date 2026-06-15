const canvas = document.getElementById("particle-canvas");
const ctx = canvas.getContext("2d");

canvas.style.position = "fixed";
canvas.style.top = "0";
canvas.style.left = "0";
canvas.style.width = "100%";
canvas.style.height = "100%";
canvas.style.pointerEvents = "none";
canvas.style.zIndex = "0";

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resize();
window.addEventListener("resize", resize);

// Mouse tracking
const mouse = { x: -9999, y: -9999 };
window.addEventListener("mousemove", e => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
});
window.addEventListener("mouseleave", () => {
  mouse.x = -9999;
  mouse.y = -9999;
});

// Particle factory
function createParticle(x, y, burst = false) {
  const depth = Math.random(); // 0 = far, 1 = close
  return {
    x: x ?? Math.random() * canvas.width,
    y: y ?? Math.random() * canvas.height,
    radius: burst ? Math.random() * 2.5 + 1 : depth * 2.2 + 0.4,
    speedX: burst ? (Math.random() - 0.5) * 6 : (Math.random() - 0.5) * (depth * 0.8 + 0.1),
    speedY: burst ? (Math.random() - 0.5) * 6 : (Math.random() - 0.5) * (depth * 0.8 + 0.1),
    opacity: burst ? 0.9 : depth * 0.5 + 0.08,
    baseOpacity: burst ? 0.9 : depth * 0.5 + 0.08,
    life: burst ? 1.0 : null, // burst particles fade out
    depth,
    // Color: gold, soft white, or dim gold
    colorType: Math.random() < 0.6 ? "gold" : Math.random() < 0.5 ? "white" : "dim"
  };
}

// Init particles
const particles = [];
const COUNT = 100;
for (let i = 0; i < COUNT; i++) particles.push(createParticle());

// Click burst
window.addEventListener("click", e => {
  for (let i = 0; i < 12; i++) {
    particles.push(createParticle(e.clientX, e.clientY, true));
  }
});

function getColor(p) {
  if (p.colorType === "gold")  return `rgba(245, 197, 24, ${p.opacity})`;
  if (p.colorType === "white") return `rgba(255, 255, 240, ${p.opacity * 0.7})`;
  return `rgba(180, 140, 10, ${p.opacity * 0.5})`;
}

function getLineColor(opacity) {
  return `rgba(245, 197, 24, ${opacity})`;
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const toRemove = [];

  particles.forEach((p, idx) => {
    // Mouse attraction (only ambient particles)
    if (p.life === null) {
      const dx = mouse.x - p.x;
      const dy = mouse.y - p.y;
      const dist = Math.hypot(dx, dy);
      if (dist < 180 && dist > 0) {
        const force = (180 - dist) / 180 * 0.018;
        p.speedX += dx / dist * force;
        p.speedY += dy / dist * force;
        // Glow near mouse
        p.opacity = Math.min(p.baseOpacity * 2.5, 0.95);
      } else {
        p.opacity += (p.baseOpacity - p.opacity) * 0.05;
      }

      // Speed damping to prevent runaway
      p.speedX *= 0.995;
      p.speedY *= 0.995;
    }

    // Move
    p.x += p.speedX;
    p.y += p.speedY;

    // Bounce walls for ambient
    if (p.life === null) {
      if (p.x < 0 || p.x > canvas.width)  p.speedX *= -1;
      if (p.y < 0 || p.y > canvas.height) p.speedY *= -1;
      p.x = Math.max(0, Math.min(canvas.width, p.x));
      p.y = Math.max(0, Math.min(canvas.height, p.y));
    }

    // Burst particles: fade & remove
    if (p.life !== null) {
      p.life -= 0.022;
      p.opacity = p.baseOpacity * p.life;
      if (p.life <= 0) { toRemove.push(idx); return; }
    }

    // Draw particle with soft glow for close ones
    if (p.depth > 0.7 || p.life !== null) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius * 2.2, 0, Math.PI * 2);
      ctx.fillStyle = p.colorType === "gold"
        ? `rgba(245, 197, 24, ${p.opacity * 0.12})`
        : `rgba(255,255,200, ${p.opacity * 0.08})`;
      ctx.fill();
    }

    // Core dot
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
    ctx.fillStyle = getColor(p);
    ctx.fill();
  });

  // Remove dead burst particles (reverse to preserve indices)
  for (let i = toRemove.length - 1; i >= 0; i--) {
    particles.splice(toRemove[i], 1);
  }

  // Connecting lines (only between ambient particles, limit checks for perf)
  const ambient = particles.filter(p => p.life === null);
  const MAX_DIST = 130;

  for (let i = 0; i < ambient.length; i++) {
    for (let j = i + 1; j < ambient.length; j++) {
      const p1 = ambient[i], p2 = ambient[j];
      const dx = p1.x - p2.x;
      const dy = p1.y - p2.y;
      // Skip sqrt if clearly too far (fast rejection)
      if (Math.abs(dx) > MAX_DIST || Math.abs(dy) > MAX_DIST) continue;
      const dist = Math.hypot(dx, dy);
      if (dist < MAX_DIST) {
        const alpha = 0.18 * (1 - dist / MAX_DIST) * Math.min(p1.opacity, p2.opacity) * 2;
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.strokeStyle = getLineColor(alpha);
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }
    }
  }

  requestAnimationFrame(draw);
}

draw();