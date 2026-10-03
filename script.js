// ---------- Data ----------
// Using picsum.photos seeded placeholders so every "frame" stays consistent on reload.
const photos = [
  { id: 1,  category: 'mountains', title: 'Ridge Line at Dawn',      seed: 'ridge-dawn',      w: 800, h: 1000 },
  { id: 2,  category: 'mountains', title: 'Switchback Trail',        seed: 'switchback',      w: 800, h: 600  },
  { id: 3,  category: 'mountains', title: 'Snowfield, 3400m',        seed: 'snowfield-alt',   w: 800, h: 1050 },
  { id: 4,  category: 'ocean',     title: 'Low Tide, West Coast',    seed: 'low-tide-coast',  w: 800, h: 600  },
  { id: 5,  category: 'ocean',     title: 'Cliffside Break',         seed: 'cliffside-break', w: 800, h: 1000 },
  { id: 6,  category: 'ocean',     title: 'Harbor Fog',              seed: 'harbor-fog-2',    w: 800, h: 650  },
  { id: 7,  category: 'forest',    title: 'Understory Light',        seed: 'understory-lt',   w: 800, h: 1050 },
  { id: 8,  category: 'forest',    title: 'Fern Gully',              seed: 'fern-gully-2',    w: 800, h: 600  },
  { id: 9,  category: 'forest',    title: 'Old Growth',              seed: 'old-growth-2',    w: 800, h: 1000 },
  { id: 10, category: 'desert',    title: 'Dune Crest at Noon',      seed: 'dune-crest-2',    w: 800, h: 600  },
  { id: 11, category: 'desert',    title: 'Canyon Wall',             seed: 'canyon-wall-2',   w: 800, h: 1050 },
  { id: 12, category: 'desert',    title: 'Salt Flat Horizon',       seed: 'salt-flat-2',     w: 800, h: 620  },
];

const imgUrl = (p, size = 800) =>
  `https://picsum.photos/seed/${p.seed}/${size}/${Math.round(size * (p.h / p.w))}`;

// ---------- Render grid ----------
const galleryEl = document.getElementById('gallery');

function renderGallery() {
  galleryEl.innerHTML = '';
  photos.forEach((p, i) => {
    const frame = document.createElement('figure');
    frame.className = 'frame';
    frame.dataset.category = p.category;
    frame.dataset.index = i;
    frame.tabIndex = 0;
    frame.setAttribute('role', 'button');
    frame.setAttribute('aria-label', `Open ${p.title}`);

    const img = document.createElement('img');
    img.src = imgUrl(p, 640);
    img.alt = p.title;
    img.loading = 'lazy';

    const tag = document.createElement('figcaption');
    tag.className = 'frame-tag';
    tag.textContent = `${p.title} · ${capitalize(p.category)}`;

    frame.appendChild(img);
    frame.appendChild(tag);
    galleryEl.appendChild(frame);

    // masonry-style span based on real aspect ratio
    const ratio = p.h / p.w;
    frame.style.gridRowEnd = `span ${Math.round(ratio * 33)}`;

    frame.addEventListener('click', () => openLightbox(i));
    frame.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLightbox(i); }
    });
  });
}

function capitalize(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

// ---------- Filtering ----------
const chips = document.querySelectorAll('.filter-chip');
chips.forEach((chip) => {
  chip.addEventListener('click', () => {
    chips.forEach((c) => c.classList.remove('is-active'));
    chip.classList.add('is-active');
    const filter = chip.dataset.filter;
    document.querySelectorAll('.frame').forEach((frame) => {
      const match = filter === 'all' || frame.dataset.category === filter;
      frame.classList.toggle('is-hidden', !match);
    });
  });
});

// ---------- Lightbox ----------
const lightbox = document.getElementById('lightbox');
const lbImage = document.getElementById('lbImage');
const lbTitle = document.getElementById('lbTitle');
const lbCategory = document.getElementById('lbCategory');
const lbIndex = document.getElementById('lbIndex');
const lbClose = document.getElementById('lbClose');
const lbPrev = document.getElementById('lbPrev');
const lbNext = document.getElementById('lbNext');

let currentIndex = 0;

function visiblePhotoIndices() {
  const activeFilter = document.querySelector('.filter-chip.is-active').dataset.filter;
  return photos
    .map((p, i) => ({ p, i }))
    .filter(({ p }) => activeFilter === 'all' || p.category === activeFilter)
    .map(({ i }) => i);
}

function openLightbox(index) {
  currentIndex = index;
  updateLightbox();
  lightbox.hidden = false;
  document.body.style.overflow = 'hidden';
  lbClose.focus();
}

function closeLightbox() {
  lightbox.hidden = true;
  document.body.style.overflow = '';
}

function updateLightbox() {
  const p = photos[currentIndex];
  lbImage.src = imgUrl(p, 1400);
  lbImage.alt = p.title;
  lbTitle.textContent = p.title;
  lbCategory.textContent = capitalize(p.category);
  const order = visiblePhotoIndices();
  const pos = order.indexOf(currentIndex) + 1;
  lbIndex.textContent = `${String(pos).padStart(2, '0')} / ${String(order.length).padStart(2, '0')}`;
}

function step(delta) {
  const order = visiblePhotoIndices();
  const pos = order.indexOf(currentIndex);
  const nextPos = (pos + delta + order.length) % order.length;
  currentIndex = order[nextPos];
  updateLightbox();
}

lbClose.addEventListener('click', closeLightbox);
lbPrev.addEventListener('click', () => step(-1));
lbNext.addEventListener('click', () => step(1));

lightbox.addEventListener('click', (e) => {
  if (e.target === lightbox) closeLightbox();
});

document.addEventListener('keydown', (e) => {
  if (lightbox.hidden) return;
  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowLeft') step(-1);
  if (e.key === 'ArrowRight') step(1);
});

// ---------- Init ----------
renderGallery();
