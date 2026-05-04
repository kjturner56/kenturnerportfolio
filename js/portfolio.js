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
      <button class="nav-toggle" aria-label="Toggle navigation">
        <span></span><span></span><span></span>
      </button>
    </div>
    <nav class="nav" role="navigation" aria-label="Main navigation">${links}</nav>
    <div class="banner-center" aria-hidden="true">
      <h2>${data.meta.title}</h2>
      <h3>${data.meta.subtitle}</h3>
    </div>`;
}

function buildFooter(data) {
  return `
    <div class="container footer-inner">
      <div class="footer-left">
        <strong>${data.meta.name}</strong>
        <div>${data.meta.title}</div>
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
  return products.map(p => {
    if (p.featured) return buildFeaturedCard(p, prefix);
    return buildStandardCard(p, prefix);
  }).join('');
}

function buildFeaturedCard(p, prefix) {
  const liveBtn  = p.liveUrl  ? `<a href="${p.liveUrl}" class="btn" target="_blank" rel="noopener noreferrer">&#x1F680; View Live App</a>` : '';
  const ghBtn    = p.githubRepo ? `<a href="https://github.com/${p.githubRepo}" class="btn btn-outline" target="_blank" rel="noopener noreferrer">GitHub Repo</a>` : '';
  const caseBtn  = p.caseStudyUrl ? `<a href="${prefix + p.caseStudyUrl.replace(/^\//, '')}" class="btn btn-outline">Full Case Study</a>` : '';
  const capItems = p.capabilities.map(c => `<li>${c}</li>`).join('');

  return `
    <div class="card featured">
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
        <div class="card-links">${liveBtn}${caseBtn}${ghBtn}</div>
      </div>
    </div>`;
}

function buildStandardCard(p, prefix) {
  const caseBtn = p.caseStudyUrl ? `<a href="${prefix + p.caseStudyUrl.replace(/^\//, '')}" class="btn">View Case Study</a>` : '';
  const bullets = p.capabilities.slice(0, 4).map(c => `<li>${c}</li>`).join('');

  return `
    <div class="card">
      <img src="${prefix + p.image.replace(/^\//, '')}" alt="${p.imageAlt}" loading="lazy">
      <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:8px;">
        ${badge(p.status)}
        <h3 style="margin:0;">${p.title}</h3>
      </div>
      <p>${p.summary}</p>
      ${tagList(p.tags)}
      <ul style="margin-top:10px;">${bullets}</ul>
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
function buildAboutCards(data, depth) {
  const prefix = depth === '1' ? '../' : '';
  return data.about.cards.map(c => {
    let body = '';
    if (c.items) {
      body = `<ul>${c.items.map(i => `<li>${i}</li>`).join('')}</ul>`;
    } else if (c.featuredProject) {
      const fp = c.featuredProject;
      body = `<p>${c.body}</p>
        <div class="about-featured">
          <h4>&#x2B50; ${fp.name}</h4>
          <p>${fp.description}</p>
          <div class="feat-links">
            <a href="${fp.liveUrl}" class="btn" target="_blank" rel="noopener noreferrer">View Live App</a>
            <a href="${prefix + fp.url.replace(/^\//, '')}" class="btn btn-outline">Case Study</a>
          </div>
        </div>`;
    } else {
      body = `<p>${c.body}</p>`;
    }
    return `<div class="card">${body ? `<h3>${c.title}</h3>${body}` : ''}</div>`;
  }).join('');
}

/* Export helpers for inline scripts */
window.Portfolio = {
  loadData, buildNav, buildFooter, buildProductCards,
  buildProjectCards, buildApproachCards, buildTechCards,
  buildAboutCards, initNavToggle, setYear, tagList, badge
};
