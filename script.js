const menuToggle = document.querySelector('.menu-toggle');
const primaryNav = document.querySelector('.primary-nav');

if (menuToggle && primaryNav) {
  const closeMenu = () => {
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Open navigation');
    primaryNav.classList.remove('is-open');
    document.body.classList.remove('menu-open');
  };

  menuToggle.addEventListener('click', () => {
    const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
    menuToggle.setAttribute('aria-expanded', String(!isOpen));
    menuToggle.setAttribute('aria-label', isOpen ? 'Open navigation' : 'Close navigation');
    primaryNav.classList.toggle('is-open', !isOpen);
    document.body.classList.toggle('menu-open', !isOpen);
  });

  primaryNav.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeMenu();
  });
}

const year = document.querySelector('#year');
if (year) year.textContent = new Date().getFullYear();

const productGrid = document.querySelector('#product-grid');
const catalogEmpty = document.querySelector('#catalog-empty');
const catalogToolbar = document.querySelector('#catalog-toolbar');
const catalogNote = document.querySelector('#catalog-note');
const searchInput = document.querySelector('#catalog-search');
const productDataNode = document.querySelector('#product-data');
const storeWhatsApp = '916203114500';

if (productGrid && catalogEmpty && productDataNode) {
  let products = [];
  try {
    const parsedProducts = JSON.parse(productDataNode.textContent);
    if (Array.isArray(parsedProducts)) products = parsedProducts;
  } catch (error) {
    console.error('The product catalog JSON could not be read.', error);
  }

  let activeFilter = 'all';
  const escapeHtml = (value = '') => String(value).replace(/[&<>"']/g, (char) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[char]);
  const niceLabel = (value = '') => String(value).replace(/-/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
  const formatPrice = (price) => new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', maximumFractionDigits: 0
  }).format(Number(price));

  const getOrderLink = (product) => {
    const number = storeWhatsApp.replace(/\D/g, '');
    const price = Number.isFinite(Number(product.price)) ? ` Listed price: ${formatPrice(product.price)}.` : '';
    const message = `Hi Iphns4 You, I’m interested in ${product.name}${product.storage ? ` (${product.storage})` : ''}.${price} Is it available?`;
    return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
  };

  const makeProductCard = (product) => {
    const hasPrice = product.price !== '' && product.price !== null && product.price !== undefined && Number.isFinite(Number(product.price));
    const label = product.tag || niceLabel(product.condition || product.category || 'Available');
    const specs = [product.model, product.storage, niceLabel(product.condition)].filter(Boolean).join(' · ');
    const image = product.image
      ? `<img class="product-card__photo" src="${escapeHtml(product.image)}" alt="${escapeHtml(product.imageAlt || product.name)}" loading="lazy" />`
      : '<span class="product-placeholder" aria-hidden="true"><i></i></span>';
    const action = 'Order on WhatsApp';
    return `<article class="product-card">
      <div class="product-card__image">${image}<span class="product-card__tag">${escapeHtml(label)}</span></div>
      <div class="product-card__details">
        <div class="product-card__meta">${escapeHtml(niceLabel(product.condition || product.category || 'In store'))}</div>
        <h3>${escapeHtml(product.name)}</h3>
        <p class="product-card__specs">${escapeHtml(specs || 'Message us for details')}</p>
        <div class="product-card__bottom">
          <div class="product-card__price"><small>${hasPrice ? 'STORE PRICE' : 'PRICE'}</small><strong>${hasPrice ? formatPrice(product.price) : 'Ask us'}</strong></div>
          <a class="product-card__order" href="${getOrderLink(product)}" target="_blank" rel="noreferrer" aria-label="${action} about ${escapeHtml(product.name)}">${action} <span aria-hidden="true">↗</span></a>
        </div>
      </div>
    </article>`;
  };

  const renderCatalog = () => {
    const query = searchInput?.value.trim().toLowerCase() || '';
    const visibleProducts = products.filter((product) => {
      const category = String(product.category || product.condition || '').toLowerCase();
      const matchesFilter = activeFilter === 'all' || category === activeFilter;
      const searchable = [product.name, product.model, product.storage, product.condition, product.category, product.tag]
        .filter(Boolean).join(' ').toLowerCase();
      return matchesFilter && searchable.includes(query);
    });

    catalogToolbar.hidden = products.length === 0;
    catalogEmpty.hidden = products.length !== 0;
    catalogNote.hidden = products.length === 0;
    if (products.length === 0) {
      productGrid.innerHTML = '';
      return;
    }

    if (visibleProducts.length === 0) {
      productGrid.innerHTML = '<div class="catalog-no-results"><strong>No matching items yet.</strong><span>WhatsApp the store and we’ll help you find it.</span></div>';
      return;
    }
    productGrid.innerHTML = visibleProducts.map(makeProductCard).join('');
  };

  catalogToolbar?.querySelectorAll('[data-filter]').forEach((button) => {
    button.addEventListener('click', () => {
      activeFilter = button.dataset.filter || 'all';
      catalogToolbar.querySelectorAll('[data-filter]').forEach((filterButton) => {
        const selected = filterButton === button;
        filterButton.classList.toggle('is-active', selected);
        filterButton.setAttribute('aria-pressed', String(selected));
      });
      renderCatalog();
    });
  });
  searchInput?.addEventListener('input', renderCatalog);
  renderCatalog();
}
