// script.js — Nakkashi Premium — GSAP + Three.js + Lenis smooth scroll
document.addEventListener("DOMContentLoaded", function () {
  initCursor();
  initNavigation();
  initSmoothScroll();
  initGSAP();
  if (document.getElementById("heroCanvas")) initThreeHero();
  initContactForm();
  initScrollAnimations();
});

/* ═══════════════════════════════════
   CUSTOM CURSOR
═══════════════════════════════════ */
function initCursor() {
  const dot  = document.createElement("div");
  const ring = document.createElement("div");
  dot.className  = "cursor";
  ring.className = "cursor-ring";
  document.body.append(dot, ring);

  let mx = 0, my = 0, rx = 0, ry = 0;

  document.addEventListener("mousemove", (e) => {
    mx = e.clientX; my = e.clientY;
    dot.style.left  = mx + "px";
    dot.style.top   = my + "px";
  });

  function animateRing() {
    rx += (mx - rx) * 0.12;
    ry += (my - ry) * 0.12;
    ring.style.left = rx + "px";
    ring.style.top  = ry + "px";
    requestAnimationFrame(animateRing);
  }
  animateRing();
}

/* ═══════════════════════════════════
   NAVIGATION
═══════════════════════════════════ */
function initNavigation() {
  const header     = document.querySelector("header");
  const menuBtn    = document.querySelector(".mobile-menu-btn");
  const navMenu    = document.querySelector(".mobile-nav-menu");
  const closeBtn   = document.querySelector(".mobile-nav-close");
  const navLinks   = document.querySelectorAll(".mobile-nav-links a");

  if (!header || !menuBtn || !navMenu) return;

  // Header highlight on scroll
  window.addEventListener("scroll", () => {
    header.classList.toggle("scrolled", window.scrollY > 60);
  }, { passive: true });

  var scrollY = 0;

  function openMenu() {
    scrollY = window.scrollY;
    document.body.style.top = "-" + scrollY + "px";
    navMenu.classList.add("active");
    document.body.classList.add("no-scroll");
  }

  function closeMenu() {
    navMenu.classList.remove("active");
    document.body.classList.remove("no-scroll");
    document.body.style.top = "";
    window.scrollTo(0, scrollY);
  }

  menuBtn.addEventListener("click", (e) => { e.stopPropagation(); openMenu(); });
  if (closeBtn) closeBtn.addEventListener("click", closeMenu);
  navLinks.forEach((l) => l.addEventListener("click", closeMenu));
  document.addEventListener("click", (e) => {
    if (navMenu.classList.contains("active") && !navMenu.contains(e.target) && !menuBtn.contains(e.target)) closeMenu();
  });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeMenu(); });
}

/* ═══════════════════════════════════
   THREE.JS HERO — Particle Field
═══════════════════════════════════ */
function initThreeHero() {
  const canvas = document.getElementById("heroCanvas");
  if (!canvas || typeof THREE === "undefined") return;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(canvas.parentElement.clientWidth, canvas.parentElement.clientHeight);

  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, canvas.clientWidth / canvas.clientHeight, 0.1, 200);
  camera.position.set(0, 0, 50);

  // ── Particles ──
  const count = 3000;
  const geo   = new THREE.BufferGeometry();
  const pos   = new Float32Array(count * 3);
  const col   = new Float32Array(count * 3);
  // Jupiter palette: reds, ambers, cream bands
  const colPalette = [
    new THREE.Color("#c0392b"),   // Jupiter red
    new THREE.Color("#d4732a"),   // rusty amber
    new THREE.Color("#e8955a"),   // amber-light
    new THREE.Color("#c8a882"),   // cream band
    new THREE.Color("#8b2318"),   // deep red
  ];

  for (let i = 0; i < count; i++) {
    pos[i * 3]     = (Math.random() - 0.5) * 120;
    pos[i * 3 + 1] = (Math.random() - 0.5) * 80;
    pos[i * 3 + 2] = (Math.random() - 0.5) * 80;
    const c = colPalette[Math.floor(Math.random() * colPalette.length)];
    col[i * 3]     = c.r;
    col[i * 3 + 1] = c.g;
    col[i * 3 + 2] = c.b;
  }

  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geo.setAttribute("color",    new THREE.BufferAttribute(col, 3));

  const mat = new THREE.PointsMaterial({
    size: 0.3,
    vertexColors: true,
    transparent: true,
    opacity: 0.75,
    sizeAttenuation: true,
  });

  const particles = new THREE.Points(geo, mat);
  scene.add(particles);

  // ── Floating wireframe torus (decorative) ──
  const torusGeo = new THREE.TorusGeometry(12, 0.05, 4, 60);
  const torusMat = new THREE.MeshBasicMaterial({ color: 0xc0392b, transparent: true, opacity: 0.10 });
  const torus    = new THREE.Mesh(torusGeo, torusMat);
  torus.rotation.x = Math.PI / 4;
  scene.add(torus);

  const torus2    = new THREE.Mesh(new THREE.TorusGeometry(20, 0.03, 4, 80), new THREE.MeshBasicMaterial({ color: 0xd4732a, transparent: true, opacity: 0.06 }));
  torus2.rotation.y = Math.PI / 3;
  scene.add(torus2);

  // ── Mouse parallax ──
  let mouseX = 0, mouseY = 0;
  document.addEventListener("mousemove", (e) => {
    mouseX = (e.clientX / window.innerWidth  - 0.5) * 2;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  let animId;
  function animate() {
    animId = requestAnimationFrame(animate);
    const t = Date.now() * 0.0003;

    particles.rotation.y =  t * 0.06 + mouseX * 0.08;
    particles.rotation.x = -t * 0.04 + mouseY * 0.05;

    torus.rotation.y += 0.002;
    torus.rotation.z += 0.001;
    torus2.rotation.x += 0.0015;
    torus2.rotation.z += 0.001;

    renderer.render(scene, camera);
  }
  animate();

  // ── Resize ──
  const onResize = () => {
    const w = canvas.parentElement.clientWidth;
    const h = canvas.parentElement.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  };
  window.addEventListener("resize", onResize);

  // ── Cleanup on page leave ──
  window.addEventListener("beforeunload", () => { cancelAnimationFrame(animId); renderer.dispose(); });
}

/* ═══════════════════════════════════
   SMOOTH SCROLL (Lenis-style via RAF)
═══════════════════════════════════ */
function initSmoothScroll() {
  // Use native smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href");
      if (id === "#") return;
      const el = document.querySelector(id);
      if (el) {
        e.preventDefault();
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });
}

/* ═══════════════════════════════════
   GSAP ANIMATIONS
═══════════════════════════════════ */
function initGSAP() {
  if (typeof gsap === "undefined") return;

  // ── Register ScrollTrigger ──
  if (gsap.registerPlugin && typeof ScrollTrigger !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
  }

  // ── Hero text entrance ──
  const heroEyebrow  = document.querySelector(".hero-eyebrow");
  const heroTitle    = document.querySelector(".hero .hero-title, .hero-title");
  const heroSubtitle = document.querySelector(".hero-subtitle");
  const heroCta      = document.querySelector(".hero-cta");
  const heroScroll   = document.querySelector(".hero-scroll");

  if (heroEyebrow) {
    gsap.to(heroEyebrow, { opacity: 1, y: 0, duration: 1.2, delay: 0.4, ease: "power4.out" });
  }
  if (heroTitle) {
    gsap.to(heroTitle, { opacity: 1, y: 0, duration: 1.4, delay: 0.7, ease: "power4.out" });
  }
  if (heroSubtitle) {
    gsap.to(heroSubtitle, { opacity: 1, y: 0, duration: 1.2, delay: 1.0, ease: "power3.out" });
  }
  if (heroCta) {
    gsap.to(heroCta, { opacity: 1, y: 0, duration: 1, delay: 1.3, ease: "power3.out" });
  }
  if (heroScroll) {
    gsap.to(heroScroll, { opacity: 1, duration: 1, delay: 2.2, ease: "power2.out" });
  }

  // ── Page hero ──
  const pageHero = document.querySelector(".page-hero-content");
  if (pageHero) {
    gsap.fromTo(Array.from(pageHero.children),
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, stagger: 0.15, duration: 1.0, delay: 0.3, ease: "power3.out" }
    );
  }
}

/* ═══════════════════════════════════
   SCROLL ANIMATIONS (IntersectionObserver fallback)
═══════════════════════════════════ */
function initScrollAnimations() {
  var elements = document.querySelectorAll(".reveal, .reveal-left, .reveal-right, .reveal-scale");
  if (elements.length === 0) return;

  var useGSAP = typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined";

  if (useGSAP) {
    gsap.registerPlugin(ScrollTrigger);
    elements.forEach(function(el, i) {
      var from = { opacity: 0, y: 40, x: 0, scale: 1 };
      if (el.classList.contains("reveal-left"))  { from.x = -40; from.y = 0; }
      if (el.classList.contains("reveal-right")) { from.x =  40; from.y = 0; }
      if (el.classList.contains("reveal-scale")) { from.scale = 0.93; from.y = 0; }
      gsap.fromTo(el, from, {
        opacity: 1, x: 0, y: 0, scale: 1,
        duration: 0.9,
        ease: "power3.out",
        delay: (i % 3) * 0.1,
        scrollTrigger: { trigger: el, start: "top 90%", toggleActions: "play none none none" }
      });
    });
  } else {
    elements.forEach(function(el, i) {
      var delay = (i % 3) * 0.1;
      el.style.opacity = "0";
      el.style.transition = "opacity 0.8s ease " + delay + "s, transform 0.8s ease " + delay + "s";
      if (el.classList.contains("reveal-left"))       el.style.transform = "translateX(-30px)";
      else if (el.classList.contains("reveal-right")) el.style.transform = "translateX(30px)";
      else if (el.classList.contains("reveal-scale")) el.style.transform = "scale(0.95)";
      else                                             el.style.transform = "translateY(30px)";
    });
    var obs = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          entry.target.style.opacity = "1";
          entry.target.style.transform = "translateX(0) translateY(0) scale(1)";
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: "0px 0px -40px 0px" });
    elements.forEach(function(el) { obs.observe(el); });
  }
}

/* ═══════════════════════════════════
   CONTACT FORM
═══════════════════════════════════ */
function initContactForm() {
  const form = document.querySelector(".contact-form form");
  if (!form) return;
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const name    = document.getElementById("name")?.value    || "";
    const email   = document.getElementById("email")?.value   || "";
    const subject = document.getElementById("subject")?.value || "";
    const message = document.getElementById("message")?.value || "";
    const text    = `Name: ${name}%0AEmail: ${email}%0ASubject: ${subject}%0AMessage: ${message}`;
    window.open(`https://wa.me/917623861655?text=${text}`, "_blank");
    showToast("Opening WhatsApp…");
    form.reset();
  });
}

/* ═══════════════════════════════════
   TOAST NOTIFICATION
═══════════════════════════════════ */
function showToast(msg) {
  const t = document.createElement("div");
  t.textContent = msg;
  Object.assign(t.style, {
    position: "fixed", bottom: "2rem", right: "2rem",
    background: "var(--gold)", color: "var(--ink)",
    padding: "0.9rem 1.8rem", borderRadius: "2px",
    fontFamily: "Jost, sans-serif", fontSize: "0.8rem",
    fontWeight: "600", letterSpacing: "1px",
    textTransform: "uppercase", zIndex: "99999",
    transform: "translateY(60px)", opacity: "0",
    transition: "all 0.4s var(--ease-out)",
    boxShadow: "0 8px 30px rgba(0,0,0,0.4)",
  });
  document.body.appendChild(t);
  requestAnimationFrame(() => {
    t.style.transform = "translateY(0)";
    t.style.opacity = "1";
  });
  setTimeout(() => {
    t.style.transform = "translateY(60px)";
    t.style.opacity = "0";
    setTimeout(() => t.remove(), 400);
  }, 3000);
}
