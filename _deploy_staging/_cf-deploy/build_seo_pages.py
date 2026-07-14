"""
Generate a rich, genuinely-useful landing page per tool (not thin/templated):
intro, detailed explanation, step-by-step how-to, real use cases, FAQ, tips,
related tools and JSON-LD structured data. Also an all-tools hub + sitemap.
Run from mastertools/:  python build_seo_pages.py
"""
import re, html, json
from pathlib import Path

HERE = Path(__file__).parent
DATA = (HERE / "js" / "tools-data.js").read_text(encoding="utf-8")
SITE = "https://mastertools-501.pages.dev"   # primary URL; change when you get a custom domain
BRAND = "Somar's All Free Tools"

cat_re = re.compile(
    r'id:\s*"([^"]+)",\s*name:\s*"([^"]+)",\s*icon:\s*"([^"]+)",\s*desc:\s*"([^"]+)",\s*\n\s*tools:\s*\[(.*?)\]\s*\n\s*\}', re.S)
tool_re = re.compile(r'\{\s*id:\s*"([^"]+)",\s*name:\s*"([^"]+)",\s*icon:\s*"([^"]+)",\s*desc:\s*"([^"]+)"')

categories = []
for cm in cat_re.finditer(DATA):
    cid, cname, cicon, cdesc, body = cm.groups()
    tools = [{"id": t.group(1), "name": t.group(2), "icon": t.group(3), "desc": t.group(4)} for t in tool_re.finditer(body)]
    categories.append({"id": cid, "name": cname, "icon": cicon, "desc": cdesc, "tools": tools})
ALL = [dict(t, cat=c["name"], catid=c["id"]) for c in categories for t in c["tools"]]
print(f"parsed {len(categories)} categories, {len(ALL)} tools")

# type per category -> tailors how-to + FAQ
TYPE = {"pdf":"file","image":"file","video":"file","text":"text","convert":"text","dev":"text",
        "seo":"text","security":"text","generators":"generator","color":"generator",
        "calc":"calc","math":"calc","health":"calc","datetime":"calc","misc":"utility"}

CAT = {
 "pdf":("PDF","work with PDF documents without buying desktop software","Whether you're sending a report, filling a form, or archiving paperwork, PDF tasks come up constantly — and paying for a full PDF suite for a one-off job makes little sense.",
   ["Compress a large report so it fits an email attachment limit.","Combine several documents into one file before sending.","Prepare a contract or form for signing and sharing.","Handle confidential PDFs privately, since files never leave your device."]),
 "image":("image","edit and convert images in seconds","From social posts to product photos, everyone deals with images — and most quick edits don't need heavy software like Photoshop.",
   ["Shrink a photo so a website or form accepts the upload.","Convert an image to the exact format a platform requires.","Crop or resize a picture for a profile or thumbnail.","Add a watermark before sharing your work online."]),
 "video":("video & social","handle video and social content fast","Creators and everyday users constantly repurpose clips, grab audio, or check post limits — usually across clunky apps.",
   ["Pull the audio out of a clip to reuse as a voiceover or track.","Trim a long recording down to a shareable highlight.","Shrink a video so a messaging app or platform accepts it.","Check a caption's length before posting."]),
 "text":("text & writing","clean up, format, and transform text","Writers, students, marketers and developers all wrangle text daily — counting it, reformatting it, or cleaning messy copy.",
   ["Check a piece of writing against a word or character limit.","Clean up messy text pasted from PDFs or spreadsheets.","Reformat a list — sort it, dedupe it, or renumber it.","Convert text between cases or encodings for a project."]),
 "convert":("converter","convert between data formats and units","Data rarely arrives in the format you need, so quick, reliable conversion saves real time.",
   ["Turn a JSON export into CSV for a spreadsheet.","Convert units for a recipe, DIY project, or homework.","Encode or decode data while debugging an app.","Switch a color value between HEX, RGB and HSL."]),
 "generators":("generator","generate secure codes, IDs and sample data","Developers, testers and everyday users often need something generated on demand — a password, an ID, or realistic dummy data.",
   ["Create a strong, unique password for a new account.","Generate a batch of test data for an app or demo.","Produce a QR code for a link, menu, or business card.","Make a unique ID or key for a project."]),
 "calc":("calculator","run everyday and financial calculations","From splitting a bill to planning a loan, small calculations shape real decisions — and doing them by hand invites mistakes.",
   ["Work out monthly payments before taking a loan.","Split a bill and tip fairly among friends.","Check a discount or tax amount while shopping.","Compare financial scenarios side by side."]),
 "math":("math & science","solve math and science problems quickly","Students, teachers and engineers need dependable answers to common calculations without pulling out a graphing calculator.",
   ["Check homework answers step by step.","Verify a formula result while studying.","Crunch statistics for a report or experiment.","Solve an equation you'd otherwise do by hand."]),
 "health":("health & fitness","estimate body, diet and fitness numbers","Fitness and diet goals rely on a few key numbers — and having quick estimates helps you plan and track progress.",
   ["Estimate daily calorie needs for a goal.","Track a healthy weight range over time.","Plan macros for a diet.","Set training zones for a workout."]),
 "datetime":("time & date","handle dates, times and countdowns","Deadlines, ages, time zones and timers come up in work and life all the time.",
   ["Count down to an event, launch or holiday.","Work out the exact days between two dates.","Convert a meeting time across time zones.","Time a task or focus session."]),
 "dev":("developer","speed up everyday coding tasks","Developers repeat the same small jobs constantly — formatting, decoding, testing patterns — and a quick web tool beats context-switching.",
   ["Format or minify code before shipping.","Decode a JWT while debugging auth.","Test a regular expression against sample text.","Look up an HTTP status code fast."]),
 "seo":("SEO & web","optimize pages for search and sharing","Anyone running a site needs clean meta tags, previews and keyword checks — without an expensive SEO suite.",
   ["Write and preview a Google title and description.","Check keyword density in a draft.","Generate Open Graph or Twitter card tags.","Build a trackable campaign URL."]),
 "color":("color & design","pick colors and build CSS visually","Designers and developers fine-tune colors, gradients and shadows constantly, and seeing the result live speeds everything up.",
   ["Build a CSS gradient and copy the code.","Check color contrast for accessibility.","Generate a matching palette for a project.","Create a box-shadow or border-radius visually."]),
 "security":("security & encryption","encrypt, hash and encode safely","Protecting text, generating hashes and encoding data are everyday needs for developers and privacy-minded users alike.",
   ["Encrypt a note before storing or sending it.","Generate a hash to verify a file or password.","Encode data for safe transport in a URL.","Create a bcrypt or .htpasswd entry."]),
 "misc":("everyday","get quick everyday jobs done","Some tools just make daily life easier — a notepad, a picker, a counter — always one tab away.",
   ["Jot a quick auto-saved note.","Pick a random winner or option fairly.","Keep a simple checklist for the day.","Check your device or connection details."]),
}

HOWTO = {
 "file":["Click <b>“Open {n}”</b> to launch the tool.","Drag your file onto the drop zone (or click to browse).","Adjust any options shown for your task.","Download the finished file — processed entirely in your browser."],
 "text":["Click <b>“Open {n}”</b> to launch the tool.","Paste or type your text into the box.","Pick your options or press the action button.","Copy or download the result instantly."],
 "calc":["Click <b>“Open {n}”</b> to launch the tool.","Enter your numbers in the fields.","Read the result — it updates as you type.","Tweak the values to compare different scenarios."],
 "generator":["Click <b>“Open {n}”</b> to launch the tool.","Set the options you want.","Press generate to create your result.","Copy or download what you made."],
 "utility":["Click <b>“Open {n}”</b> to launch the tool.","Use it right on the page — no setup needed.","Your data stays in your browser, saved locally if relevant."],
}

def faq(t, typ):
    n = t["name"]
    q = [("Is " + n + " free to use?",
          n + " is completely free. There are no limits, no watermarks on your results, and no sign-up required."),
         ("Is my data private and safe?",
          ("Yes. " + n + " runs entirely in your web browser — your files are processed on your own device and are never uploaded to any server."
           if typ == "file" else
           "Yes. Everything runs locally in your browser, so the data you enter never leaves your device."))]
    q.append(("Do I need to install anything or create an account?",
              "No. " + n + " works instantly in any modern browser on desktop, tablet or mobile — nothing to download and no account needed."))
    if typ == "file":
        q.append(("What if my file is large?", "Because processing happens on your device, larger files simply take a little longer — there's no upload wait and no size cap imposed by us."))
    elif typ == "calc":
        q.append(("How accurate are the results?", n + " uses standard formulas and recalculates instantly. Results are estimates for general guidance; see our Disclaimer for health and finance tools."))
    elif typ == "text":
        q.append(("Is there a limit on how much I can process?", "There's no practical limit — " + n + " handles your text in the browser, so even large inputs are processed quickly."))
    else:
        q.append(("Can I use the results commercially?", "Yes — whatever you create with " + n + " is yours to use freely, for personal or commercial projects."))
    return q

def esc(s): return html.escape(str(s), quote=True)

def consent_html(up):
    return ('<div id="cookieBanner" style="display:none;position:fixed;left:12px;right:12px;bottom:12px;z-index:9999;'
            'gap:12px;align-items:center;justify-content:center;flex-wrap:wrap;background:rgba(11,16,32,.97);'
            'border:1px solid rgba(255,255,255,.18);border-radius:14px;padding:14px 16px;box-shadow:0 10px 40px rgba(0,0,0,.5);'
            'font-size:14px;color:#dbe6ff">'
            '<span>🍪 We use cookies for basic functionality and, when enabled, ads &amp; analytics. '
            f'By continuing you agree to our <a href="{up}#/page/privacy" style="color:#22d3ee">Privacy Policy</a>.</span>'
            '<span style="display:flex;gap:8px"><button id="cookieOk" class="btn small" style="padding:8px 16px">Accept</button>'
            '<button id="cookieNo" class="btn small secondary" style="padding:8px 16px">Decline</button></span></div>'
            "<script>(function(){var b=document.getElementById('cookieBanner');if(!b)return;"
            "if(!localStorage.getItem('mt-consent'))b.style.display='flex';"
            "function c(v){localStorage.setItem('mt-consent',v);b.style.display='none';}"
            "var o=document.getElementById('cookieOk'),n=document.getElementById('cookieNo');"
            "if(o)o.onclick=function(){c('accepted');};if(n)n.onclick=function(){c('declined');};})();</script>")

FONTS = ('<link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/'
         'css2?family=Orbitron:wght@500;700;900&family=Rajdhani:wght@400;500;600;700&display=swap" rel="stylesheet">')
ICON = ('<link rel="icon" href="data:image/svg+xml,'
        '<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🛸</text></svg>">')

def page(t, up):
    n, icon, desc, cat, catid, tid = t["name"], t["icon"], t["desc"], t["cat"], t["catid"], t["id"]
    typ = TYPE.get(catid, "utility")
    label, action, why, uses = CAT.get(catid, ("", "get things done", "", []))
    act = desc.rstrip(".")
    act_l = act[0].lower() + act[1:] if act else act
    idx = sum(ord(c) for c in tid)
    intros = [
        f"{n} is a free online {label} tool that helps you {act_l}. Everything happens right in your browser, so it's fast, completely private, and free — no account, no installs, and no watermarks.",
        f"Need to {act_l}? {n} does exactly that, straight from your browser. It's part of Somar's All Free Tools' free {esc(cat)} collection and works on any device with nothing to install.",
        f"{n} makes it simple to {act_l}. Because it runs entirely on your own device, nothing you use is uploaded anywhere — and you can run it as many times as you like, always free.",
    ]
    intro = intros[idx % 3]
    steps = "".join("<li>" + s.replace("{n}", esc(n)) + "</li>" for s in HOWTO[typ])
    # rotate use cases so category pages aren't identical
    u = uses[idx % len(uses):] + uses[:idx % len(uses)] if uses else []
    uses_html = "".join(f"<li>{esc(x)}</li>" for x in u[:4])
    faqs = faq(t, typ)
    faq_html = "".join(f"<h3>{esc(q)}</h3><p>{esc(a)}</p>" for q, a in faqs)
    related = [x for x in ALL if x["catid"] == catid and x["id"] != tid][:8]
    rel_html = "".join(f'<a class="chip" href="{up}tools/{r["id"]}/">{r["icon"]} {esc(r["name"])}</a>' for r in related)

    ld = {
        "@context": "https://schema.org", "@type": "SoftwareApplication",
        "name": n + " — " + BRAND, "applicationCategory": "UtilitiesApplication",
        "operatingSystem": "Any (web browser)", "description": act + ". Free, private, in-browser.",
        "offers": {"@type": "Offer", "price": "0", "priceCurrency": "USD"},
        "url": f"{SITE}/tools/{tid}/",
    }
    ld_faq = {"@context": "https://schema.org", "@type": "FAQPage",
              "mainEntity": [{"@type": "Question", "name": q,
                              "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in faqs]}

    return f"""<!DOCTYPE html>
<html lang="en" data-theme="dark">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{esc(n)} — Free Online Tool | Somar's All Free Tools</title>
<meta name="description" content="{esc(act)}. 100% free, private and fast — {esc(n)} runs in your browser with no signup, no uploads and no limits.">
<meta name="keywords" content="{esc(n.lower())}, free {esc(n.lower())}, online {esc(n.lower())}, {esc(cat.lower())}, somar's all free tools">
<link rel="canonical" href="{SITE}/tools/{tid}/">
<meta property="og:site_name" content="Somar's All Free Tools">
<meta property="og:title" content="{esc(n)} — Somar's All Free Tools"><meta property="og:description" content="{esc(act)}. Free, private, in your browser."><meta property="og:type" content="website"><meta property="og:url" content="{SITE}/tools/{tid}/">
<meta name="twitter:card" content="summary">
{ICON}{FONTS}
<link rel="stylesheet" href="{up}css/styles.css">
<script type="application/ld+json">{json.dumps(ld)}</script>
<script type="application/ld+json">{json.dumps(ld_faq)}</script>
</head>
<body>
<header class="topbar"><div class="topbar-inner">
  <a href="{up}" class="brand"><span class="brand-icon">🛸</span><span class="brand-name">Master<span class="brand-accent">Tools</span></span></a>
  <div style="flex:1"></div><a class="btn small" href="{up}tools/">All tools</a>
</div></header>
<div class="ad-slot ad-leaderboard" data-ad="top"><span>Ad space — 728×90 leaderboard</span></div>
<main class="app">
  <div class="breadcrumb"><a href="{up}">Home</a> / <a href="{up}#/category/{catid}">{esc(cat)}</a> / {esc(n)}</div>
  <div class="tool-header"><span class="th-icon">{icon}</span><h1>{esc(n)}</h1></div>
  <p class="tool-sub">{esc(desc)}</p>
  <a class="btn" style="font-size:18px;padding:14px 26px" href="{up}#/tool/{tid}">▶ Open {esc(n)}</a>
  <div class="tool-layout">
    <div class="tool-panel">
      <p style="font-size:17px">{esc(intro)}</p>
      <h2>What is {esc(n)}?</h2>
      <p>{esc(n)} is built for anyone who needs to {esc(act_l)} without downloading software or signing up. {esc(why)} {esc(n)} solves that in one click, right in your browser — and because the work happens on your own device, it's both instant and private.</p>
      <h2>How to use {esc(n)}</h2>
      <ol>{steps}</ol>
      {"<h2>Common uses</h2><ul>" + uses_html + "</ul>" if uses_html else ""}
      <h2>Why use Somar's All Free Tools?</h2>
      <ul>
        <li><b>Free forever</b> — every feature, no hidden paywall or watermark.</li>
        <li><b>Private by design</b> — processing happens on your device, not our servers.</li>
        <li><b>Instant</b> — no queues, no waiting, no upload time.</li>
        <li><b>Works everywhere</b> — desktop, tablet and mobile, nothing to install.</li>
        <li><b>No signup</b> — just open it and go.</li>
      </ul>
      <h2>Frequently asked questions</h2>
      {faq_html}
      <h2>Related {esc(cat)} tools</h2>
      <div class="chip-row">{rel_html}</div>
    </div>
    <aside class="ad-rail"><div class="ad-slot" style="min-height:250px;flex-direction:column"><span>Ad space</span><span>300×250</span></div></aside>
  </div>
</main>
<footer class="footer"><div class="footer-inner">
  <div><strong>Somar's All Free Tools</strong> — 200+ free tools, one place.</div>
  <nav class="footer-links">
    <a href="{up}">Home</a><a href="{up}#/page/about">About</a><a href="{up}#/page/contact">Contact</a>
    <a href="{up}#/page/privacy">Privacy</a><a href="{up}#/page/terms">Terms</a><a href="{up}#/page/disclaimer">Disclaimer</a>
  </nav>
  <div class="footer-copy">© <span>2026</span> Somar's All Free Tools</div>
</div></footer>
{consent_html(up)}
</body></html>"""

tools_dir = HERE / "tools"
for t in ALL:
    d = tools_dir / t["id"]; d.mkdir(parents=True, exist_ok=True)
    (d / "index.html").write_text(page(t, "../../"), encoding="utf-8")

# all-tools hub
cards = ""
for c in categories:
    cards += f'<div class="section-title">{c["icon"]} {esc(c["name"])} <span class="count">{len(c["tools"])} tools</span></div><div class="cat-grid">'
    for t in c["tools"]:
        cards += (f'<a class="tool-card" href="{t["id"]}/"><div class="tc-icon">{t["icon"]}</div>'
                  f'<div class="tc-name">{esc(t["name"])}</div><div class="tc-desc">{esc(t["desc"])}</div></a>')
    cards += "</div>"
(tools_dir / "index.html").write_text(f"""<!DOCTYPE html><html lang="en" data-theme="dark"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>All {len(ALL)} Free Online Tools — Somar's All Free Tools</title>
<meta name="description" content="Browse all {len(ALL)} free online tools on Somar's All Free Tools — PDF, image, video, text, converters, calculators, developer, SEO, color and security tools. Free, private, in your browser.">
<link rel="canonical" href="{SITE}/tools/">{ICON}{FONTS}
<link rel="stylesheet" href="../css/styles.css"></head><body>
<header class="topbar"><div class="topbar-inner"><a href="../" class="brand"><span class="brand-icon">🛸</span><span class="brand-name">Master<span class="brand-accent">Tools</span></span></a></div></header>
<main class="app"><div class="breadcrumb"><a href="../">Home</a> / All tools</div>
<section class="hero"><h1>All Tools</h1><p>Every one of our {len(ALL)} free, private, in-browser tools — pick one to get started.</p></section>
{cards}</main>
<footer class="footer"><div class="footer-inner"><div><strong>Somar's All Free Tools</strong></div>
<nav class="footer-links"><a href="../">Home</a><a href="../#/page/about">About</a><a href="../#/page/privacy">Privacy</a><a href="../#/page/terms">Terms</a></nav>
<div class="footer-copy">© 2026 Somar's All Free Tools</div></div></footer>""" + consent_html("../") + """</body></html>""", encoding="utf-8")

# sitemap
urls = [f"{SITE}/", f"{SITE}/tools/"] + [f"{SITE}/tools/{t['id']}/" for t in ALL]
sm = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
for i, u in enumerate(urls):
    sm.append(f'  <url><loc>{u}</loc><changefreq>weekly</changefreq><priority>{"1.0" if i==0 else "0.8"}</priority></url>')
sm.append("</urlset>")
(HERE / "sitemap.xml").write_text("\n".join(sm), encoding="utf-8")
print(f"wrote {len(ALL)} rich tool pages + hub + sitemap ({len(urls)} urls). SITE={SITE}")
