/* ============================================================
   MasterTools — App shell: routing, rendering, search, theme
   ============================================================ */
(function () {
  const app = document.getElementById("app");
  const searchInput = document.getElementById("globalSearch");
  const searchResults = document.getElementById("searchResults");
  document.getElementById("year").textContent = new Date().getFullYear();

  /* ---------- Cookie consent ---------- */
  (function cookieConsent() {
    const banner = document.getElementById("cookieBanner");
    if (!banner) return;
    if (!localStorage.getItem("mt-consent")) banner.style.display = "flex";
    const close = (choice) => { localStorage.setItem("mt-consent", choice); banner.style.display = "none"; };
    const ok = document.getElementById("cookieOk"), no = document.getElementById("cookieNo");
    if (ok) ok.addEventListener("click", () => close("accepted"));
    if (no) no.addEventListener("click", () => close("declined"));
  })();

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
        <h1>Somar's All Free Tools</h1>
        <p>${totalTools}+ free online tools in one place — PDF, image, video, AI, text, converters, calculators, developer, SEO and security tools. Everything runs entirely in your browser. No signup. No uploads. No limits.</p>
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
      <p>${esc(t.desc)} This one needs an AI/server backend (the paid tier of Somar's All Free Tools).</p>
      <p class="hint">Wire it to an API key or a self-hosted open-weight model, then gate it behind a subscription or higher ad tier.</p>
      <button class="btn" onclick="alert('Hook this button to your backend / checkout.')">Try the demo</button>
    </div>`;
  }

  function renderStatic(page) {
    // NOTE: replace the [BRACKETED] placeholders with your real details before launch.
    const SITE = "Somar's All Free Tools";
    const EMAIL = "mamunini124@gmail.com";
    const OWNER = "Somar";
    const UPDATED = "July 12, 2026";
    const pages = {
      about:
        "<h1>About " + SITE + "</h1>" +
        "<p>" + SITE + " is a free collection of 200+ online tools — PDF, image, video, text, converters, calculators, developer and security utilities — all in one fast, private place.</p>" +
        "<p><b>Privacy by design:</b> almost every tool runs entirely in your browser. Your files are processed on your own device and are not uploaded to any server. A few clearly-labelled tools call public APIs or download an AI model on first use; those are noted on the tool and in our Privacy Policy.</p>" +
        "<p>The site is kept free through advertising. If you find it useful, sharing it helps a lot. Questions or feedback? See the <a href='#/page/contact'>Contact</a> page.</p>",

      contact:
        "<h1>Contact Us</h1>" +
        "<p>We'd love to hear from you — feedback, bug reports, tool requests or business enquiries.</p>" +
        "<p><b>Email:</b> <a href='mailto:" + EMAIL + "'>" + EMAIL + "</a></p>" +
        "<p>We usually reply within 2–3 business days. When reporting a problem with a tool, please include the tool name and your browser so we can help faster.</p>" +
        "<p>Operated by " + OWNER + ".</p>",

      privacy:
        "<h1>Privacy Policy</h1>" +
        "<p class='hint'>Last updated: " + UPDATED + "</p>" +
        "<p>This Privacy Policy explains how " + SITE + " (\"we\", \"us\") handles information when you use our website. By using the site, you agree to this policy.</p>" +
        "<h2>1. Information we process</h2>" +
        "<ul>" +
        "<li><b>Files and text you use in tools:</b> Most tools run <b>entirely in your browser</b>. Files (PDFs, images, videos, audio) are processed locally on your device and are <b>not uploaded to us</b>. We never see or store them.</li>" +
        "<li><b>Local storage:</b> Some tools save preferences and content <b>on your own device</b> (e.g. theme, the Notepad and To‑Do list). This never leaves your browser and you can clear it anytime.</li>" +
        "<li><b>We run no accounts and no database.</b> We do not collect names, emails or passwords unless you email us directly.</li>" +
        "</ul>" +
        "<h2>2. Tools that use third‑party services</h2>" +
        "<p>A small number of clearly‑labelled tools send data to external services to work:</p>" +
        "<ul>" +
        "<li><b>Grammar Checker</b> sends the text you enter to the LanguageTool API.</li>" +
        "<li><b>Currency Converter</b> fetches exchange rates from a public rates API.</li>" +
        "<li><b>AI Transcriber / Subtitles / Speech‑to‑Text</b> download an AI model from Hugging Face on first use; your audio is processed <b>in your browser</b>, not uploaded.</li>" +
        "<li><b>Video tools</b> download an engine file the first time, then run locally.</li>" +
        "</ul>" +
        "<h2>3. Cookies and advertising</h2>" +
        "<p>We may display ads through <b>Google AdSense</b>. Third‑party vendors, including Google, use cookies to serve ads based on your prior visits to this and other websites.</p>" +
        "<ul>" +
        "<li>Google's use of advertising cookies enables it and its partners to serve ads to you based on your visits. You can opt out of personalised advertising at <a href='https://www.google.com/settings/ads' target='_blank' rel='noopener'>Google Ads Settings</a>.</li>" +
        "<li>Learn how Google uses data at <a href='https://policies.google.com/technologies/partner-sites' target='_blank' rel='noopener'>policies.google.com/technologies/partner-sites</a>.</li>" +
        "<li>You can also opt out of third‑party vendor cookies at <a href='https://www.aboutads.info' target='_blank' rel='noopener'>aboutads.info</a>.</li>" +
        "</ul>" +
        "<h2>4. Your rights (GDPR / CCPA)</h2>" +
        "<p>Because we do not collect personal data on our own servers, there is little for us to hold. For ad‑related data, use the Google and vendor opt‑out links above. EU/UK users have rights to access, rectify and erase personal data; California users may opt out of the \"sale\" of personal information (we do not sell personal information).</p>" +
        "<h2>5. Children</h2>" +
        "<p>This site is not directed to children under 13 (or the minimum age in your country), and we do not knowingly collect their data.</p>" +
        "<h2>6. Changes & contact</h2>" +
        "<p>We may update this policy; changes appear on this page with a new date. Questions? Email <a href='mailto:" + EMAIL + "'>" + EMAIL + "</a>.</p>",

      terms:
        "<h1>Terms of Service</h1>" +
        "<p class='hint'>Last updated: " + UPDATED + "</p>" +
        "<p>By accessing or using " + SITE + " (the \"Service\"), you agree to these Terms. If you do not agree, please do not use the Service.</p>" +
        "<h2>1. Use of the Service</h2>" +
        "<p>The Service provides free online utilities for your personal and commercial use. You agree not to misuse it, including attempting to disrupt it, reverse‑engineer it for malicious purposes, or use it for anything unlawful.</p>" +
        "<h2>2. No warranty</h2>" +
        "<p>The Service is provided <b>\"as is\" and \"as available\"</b> without warranties of any kind, express or implied, including accuracy, fitness for a particular purpose, or uninterrupted availability. You use the tools and their output at your own risk.</p>" +
        "<h2>3. Limitation of liability</h2>" +
        "<p>To the maximum extent permitted by law, " + OWNER + " shall not be liable for any indirect, incidental, or consequential damages, or any loss of data, profits, or goodwill, arising from your use of (or inability to use) the Service.</p>" +
        "<h2>4. Intellectual property</h2>" +
        "<p>The site's design and code are owned by " + OWNER + ". Third‑party open‑source libraries remain under their respective licences. Content you process with the tools remains yours.</p>" +
        "<h2>5. Third‑party services & ads</h2>" +
        "<p>The Service may link to or rely on third‑party services and display third‑party ads. We are not responsible for their content, policies, or practices.</p>" +
        "<h2>6. Changes & governing law</h2>" +
        "<p>We may update these Terms at any time. Continued use means you accept the changes. These Terms are governed by the laws of Bangladesh. Contact: <a href='mailto:" + EMAIL + "'>" + EMAIL + "</a>.</p>",

      disclaimer:
        "<h1>Disclaimer</h1>" +
        "<p class='hint'>Last updated: " + UPDATED + "</p>" +
        "<p>All tools and information on " + SITE + " are provided for <b>general informational purposes only</b>. While we aim for accuracy, we make no guarantees and accept no liability for decisions made based on the results.</p>" +
        "<h2>Health &amp; fitness tools</h2>" +
        "<p>Calculators such as BMI, BMR, TDEE, calories, body fat and heart‑rate zones are <b>estimates for general guidance only and are not medical advice</b>. Consult a qualified healthcare professional before making health, diet or exercise decisions.</p>" +
        "<h2>Financial tools</h2>" +
        "<p>Calculators such as loan, mortgage, interest, tax, ROI and salary are <b>estimates and not financial, tax or legal advice</b>. Consult a licensed professional before making financial decisions.</p>" +
        "<h2>Accuracy</h2>" +
        "<p>Results depend on the values you enter and the limits of in‑browser processing. Always verify important results independently. Use of the tools is entirely at your own risk.</p>"
    };
    var body = pages[page];
    if (!body) body = "<h1>Page not found</h1><p><a href='#/'>Return home</a></p>";
    app.innerHTML = "<div class='static-page'>" + body + "</div>";
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
