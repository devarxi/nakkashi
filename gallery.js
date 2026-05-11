// gallery.js — Nakkashi Premium Art Gallery
document.addEventListener("DOMContentLoaded", function () {
  initGallery();
});

function initGallery() {
  const genreButtons = document.querySelectorAll(".genre-btn");
  const initialState = document.getElementById("initialState");
  const emptyState   = document.getElementById("emptyState");

  let currentGenre = null;

  genreButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const genre = this.getAttribute("data-genre");
      genreButtons.forEach((btn) => btn.classList.remove("active"));
      this.classList.add("active");
      filterArtworks(genre);
    });
  });

  function filterArtworks(genre) {
    initialState.style.display = "none";
    if (emptyState) emptyState.style.display = "none";

    let filtered = artworks.filter((art) => art.genre === genre);

    if (filtered.length > 0) {
      createGenreModal(genre, filtered);
    } else {
      if (emptyState) emptyState.style.display = "block";
    }
  }

  function createGenreModal(genre, list) {
    const existing = document.getElementById("genreModal");
    if (existing) existing.remove();

    const genreTitles = {
      sketches:   "Make to Order Sketches",
      wallpieces: "Customized Wallpieces",
      other:      "Conceptual Interior",
    };

    const modal = document.createElement("div");
    modal.id = "genreModal";
    modal.className = "genre-modal";

    modal.innerHTML = `
      <div class="genre-modal-content">
        <div class="genre-modal-header">
          <h3>${genreTitles[genre] || genre}</h3>
          <button class="genre-modal-close" aria-label="Close">✕</button>
        </div>
        <div class="genre-modal-grid" id="genreModalGrid"></div>
      </div>
    `;

    document.body.appendChild(modal);
    document.body.style.overflow = "hidden";

    const grid = document.getElementById("genreModalGrid");
    list.forEach((artwork, i) => {
      const card = createArtCard(artwork);
      card.style.animationDelay = `${i * 0.05}s`;
      grid.appendChild(card);
    });

    const closeBtn = modal.querySelector(".genre-modal-close");
    closeBtn.addEventListener("click", () => closeGenreModal());
    modal.addEventListener("click", (e) => { if (e.target === modal) closeGenreModal(); });

    function closeGenreModal() {
      modal.style.animation = "none";
      modal.style.opacity = "0";
      modal.style.transition = "opacity 0.3s";
      setTimeout(() => {
        modal.remove();
        document.body.style.overflow = "";
        if (initialState) initialState.style.display = "block";
      }, 300);
    }
  }
}

function createArtCard(artwork) {
  const card = document.createElement("div");
  card.className = `art-card${artwork.featured ? " featured" : ""}`;
  card.setAttribute("data-genre", artwork.genre);

  const thumb = artwork.images[0];
  const multiCount = artwork.images.length;

  card.innerHTML = `
    <div class="art-image-container">
      <img src="${thumb}" alt="${artwork.title || "Artwork"}" class="art-image" loading="lazy">
      <div class="art-overlay">
        <div class="art-actions">
          <button class="art-view-btn">View Details</button>
        </div>
      </div>
      ${artwork.featured ? '<div class="featured-badge">Featured</div>' : ""}
      ${multiCount > 1 ? `<div class="multi-image-badge">📷 ${multiCount}</div>` : ""}
    </div>
    <div class="art-info">
      <h3 class="art-title">${artwork.title || "Untitled"}</h3>
      <p class="art-description">${artwork.description || ""}</p>
      <div class="art-meta">
        <span class="art-genre">${getGenreDisplayName(artwork.genre)}</span>
        <span class="art-size">${artwork.size}</span>
      </div>
    </div>
  `;

  card.querySelector(".art-view-btn").addEventListener("click", (e) => {
    e.stopPropagation();
    openArtworkModal(artwork);
  });
  card.addEventListener("click", () => openArtworkModal(artwork));

  return card;
}

function getGenreDisplayName(genre) {
  return { sketches: "Sketch", wallpieces: "Wall Piece", other: "Conceptual" }[genre] || genre;
}

// ── Artwork Modal with Slider ──
function openArtworkModal(artwork) {
  const modal        = document.getElementById("imageModal");
  const modalContent = document.querySelector(".modal-content");

  modalContent.innerHTML = "";

  modalContent.innerHTML = `
    <span class="modal-close" id="modalClose">✕</span>
    <div class="slider-container">
      <div class="slider-track" id="sliderTrack">
        ${artwork.images.map((img, i) => `
          <div class="slide${i === 0 ? " active" : ""}">
            <img src="${img}" alt="${artwork.title || "Artwork"} — ${i + 1}" class="modal-image" loading="lazy">
          </div>
        `).join("")}
      </div>
      ${artwork.images.length > 1 ? `
        <button class="slider-nav slider-prev" id="sliderPrev">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>
        </button>
        <button class="slider-nav slider-next" id="sliderNext">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>
        </button>
        <div class="slider-dots" id="sliderDots">
          ${artwork.images.map((_, i) => `<span class="dot${i === 0 ? " active" : ""}" data-index="${i}"></span>`).join("")}
        </div>
      ` : ""}
    </div>
    <div class="modal-info">
      <h3 class="modal-title">${artwork.title || "Untitled"}</h3>
      <p class="modal-description">${artwork.description || ""}</p>
      <div class="modal-meta">
        <span class="modal-genre">${getGenreDisplayName(artwork.genre)}</span>
        <span class="modal-size">${artwork.size}</span>
        ${artwork.images.length > 1 ? `<span class="image-counter">1 / ${artwork.images.length}</span>` : ""}
      </div>
    </div>
  `;

  modal.style.display = "flex";
  document.body.style.overflow = "hidden";

  if (artwork.images.length > 1) initSlider(artwork);

  document.getElementById("modalClose").addEventListener("click", closeModal);
  modal.addEventListener("click", (e) => { if (e.target === modal) closeModal(); });

  const escHandler = (e) => { if (e.key === "Escape") { closeModal(); document.removeEventListener("keydown", escHandler); } };
  document.addEventListener("keydown", escHandler);
}

function initSlider(artwork) {
  const track       = document.getElementById("sliderTrack");
  const slides      = document.querySelectorAll("#sliderTrack .slide");
  const dots        = document.querySelectorAll("#sliderDots .dot");
  const prev        = document.getElementById("sliderPrev");
  const next        = document.getElementById("sliderNext");
  const counter     = document.querySelector(".image-counter");

  let cur = 0;
  const total = artwork.images.length;

  function go(n) {
    cur = (n + total) % total;
    track.style.transform = `translateX(-${cur * 100}%)`;
    slides.forEach((s, i) => s.classList.toggle("active", i === cur));
    dots.forEach((d, i)  => d.classList.toggle("active", i === cur));
    if (counter) counter.textContent = `${cur + 1} / ${total}`;
  }

  next.addEventListener("click", () => go(cur + 1));
  prev.addEventListener("click", () => go(cur - 1));
  dots.forEach((d) => d.addEventListener("click", () => go(+d.dataset.index)));

  const arrowHandler = (e) => {
    if (e.key === "ArrowLeft")  go(cur - 1);
    if (e.key === "ArrowRight") go(cur + 1);
  };
  document.addEventListener("keydown", arrowHandler);

  // Touch swipe
  let sx = 0;
  track.addEventListener("touchstart", (e) => { sx = e.touches[0].clientX; }, { passive: true });
  track.addEventListener("touchend",   (e) => {
    const diff = sx - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) go(diff > 0 ? cur + 1 : cur - 1);
  });
}

function closeModal() {
  const modal = document.getElementById("imageModal");
  modal.style.display = "none";
  document.body.style.overflow = "";
}

window.openArtworkModal = openArtworkModal;
