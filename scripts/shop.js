document.addEventListener('DOMContentLoaded', initShop);

function initShop() {
  const grid = document.getElementById('shopGrid');
  if (!grid) return;

  const cards = Array.from(grid.querySelectorAll('.card'));
  const chips = Array.from(document.querySelectorAll('.shop-chip'));
  const sortSelect = document.getElementById('shopSort');
  const countEl = document.getElementById('shopCount');
  const emptyEl = document.getElementById('shopEmpty');
  const titleEl = document.getElementById('shopTitle');

  let activeFilter = 'all';

  function applyFilter() {
    let visible = 0;
    cards.forEach((card) => {
      const match = activeFilter === 'all' || card.dataset.category === activeFilter;
      card.classList.toggle('is-hidden', !match);
      if (match) visible += 1;
    });
    if (countEl) countEl.textContent = `${visible} piece${visible === 1 ? '' : 's'}`;
    if (emptyEl) emptyEl.hidden = visible !== 0;
  }

  function applyTitle(label) {
    if (titleEl) titleEl.textContent = activeFilter === 'all' ? 'Shop All' : `Shop ${label}`;
  }

  function applySort() {
    const mode = sortSelect ? sortSelect.value : 'featured';
    const sorted = [...cards];

    if (mode === 'price-asc') {
      sorted.sort((a, b) => Number(a.dataset.price) - Number(b.dataset.price));
    } else if (mode === 'price-desc') {
      sorted.sort((a, b) => Number(b.dataset.price) - Number(a.dataset.price));
    } else if (mode === 'name-asc') {
      sorted.sort((a, b) => a.dataset.name.localeCompare(b.dataset.name));
    }

    sorted.forEach((card) => grid.appendChild(card));
  }

  chips.forEach((chip) => {
    chip.addEventListener('click', () => {
      chips.forEach((c) => c.classList.remove('is-active'));
      chip.classList.add('is-active');
      activeFilter = chip.dataset.filter;
      applyFilter();
      applyTitle(chip.textContent.trim());
    });
  });

  sortSelect && sortSelect.addEventListener('change', applySort);

  applyFilter();
}
