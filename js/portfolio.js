/* =========================================================
   PORTFOLIO.JS — shared data loader + component builders
   ========================================================= */

// Global data cache
let DATA = null;

async function loadData() {
  if (DATA) return DATA;
  const depth = document.body.dataset.depth || '0';
  const prefix = depth === '1' ? '../' : '/';
  const res = await fetch(prefix + 'data/portfolio.json');
  DATA = await res.json();
  return DATA;
}

/* ----- Nav / Footer injection ----------------------------- */
function buildNav(data, activePage) {
  const depth = document.body.dataset.depth || '0';
  const prefix = depth === '1' ? '../' : '';

  const links = data.nav.map(n => {
    const href = prefix + n.href.replace(/^\//, '');
    const active = n.href.replace(/^\//, '') === activePage ? ' class="active"' : '';
    return `<a href="${href}"${active}>${n.label}</a>`;
  }).join('');

  return `
    <div class="banner-left">
      <div class="site-title"><h1>${data.meta.name}</h1></div>
      <nav class="nav" role="navigation" aria-label="Main navigation">${links}</nav>
      <button class="nav-toggle" aria-label="Toggle navigation">
        <span></span><span></span><span></span>
      </button>
    </div>`;
}

function buildFooter(data) {
  return `
    <div class="container footer-inner">
      <div class="footer-left">
        <strong>${data.meta.name}</strong>
        <div style="margin-top:6px"><a href="mailto:${data.meta.email}">${data.meta.email}</a></div>
      </div>
      <div class="footer-right">
        <a class="footer-btn" href="${data.meta.linkedin}" target="_blank" rel="noopener noreferrer">LinkedIn</a>
      </div>
      <p>© <span id="yr"></span> ${data.meta.name} | Product Management &amp; AI Innovation</p>
    </div>`;
}

function initNavToggle() {
  const toggle = document.querySelector('.nav-toggle');
  const nav    = document.querySelector('.nav');
  if (!toggle || !nav) return;
  toggle.addEventListener('click', () => {
    nav.classList.toggle('open');
    toggle.classList.toggle('open');
  });
}

function setYear() {
  const el = document.getElementById('yr');
  if (el) el.textContent = new Date().getFullYear();
}

/* ----- Badge helper --------------------------------------- */
function badge(status) {
  if (status === 'live')
    return `<span class="badge badge-live">Live</span>`;
  return `<span class="badge badge-prototype">Prototype</span>`;
}

/* ----- Tag list helper ------------------------------------ */
function tagList(tags) {
  return `<div class="tag-list">${tags.map(t => `<span class="tag">${t}</span>`).join('')}</div>`;
}

/* ----- AI Products cards ---------------------------------- */
function buildProductCards(products, depth) {
  const prefix = depth === '1' ? '../' : '';
  return products.map((p, i) => {
    if (p.featured) return buildFeaturedCard(p, prefix, i);
    return buildStandardCard(p, prefix, i);
  }).join('');
}

function buildFeaturedCard(p, prefix, i) {
  const liveBtn  = p.liveUrl  ? `<a href="${p.liveUrl}" class="btn" target="_blank" rel="noopener noreferrer" onclick="event.stopPropagation()">&#x1F680; View Live App</a>` : '';
  const ghBtn    = p.githubRepo ? `<a href="https://github.com/${p.githubRepo}" class="btn btn-outline" target="_blank" rel="noopener noreferrer" onclick="event.stopPropagation()">GitHub Repo</a>` : '';
  const caseBtn  = p.caseStudyUrl ? `<a href="${prefix + p.caseStudyUrl.replace(/^\//, '')}" class="btn btn-outline" onclick="event.stopPropagation()">Full Case Study</a>` : '';
  const capItems = p.capabilities.map(c => `<li>${c}</li>`).join('');

  return `
    <div class="card featured card-clickable" tabindex="0" role="button" aria-haspopup="dialog"
      aria-label="View case study: ${p.title}"
      onclick="Portfolio.openProductModal(${i})"
      onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();Portfolio.openProductModal(${i});}">
      <div class="card-img-col">
        <img src="${prefix + p.image.replace(/^\//, '')}" alt="${p.imageAlt}" loading="lazy">
      </div>
      <div class="card-body-col">
        <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;">
          ${badge(p.status)}
          <h3 style="margin:0;">${p.title}</h3>
        </div>
        <p style="font-style:italic;font-size:0.9rem;margin:0;">${p.subtitle}</p>
        <p>${p.summary}</p>
        ${tagList(p.tags)}
        <div>
          <strong style="font-size:0.88rem;color:var(--nav-bg);text-transform:uppercase;letter-spacing:0.5px;">AI Capabilities Demonstrated</strong>
          <ul style="margin-top:6px;">${capItems}</ul>
        </div>
        <span class="exp-view-link" style="display:block;margin-top:4px;">Explore This Product &#8250;</span>
        <div class="card-links">${liveBtn}${caseBtn}${ghBtn}</div>
      </div>
    </div>`;
}

function buildStandardCard(p, prefix, i) {
  const caseBtn = p.caseStudyUrl ? `<a href="${prefix + p.caseStudyUrl.replace(/^\//, '')}" class="btn" onclick="event.stopPropagation()">View Case Study</a>` : '';
  const bullets = p.capabilities.slice(0, 4).map(c => `<li>${c}</li>`).join('');

  return `
    <div class="card card-clickable" tabindex="0" role="button" aria-haspopup="dialog"
      aria-label="View case study: ${p.title}"
      onclick="Portfolio.openProductModal(${i})"
      onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();Portfolio.openProductModal(${i});}">
      <img src="${prefix + p.image.replace(/^\//, '')}" alt="${p.imageAlt}" loading="lazy">
      <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:8px;">
        ${badge(p.status)}
        <h3 style="margin:0;">${p.title}</h3>
      </div>
      <p>${p.summary}</p>
      ${tagList(p.tags)}
      <ul style="margin-top:10px;">${bullets}</ul>
      <span class="exp-view-link" style="display:block;margin-top:10px;">Explore This Product &#8250;</span>
      <div style="margin-top:12px;">${caseBtn}</div>
    </div>`;
}

/* ----- Enterprise project cards -------------------------- */
function buildProjectCards(projects) {
  return projects.map(p => {
    const bullets = p.bullets.map(b => `<li>${b}</li>`).join('');
    return `
      <div class="card project-card">
        <h3>${p.title}</h3>
        <p><strong>Objective:</strong> ${p.objective}</p>
        <p><strong>Role:</strong> ${p.role}</p>
        <ul>${bullets}</ul>
        <div class="sqdc-row">
          <span>Safety:</span> ${p.sqdc.safety}<br>
          <span>Quality:</span> ${p.sqdc.quality}<br>
          <span>Delivery:</span> ${p.sqdc.delivery}<br>
          <span>Cost:</span> ${p.sqdc.cost}
        </div>
      </div>`;
  }).join('');
}

/* ----- Approach cards ------------------------------------- */
function buildApproachCards(items) {
  return items.map(i => `
    <div class="approach-card">
      <h3>${i.title}</h3>
      <p>${i.body}</p>
    </div>`).join('');
}

/* ----- Technology cards ----------------------------------- */
function buildTechCards(items) {
  return items.map(i => {
    const lis = i.items.map(x => `<li>${x}</li>`).join('');
    return `<div class="card"><h3>${i.title}</h3><ul>${lis}</ul></div>`;
  }).join('');
}

/* ----- About cards ---------------------------------------- */
/* ----- Home: hero visual (abstract, no photo) --------------
   A layered operating-model diagram: the disciplines required
   to operationalize AI (strategy, governance, delivery,
   adoption) converging into a single measurable capability.
   This is the signature homepage visual. */
function buildHeroVisual() {
  const ICONS = {
    target:   '<circle cx="9" cy="9" r="7" fill="none" stroke="#fff" stroke-width="1.4"/><circle cx="9" cy="9" r="4" fill="none" stroke="#fff" stroke-width="1.4"/><circle cx="9" cy="9" r="1.3" fill="#fff"/>',
    shield:   '<path d="M9 1.5l6.5 2.2V8c0 4.4-2.7 7-6.5 8.3C5.2 15 2.5 12.4 2.5 8V3.7L9 1.5z" fill="none" stroke="#fff" stroke-width="1.4"/>',
    delivery: '<rect x="2.5" y="5.5" width="13" height="9.5" rx="1.2" fill="none" stroke="#fff" stroke-width="1.4"/><path d="M2.5 8.5h13" stroke="#fff" stroke-width="1.4"/><path d="M6.5 5.5V4a2.5 2.5 0 015 0v1.5" fill="none" stroke="#fff" stroke-width="1.4"/>',
    people:   '<circle cx="6.3" cy="6.3" r="2.4" fill="none" stroke="#fff" stroke-width="1.4"/><circle cx="12.2" cy="6.3" r="2.4" fill="none" stroke="#fff" stroke-width="1.4"/><path d="M2 16c.4-2.8 2.2-4.4 4.3-4.4S10.2 13.2 10.6 16" fill="none" stroke="#fff" stroke-width="1.4"/><path d="M8 16c.4-2.5 2-4 4.2-4s3.7 1.5 4.1 4" fill="none" stroke="#fff" stroke-width="1.4"/>',
    value:    '<path d="M2.5 15.5V6.5M8.3 15.5V3.5M14.1 15.5V9.5" stroke="#fff" stroke-width="1.6" stroke-linecap="round"/>'
  };

  const layers = [
    { label: 'STRATEGY & PORTFOLIO',   w: 400, fill: '#0b1e3d', icon: 'target' },
    { label: 'GOVERNANCE',             w: 355, fill: '#12315c', icon: 'shield' },
    { label: 'DELIVERY & PRODUCT',     w: 310, fill: '#163b6b', icon: 'delivery' },
    { label: 'ADOPTION & CHANGE',      w: 280, fill: '#0088cc', icon: 'people' },
    { label: 'VALUE REALIZATION',      w: 245, fill: '#00aaff', icon: 'value' }
  ];
  const startY = 14;
  const bandH = 56;
  const gap = 22;
  const cx = 250;

  const bands = layers.map((l, i) => {
    const y = startY + i * (bandH + gap);
    const x = cx - l.w / 2;
    const iconX = x + 26;
    const iconY = y + bandH / 2 - 10;
    const connector = i < layers.length - 1
      ? `<path d="M${cx - 7} ${y + bandH + 6} L${cx} ${y + bandH + gap - 6} L${cx + 7} ${y + bandH + 6}"
           fill="none" stroke="#b9c4d4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />`
      : '';
    return `
      <rect x="${x}" y="${y}" width="${l.w}" height="${bandH}" rx="7" fill="${l.fill}" />
      <g transform="translate(${iconX},${iconY}) scale(1.1)">${ICONS[l.icon]}</g>
      <text x="${cx + 17}" y="${y + bandH / 2 + 5}" text-anchor="middle" font-family="Segoe UI, sans-serif"
        font-size="15" font-weight="700" letter-spacing="0.3" fill="#ffffff">${l.label}</text>
      ${connector}`;
  }).join('');

  const lastY = startY + layers.length * (bandH + gap) - gap;
  const nodeY = lastY + 58;

  return `
    <div class="hero-visual" aria-hidden="true">
      <svg viewBox="0 0 500 ${nodeY + 95}" xmlns="http://www.w3.org/2000/svg">
        ${bands}
        <line x1="${cx}" y1="${lastY + 4}" x2="${cx}" y2="${nodeY - 34}" stroke="#d4af37" stroke-width="2" stroke-dasharray="4 5" />
        <circle cx="${cx}" cy="${nodeY}" r="34" fill="#0b1e3d" stroke="#d4af37" stroke-width="2.5" />
        <g transform="translate(${cx - 11},${nodeY - 12})">
          <rect x="0" y="6" width="8" height="18" fill="#ffffff" opacity="0.92"/>
          <rect x="9" y="0" width="8" height="24" fill="#ffffff"/>
          <rect x="2" y="9" width="1.6" height="1.6" fill="#0b1e3d"/>
          <rect x="2" y="13" width="1.6" height="1.6" fill="#0b1e3d"/>
          <rect x="5" y="9" width="1.6" height="1.6" fill="#0b1e3d"/>
          <rect x="5" y="13" width="1.6" height="1.6" fill="#0b1e3d"/>
          <rect x="11.5" y="4" width="1.6" height="1.6" fill="#0b1e3d"/>
          <rect x="11.5" y="8" width="1.6" height="1.6" fill="#0b1e3d"/>
          <rect x="11.5" y="12" width="1.6" height="1.6" fill="#0b1e3d"/>
          <rect x="15" y="4" width="1.6" height="1.6" fill="#0b1e3d"/>
          <rect x="15" y="8" width="1.6" height="1.6" fill="#0b1e3d"/>
          <rect x="15" y="12" width="1.6" height="1.6" fill="#0b1e3d"/>
        </g>
        <text x="${cx}" y="${nodeY + 58}" text-anchor="middle" font-family="Segoe UI, sans-serif"
          font-size="16" font-weight="700" letter-spacing="0.5" fill="#0b1e3d">ENTERPRISE AI CAPABILITY</text>
      </svg>
    </div>`;
}

/* ----- Home: stat cards (Enterprise Experience) ------------ */
function buildStatCards(stats) {
  return stats.map(s => `
    <div class="stat-card">
      <div class="stat-value">${s.value}</div>
      <div class="stat-label">${s.label}</div>
      <p>${s.body}</p>
    </div>`).join('');
}

/* ----- Home: point of view pillars -------------------------- */
function buildPovPillars(pillars) {
  return `<ul class="pov-pillars">${pillars.map(p => `<li>${p}</li>`).join('')}</ul>`;
}

/* ----- Home: blueprint six-step journey --------------------- */
function buildBlueprintSteps(steps) {
  return `<div class="blueprint-steps">${steps.map(s => `
    <div class="blueprint-step">
      <div class="step-n">${s.n}</div>
      <h4>${s.title}</h4>
      <p>${s.body}</p>
    </div>`).join('')}</div>`;
}

/* ----- Home: applied work (case-study preview) cards -------- */
function buildAppliedCards(cards) {
  return cards.map(c => {
    const highlights = c.highlights && c.highlights.length
      ? `<ul>${c.highlights.map(h => `<li>${h}</li>`).join('')}</ul>` : '';
    return `
      <div class="applied-card">
        <div class="subtitle">${c.subtitle}</div>
        <h3>${c.title}</h3>
        <p>${c.body}</p>
        ${highlights}
        <div class="card-links"><a href="${c.url}" class="btn btn-outline">${c.cta}</a></div>
      </div>`;
  }).join('');
}

/* ----- Home: core capabilities grid ------------------------- */
const CAP_ICONS = {
  'Enterprise AI Strategy':
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 12l4-8 5 5 5-9 4 12"/><circle cx="3" cy="12" r="1.4" fill="currentColor" stroke="none"/><circle cx="21" cy="12" r="1.4" fill="currentColor" stroke="none"/></svg>',
  'Enterprise AI Operationalization':
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="9"/><path d="M12 3v4M12 17v4M3 12h4M17 12h4"/></svg>',
  'AI Governance':
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 3l8 3v6c0 5-3.5 7.8-8 9-4.5-1.2-8-4-8-9V6l8-3z"/><path d="M9 12l2 2 4-4"/></svg>',
  'Product & Portfolio Leadership':
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="10" width="4" height="10"/><rect x="10" y="5" width="4" height="15"/><rect x="17" y="13" width="4" height="7"/></svg>',
  'Operating Model Design':
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="4" y="4" width="7" height="7" rx="1"/><rect x="13" y="4" width="7" height="7" rx="1"/><rect x="4" y="13" width="7" height="7" rx="1"/><rect x="13" y="13" width="7" height="7" rx="1"/></svg>',
  'Adoption & Value Realization':
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 18l5-6 4 3 7-9"/><path d="M14 6h6v6"/></svg>'
};

function buildCapabilityCards(items) {
  return items.map(i => `
    <div class="capability-card">
      <div class="cap-icon">${CAP_ICONS[i.title] || ''}</div>
      <h4>${i.title}</h4>
      <p>${i.body}</p>
    </div>`).join('');
}

/* ----- Blueprint page: struggle pattern cards --------------- */
function buildPatternCards(patterns) {
  return patterns.map(p => `
    <div class="pattern-card">
      <h4>${p.title}</h4>
      <p>${p.body}</p>
    </div>`).join('');
}

/* ----- Blueprint page: detailed step cards -------------------
   Executive Question / Purpose / Outcome only. Deliberately
   excludes any implementation detail, scoring, or methodology. */
function buildDetailedSteps(steps) {
  return steps.map(s => `
    <div class="bp-step-card" id="step-${s.n}">
      <div class="bp-step-top">
        <span class="bp-step-n">${s.n}</span>
        <h3>${s.title}</h3>
      </div>
      <p class="bp-step-question">&ldquo;${s.question}&rdquo;</p>
      <div class="bp-step-meta">
        <div><span class="bp-meta-label">Purpose</span><p>${s.purpose}</p></div>
        <div><span class="bp-meta-label">Outcome</span><p>${s.outcome}</p></div>
      </div>
    </div>`).join('');
}

/* ----- Blueprint page: closing CTA links --------------------- */
function buildClosingLinks(links) {
  return links.map(l => {
    const cls = l.style === 'primary' ? 'btn' : 'btn btn-outline';
    return `<a href="${l.url}" class="${cls}">${l.label}</a>`;
  }).join('');
}

/* ----- Experience page: theme chips -------------------------- */
function buildThemeChips(items) {
  return items.map(t => `<span class="theme-chip">${t}</span>`).join('');
}

/* ----- Experience page: concise project cards. Clicking
   anywhere on a card opens the executive case-study modal
   for that project. */
function buildExperienceCards(projects) {
  return projects.map((p, i) => {
    const outcomes = p.outcomes.slice(0, 3).map(o => `<li>${o}</li>`).join('');
    const capabilities = p.capabilities.map(c => `<span class="tag">${c}</span>`).join('');
    return `
      <div class="exp-card" tabindex="0" role="button" aria-haspopup="dialog"
        aria-label="View case study: ${p.title}"
        onclick="Portfolio.openExpModal(${i})"
        onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();Portfolio.openExpModal(${i});}">
        <div class="exp-card-top">
          <span class="exp-org">${p.organization}</span>
          <h3>${p.title}</h3>
        </div>
        <p class="exp-challenge">${p.challenge}</p>
        <ul class="exp-outcomes">${outcomes}</ul>
        <div class="tag-list" style="margin-bottom:14px;">${capabilities}</div>
        <span class="exp-view-link">View Case Study &#8250;</span>
      </div>`;
  }).join('');
}

/* ----- Executive case-study modal ----------------------------
   Reusable component: one modal shell in the page markup,
   content generated dynamically per project. Supports click
   trigger, ESC / overlay-click / X to close, and Prev/Next
   navigation between projects without leaving the page. */
let EXP_PROJECTS = [];
let EXP_INDEX = 0;

function initExpModal(projects) {
  EXP_PROJECTS = projects;
  const overlay = document.getElementById('exp-modal-overlay');
  if (!overlay) return;

  document.getElementById('exp-modal-close').addEventListener('click', closeExpModal);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) closeExpModal(); });
  document.getElementById('exp-modal-prev').addEventListener('click', expModalPrev);
  document.getElementById('exp-modal-next').addEventListener('click', expModalNext);

  document.addEventListener('keydown', (e) => {
    if (!overlay.classList.contains('open')) return;
    if (e.key === 'Escape') closeExpModal();
    if (e.key === 'ArrowLeft') expModalPrev();
    if (e.key === 'ArrowRight') expModalNext();
  });
}

function openExpModal(index) {
  EXP_INDEX = index;
  renderExpModal();
  const overlay = document.getElementById('exp-modal-overlay');
  document.body.classList.add('modal-open');
  overlay.classList.add('open');
  document.getElementById('exp-modal-close').focus();
}

function closeExpModal() {
  document.getElementById('exp-modal-overlay').classList.remove('open');
  document.body.classList.remove('modal-open');
}

function expModalPrev() { if (EXP_INDEX > 0) { EXP_INDEX--; renderExpModal(); } }
function expModalNext() { if (EXP_INDEX < EXP_PROJECTS.length - 1) { EXP_INDEX++; renderExpModal(); } }

function renderExpModal() {
  const p = EXP_PROJECTS[EXP_INDEX];
  const box = document.getElementById('exp-modal-box');
  const scrollEl = box.querySelector('.modal-scroll');
  if (scrollEl) scrollEl.scrollTop = 0;

  document.getElementById('exp-modal-org').textContent = p.organization;
  document.getElementById('exp-modal-title').textContent = p.title;
  document.getElementById('exp-modal-role').textContent = p.role;
  document.getElementById('exp-modal-summary').textContent = p.executiveSummary;
  document.getElementById('exp-modal-challenge').textContent = p.businessChallenge;
  document.getElementById('exp-modal-myrole').textContent = p.myRole;
  document.getElementById('exp-modal-contributions').innerHTML =
    p.keyContributions.map(c => `<li>${c}</li>`).join('');
  document.getElementById('exp-modal-outcomes').innerHTML =
    p.outcomes.map(o => `<div class="modal-outcome-pill"><span class="check">&#10003;</span>${o}</div>`).join('');
  document.getElementById('exp-modal-capabilities').innerHTML =
    p.capabilities.map(c => `<span class="tag">${c}</span>`).join('');
  document.getElementById('exp-modal-blueprint').textContent = p.blueprintConnection;

  const prevBtn = document.getElementById('exp-modal-prev');
  const nextBtn = document.getElementById('exp-modal-next');
  prevBtn.disabled = EXP_INDEX === 0;
  nextBtn.disabled = EXP_INDEX === EXP_PROJECTS.length - 1;
  document.getElementById('exp-modal-counter').textContent = `${EXP_INDEX + 1} of ${EXP_PROJECTS.length}`;
}

/* ----- Applied AI page: numbered principle cards -------------- */
function buildPrincipleCards(items) {
  return items.map((p, i) => `
    <div class="capability-card">
      <div class="bp-step-n" style="margin-bottom:10px;">${i + 1}</div>
      <h4>${p.title}</h4>
      <p>${p.body}</p>
    </div>`).join('');
}

/* ----- Product case-study modal --------------------------------
   Same reusable pattern as the Experience page modal: one shell,
   content generated per product, Prev/Next between products. */
let PROD_ITEMS = [];
let PROD_INDEX = 0;

function initProductModal(products) {
  PROD_ITEMS = products;
  const overlay = document.getElementById('prod-modal-overlay');
  if (!overlay) return;

  document.getElementById('prod-modal-close').addEventListener('click', closeProductModal);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) closeProductModal(); });
  document.getElementById('prod-modal-prev').addEventListener('click', productModalPrev);
  document.getElementById('prod-modal-next').addEventListener('click', productModalNext);

  document.addEventListener('keydown', (e) => {
    if (!overlay.classList.contains('open')) return;
    if (e.key === 'Escape') closeProductModal();
    if (e.key === 'ArrowLeft') productModalPrev();
    if (e.key === 'ArrowRight') productModalNext();
  });
}

function openProductModal(index) {
  PROD_INDEX = index;
  renderProductModal();
  const overlay = document.getElementById('prod-modal-overlay');
  document.body.classList.add('modal-open');
  overlay.classList.add('open');
  document.getElementById('prod-modal-close').focus();
}

function closeProductModal() {
  document.getElementById('prod-modal-overlay').classList.remove('open');
  document.body.classList.remove('modal-open');
}

function productModalPrev() { if (PROD_INDEX > 0) { PROD_INDEX--; renderProductModal(); } }
function productModalNext() { if (PROD_INDEX < PROD_ITEMS.length - 1) { PROD_INDEX++; renderProductModal(); } }

function renderProductModal() {
  const p = PROD_ITEMS[PROD_INDEX];
  const box = document.getElementById('prod-modal-box');
  const scrollEl = box.querySelector('.modal-scroll');
  if (scrollEl) scrollEl.scrollTop = 0;

  document.getElementById('prod-modal-badge').innerHTML = badge(p.status);
  document.getElementById('prod-modal-title').textContent = p.title;
  document.getElementById('prod-modal-subtitle').textContent = p.subtitle;
  document.getElementById('prod-modal-summary').textContent = p.summary;
  document.getElementById('prod-modal-problem').textContent = p.businessProblem;
  document.getElementById('prod-modal-vision').textContent = p.productVision;
  document.getElementById('prod-modal-capabilities').innerHTML =
    p.capabilities.map(c => `<li>${c}</li>`).join('');
  document.getElementById('prod-modal-architecture').textContent = p.technicalArchitecture;
  document.getElementById('prod-modal-tech').innerHTML = tagList(p.tags);
  document.getElementById('prod-modal-features').innerHTML =
    p.keyFeatures.map(f => `<li>${f}</li>`).join('');
  document.getElementById('prod-modal-value').innerHTML =
    p.businessValue.map(v => `<div class="modal-outcome-pill"><span class="check">&#10003;</span>${v}</div>`).join('');
  document.getElementById('prod-modal-blueprint').textContent = p.blueprintConnection;

  const prevBtn = document.getElementById('prod-modal-prev');
  const nextBtn = document.getElementById('prod-modal-next');
  prevBtn.disabled = PROD_INDEX === 0;
  nextBtn.disabled = PROD_INDEX === PROD_ITEMS.length - 1;
  document.getElementById('prod-modal-counter').textContent = `${PROD_INDEX + 1} of ${PROD_ITEMS.length}`;
}

window.Portfolio = {
  loadData, buildNav, buildFooter, buildProductCards,
  buildProjectCards, buildApproachCards, buildTechCards,
  initNavToggle, setYear, tagList, badge,
  buildHeroVisual, buildStatCards, buildPovPillars,
  buildBlueprintSteps, buildAppliedCards, buildCapabilityCards,
  buildPatternCards, buildDetailedSteps, buildClosingLinks,
  buildThemeChips, buildExperienceCards,
  initExpModal, openExpModal, closeExpModal, expModalPrev, expModalNext,
  buildPrincipleCards,
  initProductModal, openProductModal, closeProductModal, productModalPrev, productModalNext
};
