/* ============================================================
   MasterTools — App shell: routing, rendering, search, theme
   ============================================================ */
(function () {
  const app = document.getElementById("app");
  const searchInput = document.getElementById("globalSearch");
  const searchResults = document.getElementById("searchResults");
  document.getElementById("year").textContent = new Date().getFullYear();

  /* ---------- Theme (sci-fi dark by default) ---------- */
  const themeToggle = document.getElementById("themeToggle");
  const savedTheme = localStorage.getItem("mt-theme");
  const setTheme = (t) => { document.documentElement.setAttribute("data-theme", t); themeToggle.textContent = t === "dark" ? "☀️" : "🌙"; };
  setTheme(savedTheme === "light" ? "light" : "dark");
  themeToggle.addEventListener("click", () => {
    const next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
    setTheme(next); localStorage.setItem("mt-theme", next);
  });

  /* ---------- Starfield ---------- */
  (function stars() {
    const box = document.getElementById("stars"); if (!box) return;
    let html = "";
    for (let i = 0; i < 70; i++) {
      html += `<i style="left:${Math.random()*100}%;top:${Math.random()*100}%;animation-delay:${(Math.random()*4).toFixed(2)}s;opacity:${(Math.random()*.6+.2).toFixed(2)}"></i>`;
    }
    box.innerHTML = html;
  })();

  /* ---------- Helpers ---------- */
  const el = (html) => { const d = document.createElement("div"); d.innerHTML = html.trim(); return d.firstElementChild; };
  const esc = (s) => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  function toolCard(t) {
    return `<a class="tool-card" href="#/tool/${t.id}">
      ${t.pro ? '<span class="badge-pro">PRO</span>' : ''}
      <div class="tc-icon">${t.icon}</div>
      <div class="tc-name">${esc(t.name)}</div>
      <div class="tc-desc">${esc(t.desc)}</div>
    </a>`;
  }

  /* ---------- Views ---------- */
  function relatedRow(id) {
    const rel = (window.getRelated ? window.getRelated(id) : []);
    if (!rel.length) return "";
    return `<div class="related-row"><span class="related-label">⇄ Related &amp; reverse tools</span>${
      rel.map(t => `<a class="chip related-chip" href="#/tool/${t.id}">${t.icon} ${esc(t.name)}</a>`).join("")
    }</div>`;
  }

  function renderHome() {
    const totalTools = window.ALL_TOOLS.length;
    const impl = window.ALL_TOOLS.filter(t => t.impl).length;
    let html = `
      <section class="hero">
        <h1>The Tool Nexus</h1>
        <p>One console. Every utility in the known universe. ${totalTools} tools for PDF, images, video, AI, text, code, security and more — running entirely in your browser at light speed. No signup. No uploads. No limits.</p>
        <div class="hero-stats">
          <div><b>${totalTools}</b> tools online</div>
          <div><b>${window.TOOL_CATEGORIES.length}</b> systems</div>
          <div><b>100%</b> in-browser</div>
        </div>
        <div class="chip-row">
          ${window.TOOL_CATEGORIES.map(c => `<a class="chip" href="#/category/${c.id}">${c.icon} ${esc(c.name)}</a>`).join("")}
        </div>
      </section>`;

    window.TOOL_CATEGORIES.forEach((cat, i) => {
      html += `
        <section>
          <div class="section-title">${cat.icon} ${esc(cat.name)} <span class="count">${cat.tools.length} tools</span></div>
          <div class="cat-grid">${cat.tools.map(toolCard).join("")}</div>
        </section>`;
      if (i === 2) html += `<div class="ad-slot ad-inline" data-ad="home-mid"><span>Ad space — 728×90</span></div>`;
    });
    app.innerHTML = html;
    window.scrollTo(0, 0);
  }

  function renderCategory(id) {
    const cat = window.getCategory(id);
    if (!cat) return renderHome();
    app.innerHTML = `
      <div class="breadcrumb"><a href="#/">Home</a> / ${esc(cat.name)}</div>
      <section class="hero" style="padding-top:12px">
        <h1>${cat.icon} ${esc(cat.name)}</h1>
        <p>${esc(cat.desc)}</p>
      </section>
      <div class="cat-grid">${cat.tools.map(toolCard).join("")}</div>`;
    window.scrollTo(0, 0);
  }

  function renderTool(id) {
    const t = window.getTool(id);
    if (!t) return renderHome();
    const impl = window.TOOL_IMPL[id];
    app.innerHTML = `
      <div class="breadcrumb"><a href="#/">Home</a> / <a href="#/category/${t.category}">${esc(t.categoryName)}</a> / ${esc(t.name)}</div>
      <div class="tool-header">
        <span class="th-icon">${t.icon}</span>
        <h1>${esc(t.name)}${t.pro ? ' <span class="badge-pro" style="position:static">PRO</span>' : ''}</h1>
      </div>
      <p class="tool-sub">${esc(t.desc)}</p>
      ${relatedRow(t.id)}
      <div class="tool-layout">
        <div class="tool-panel" id="toolMount"></div>
        <aside class="ad-rail">
          <div class="ad-slot" style="min-height:250px;flex-direction:column">
            <span>Ad space</span><span>300×250</span>
          </div>
        </aside>
      </div>`;
    const mount = document.getElementById("toolMount");
    if (typeof impl === "function") {
      try { impl(mount); }
      catch (e) { mount.innerHTML = `<p class="result-err">This tool hit an error: ${esc(e.message)}</p>`; }
    } else if (t.pro) {
      mount.innerHTML = proPlaceholder(t);
    } else {
      mount.innerHTML = `<div class="coming-soon"><h3>🚧 ${esc(t.name)} is on the roadmap</h3>
        <p>This tool is catalogued and ready to be built. The engine that powers the other tools plugs it in with one function.</p></div>`;
    }
    window.scrollTo(0, 0);
  }

  function proPlaceholder(t) {
    return `<div class="coming-soon">
      <h3>⭐ ${esc(t.name)} — Premium tool</h3>
      <p>${esc(t.desc)} This one needs an AI/server backend (the paid tier of MasterTools).</p>
      <p class="hint">Wire it to an API key or a self-hosted open-weight model, then gate it behind a subscription or higher ad tier.</p>
      <button class="btn" onclick="alert('Hook this button to your backend / checkout.')">Try the demo</button>
    </div>`;
  }

  function renderStatic(page) {
    const pages = {
      about: `<h1>About MasterTools</h1><p>MasterTools bundles hundreds of everyday utilities into one fast, private, ad-supported site. Most tools run entirely in your browser — your files never leave your device.</p><p>Built to be extended: every tool is one entry in the catalog plus one function. Premium tools (AI transcription, background removal, PDF↔Word) run on a backend and form the paid tier.</p>`,
      privacy: `<h1>Privacy</h1><p>Client-side tools process everything locally in your browser; files are not uploaded. Premium/AI tools that require a server will state so before use. We use ads to keep the free tools free.</p>`
    };
    app.innerHTML = `<div class="static-page">${pages[page] || "<h1>Not found</h1>"}</div>`;
    window.scrollTo(0, 0);
  }

  /* ---------- Router ---------- */
  function router() {
    const hash = location.hash.replace(/^#\/?/, "");
    const [route, param] = hash.split("/");
    if (!route) return renderHome();
    if (route === "category") return renderCategory(param);
    if (route === "tool") return renderTool(param);
    if (route === "page") return renderStatic(param);
    renderHome();
  }
  window.addEventListener("hashchange", router);
  window.addEventListener("DOMContentLoaded", router);
  // tools.js/qrcode load with defer; run once now too in case DOMContentLoaded already fired
  if (document.readyState !== "loading") router();

  /* ---------- Search ---------- */
  function search(q) {
    q = q.trim().toLowerCase();
    if (!q) { searchResults.hidden = true; return; }
    const matches = window.ALL_TOOLS.filter(t => {
      const hay = (t.name + " " + t.desc + " " + t.categoryName + " " + (t.tags || []).join(" ")).toLowerCase();
      return hay.includes(q);
    }).slice(0, 12);
    if (!matches.length) { searchResults.innerHTML = `<a>No tools found for "${esc(q)}"</a>`; searchResults.hidden = false; return; }
    searchResults.innerHTML = matches.map(t =>
      `<a href="#/tool/${t.id}"><span>${t.icon}</span><span>${esc(t.name)}</span><span class="sr-cat">${esc(t.categoryName)}</span></a>`
    ).join("");
    searchResults.hidden = false;
  }
  searchInput.addEventListener("input", e => search(e.target.value));
  searchInput.addEventListener("focus", e => { if (e.target.value) search(e.target.value); });
  document.addEventListener("click", e => {
    if (!e.target.closest(".search-wrap")) searchResults.hidden = true;
    if (e.target.closest(".search-results a")) { searchResults.hidden = true; searchInput.value = ""; }
  });
})();
