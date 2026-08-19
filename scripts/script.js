// ===========================================================
// TOMEI — concept redesign interactions
// ===========================================================

document.addEventListener('DOMContentLoaded', () => {
  initHeader();
  initTicker();
  initReveal();
  initRails();
  initSearch();
  initMobileNav();
  initBackToTop();
  initLivePrices();
  initHero();
  initSpotlight();
});

/* ---------- Sticky header shadow ---------- */
function initHeader() {
  const header = document.getElementById('siteHeader');
  if (!header) return;
  const onScroll = () => {
    header.classList.toggle('scrolled', window.scrollY > 12);
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
}

/* ---------- Gold ticker marquee ---------- */
function initTicker() {
  const track = document.getElementById('tickerTrack');
  if (!track) return;

  const items = [
    { label: 'GOLD 999', value: 680.00 },
    { label: 'GOLD 916', value: 630.00 },
    { label: 'GOLD 750', value: 555.00 },
    { label: 'SILVER 999', value: 9.97 },
    { label: '9999 WAFER', value: 673.00 },
    { label: 'GOLD SPOT (1000g)', value: 578935.31 },
  ];

  const renderItems = () => items.map(i =>
    `<span>${i.label} <strong>RM ${i.value.toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></span>`
  ).join('<span aria-hidden="true">·</span>');

  // Duplicate content so the loop is seamless
  track.innerHTML = renderItems() + renderItems();
}

/* ---------- Scroll-reveal via IntersectionObserver ---------- */
function initReveal() {
  const targets = document.querySelectorAll('.reveal');
  if (!targets.length) return;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) {
    targets.forEach(t => t.classList.add('is-visible'));
    return;
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('is-visible'), (i % 5) * 70);
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

  targets.forEach(t => io.observe(t));
}

/* ---------- Horizontal drag / button scroll for rails ---------- */
function initRails() {
  document.querySelectorAll('[data-rail]').forEach(rail => {
    const track = rail.querySelector('[data-rail-track]');
    const prev = rail.querySelector('[data-rail-prev]');
    const next = rail.querySelector('[data-rail-next]');
    if (!track) return;

    const scrollAmount = () => track.clientWidth * 0.8;
    prev && prev.addEventListener('click', () => track.scrollBy({ left: -scrollAmount(), behavior: 'smooth' }));
    next && next.addEventListener('click', () => track.scrollBy({ left: scrollAmount(), behavior: 'smooth' }));

    // Pointer drag-to-scroll
    let isDown = false, startX = 0, startScroll = 0;
    track.addEventListener('pointerdown', (e) => {
      isDown = true;
      startX = e.clientX;
      startScroll = track.scrollLeft;
      track.setPointerCapture(e.pointerId);
    });
    track.addEventListener('pointermove', (e) => {
      if (!isDown) return;
      track.scrollLeft = startScroll - (e.clientX - startX);
    });
    ['pointerup', 'pointerleave', 'pointercancel'].forEach(evt =>
      track.addEventListener(evt, () => { isDown = false; })
    );
  });
}

/* ---------- Search panel toggle ---------- */
function initSearch() {
  const toggle = document.getElementById('searchToggle');
  const panel = document.getElementById('searchPanel');
  if (!toggle || !panel) return;

  toggle.addEventListener('click', () => {
    const open = panel.classList.toggle('open');
    if (open) {
      const input = panel.querySelector('input');
      setTimeout(() => input && input.focus(), 300);
    }
  });
}

/* ---------- Mobile nav toggle ---------- */
function initMobileNav() {
  const toggle = document.getElementById('navToggle');
  const nav = document.getElementById('mainNav');
  if (!toggle || !nav) return;

  toggle.addEventListener('click', () => nav.classList.toggle('open'));
  nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => nav.classList.remove('open')));
}

/* ---------- Back to top button ---------- */
function initBackToTop() {
  const btn = document.getElementById('toTop');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 600);
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ---------- Live price simulation ----------
   Purely cosmetic: nudges the displayed reference and
   jewellery prices by a tiny random amount every few
   seconds, flashing green/red, and refreshes the
   "last updated" timestamp — echoes the real TOMEI site's
   auto-refreshing price board without hitting a live feed. */
function initLivePrices() {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return;

  const heroValue = document.getElementById('heroPriceValue');
  const refBody = document.getElementById('refPriceBody');
  const jewBody = document.getElementById('jewPriceBody');
  const refUpdated = document.getElementById('refUpdated');
  const jewUpdated = document.getElementById('jewUpdated');

  const fmt = (n) => n.toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  function nudge(base) {
    const drift = base * (Math.random() * 0.004 - 0.002); // ±0.2%
    return Math.max(0, base + drift);
  }

  function flashCell(cell, oldVal, newVal) {
    cell.textContent = fmt(newVal);
    cell.classList.remove('flash-up', 'flash-down');
    void cell.offsetWidth; // restart animation
    cell.classList.add(newVal >= oldVal ? 'flash-up' : 'flash-down');
    setTimeout(() => cell.classList.remove('flash-up', 'flash-down'), 1200);
  }

  function tick() {
    // Reference price table
    if (refBody) {
      refBody.querySelectorAll('tr').forEach(row => {
        const baseBuy = parseFloat(row.dataset.baseBuy);
        const baseSell = parseFloat(row.dataset.baseSell);
        const buyCell = row.querySelector('[data-cell="buy"]');
        const sellCell = row.querySelector('[data-cell="sell"]');
        if (buyCell) {
          const oldVal = parseFloat(buyCell.textContent.replace(/,/g, ''));
          flashCell(buyCell, oldVal, nudge(baseBuy));
        }
        if (sellCell) {
          const oldVal = parseFloat(sellCell.textContent.replace(/,/g, ''));
          flashCell(sellCell, oldVal, nudge(baseSell));
        }
      });
    }

    // Jewellery price table
    if (jewBody) {
      jewBody.querySelectorAll('tr').forEach(row => {
        const baseSell = parseFloat(row.dataset.baseSell);
        const sellCell = row.querySelector('[data-cell="sell"]');
        if (sellCell) {
          const oldVal = parseFloat(sellCell.textContent.replace(/,/g, ''));
          const val = nudge(baseSell);
          flashCell(sellCell, oldVal, val);
          if (row.querySelector('td')?.textContent.trim() === '999' && heroValue) {
            heroValue.textContent = `RM ${fmt(val)}`;
          }
        }
      });
    }

    const now = new Date();
    const stamp = now.toLocaleString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    }).replace(',', '');
    if (refUpdated) refUpdated.textContent = stamp;
    if (jewUpdated) jewUpdated.textContent = stamp;
  }

  setInterval(tick, 6000);
}

function initSpotlight() {
  const root = document.getElementById('arrivalsSpotlight');
  if (!root) return;

  const slides = Array.from(root.querySelectorAll('.spotlight__slide'));
  const dotsWrap = document.getElementById('spotlightDots');
  const prevBtn = root.querySelector('[data-spotlight-prev]');
  const nextBtn = root.querySelector('[data-spotlight-next]');
  if (slides.length < 2) return;

  let current = slides.findIndex((s) => s.classList.contains('is-active'));
  if (current < 0) current = 0;

  const dots = slides.map((_, i) => {
    const dot = document.createElement('span');
    dot.className = 'spotlight__dot';
    dot.addEventListener('click', () => goTo(i));
    dotsWrap.appendChild(dot);
    return dot;
  });

  function render() {
    slides.forEach((s, i) => s.classList.toggle('is-active', i === current));
    dots.forEach((d, i) => d.classList.toggle('is-active', i === current));
  }

  function goTo(index) {
    current = (index + slides.length) % slides.length;
    render();
  }

  prevBtn && prevBtn.addEventListener('click', () => goTo(current - 1));
  nextBtn && nextBtn.addEventListener('click', () => goTo(current + 1));

  render();
}

function initHero() {
  const slides = document.querySelectorAll('.hero__slide');
  if (slides.length < 2) return;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return;

  let current = 0;
  const intervalMs = 5000;

  setInterval(() => {
    slides[current].classList.remove('is-active');
    current = (current + 1) % slides.length;
    slides[current].classList.add('is-active');
  }, intervalMs);
}