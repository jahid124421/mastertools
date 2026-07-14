/* ============================================================
   MasterTools — Tool implementations
   window.TOOL_IMPL[id] = function(mount){ ... }
   Each function renders a working tool into `mount`.
   ============================================================ */
window.TOOL_IMPL = {};
(function () {
  const IMPL = window.TOOL_IMPL;
  const esc = (s) => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  // load an external script once (for pdf-lib etc.)
  const loaded = {};
  function loadScript(src) {
    if (loaded[src]) return loaded[src];
    loaded[src] = new Promise((res, rej) => {
      const s = document.createElement("script"); s.src = src; s.onload = res; s.onerror = () => rej(new Error("Failed to load " + src));
      document.head.appendChild(s);
    });
    return loaded[src];
  }
  function copyBtn(getText) {
    return `<button class="btn secondary small" data-copy="1">📋 Copy</button>`;
  }
  function wireCopy(mount, getText) {
    const b = mount.querySelector('[data-copy]');
    if (b) b.addEventListener("click", async () => {
      try { await navigator.clipboard.writeText(getText()); b.textContent = "✅ Copied"; setTimeout(() => b.textContent = "📋 Copy", 1200); }
      catch { b.textContent = "Press Ctrl+C"; }
    });
  }
  function download(filename, content, type) {
    const blob = content instanceof Blob ? content : new Blob([content], { type: type || "text/plain" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = filename; a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  }

  /* ================= TEXT ================= */
  IMPL["word-counter"] = (m) => {
    m.innerHTML = `<label>Your text</label><textarea id="wc" placeholder="Start typing or paste text..."></textarea>
      <div class="stat-grid">
        <div class="stat-box"><b id="w">0</b><span>Words</span></div>
        <div class="stat-box"><b id="c">0</b><span>Characters</span></div>
        <div class="stat-box"><b id="cn">0</b><span>No spaces</span></div>
        <div class="stat-box"><b id="s">0</b><span>Sentences</span></div>
        <div class="stat-box"><b id="p">0</b><span>Paragraphs</span></div>
        <div class="stat-box"><b id="r">0s</b><span>Read time</span></div>
      </div>`;
    const t = m.querySelector("#wc");
    const upd = () => {
      const v = t.value;
      const words = (v.trim().match(/\S+/g) || []).length;
      m.querySelector("#w").textContent = words;
      m.querySelector("#c").textContent = v.length;
      m.querySelector("#cn").textContent = v.replace(/\s/g, "").length;
      m.querySelector("#s").textContent = (v.match(/[.!?]+(\s|$)/g) || []).length;
      m.querySelector("#p").textContent = (v.trim() ? v.trim().split(/\n\s*\n/).length : 0);
      const secs = Math.round(words / 200 * 60);
      m.querySelector("#r").textContent = secs < 60 ? secs + "s" : Math.floor(secs / 60) + "m " + (secs % 60) + "s";
    };
    t.addEventListener("input", upd); upd();
  };

  IMPL["case-converter"] = (m) => {
    m.innerHTML = `<label>Text</label><textarea id="in"></textarea>
      <div class="row" style="margin-top:10px">
        ${["UPPERCASE","lowercase","Title Case","Sentence case","aLtErNaTiNg","InVeRsE"].map(x=>`<button class="btn small" data-c="${x}">${x}</button>`).join("")}
      </div>
      <label style="margin-top:14px">Result ${copyBtn()}</label><div class="output-box" id="out"></div>`;
    const inp = m.querySelector("#in"), out = m.querySelector("#out");
    m.querySelectorAll("[data-c]").forEach(b => b.addEventListener("click", () => {
      const v = inp.value, mode = b.dataset.c; let r = v;
      if (mode === "UPPERCASE") r = v.toUpperCase();
      else if (mode === "lowercase") r = v.toLowerCase();
      else if (mode === "Title Case") r = v.replace(/\w\S*/g, w => w[0].toUpperCase() + w.slice(1).toLowerCase());
      else if (mode === "Sentence case") r = v.toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g, c => c.toUpperCase());
      else if (mode === "aLtErNaTiNg") r = v.split("").map((c,i)=>i%2?c.toUpperCase():c.toLowerCase()).join("");
      else if (mode === "InVeRsE") r = v.split("").map(c=>c===c.toUpperCase()?c.toLowerCase():c.toUpperCase()).join("");
      out.textContent = r;
    }));
    wireCopy(m, () => out.textContent);
  };

  IMPL["text-diff"] = (m) => {
    m.innerHTML = `<div class="row"><div><label>Original</label><textarea id="a"></textarea></div>
      <div><label>Changed</label><textarea id="b"></textarea></div></div>
      <button class="btn" id="go">Compare</button>
      <div class="output-box" id="out">Line-by-line differences appear here.</div>`;
    m.querySelector("#go").addEventListener("click", () => {
      const a = m.querySelector("#a").value.split("\n"), b = m.querySelector("#b").value.split("\n");
      const max = Math.max(a.length, b.length); let html = "";
      for (let i=0;i<max;i++){
        const l = a[i] ?? "", r = b[i] ?? "";
        if (l === r) html += `<div>  ${esc(l)}</div>`;
        else { if (l) html += `<div class="result-err">- ${esc(l)}</div>`; if (r) html += `<div class="result-ok">+ ${esc(r)}</div>`; }
      }
      m.querySelector("#out").innerHTML = html || "Identical.";
    });
  };

  IMPL["lorem-ipsum"] = (m) => {
    const W = "lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua enim ad minim veniam quis nostrud exercitation ullamco laboris nisi aliquip ex ea commodo consequat".split(" ");
    m.innerHTML = `<div class="row"><div><label>Paragraphs</label><input type="number" id="n" value="3" min="1" max="50"></div>
      <div><label>Words per paragraph</label><input type="number" id="wpp" value="40" min="5" max="200"></div></div>
      <button class="btn" id="go">Generate</button> ${copyBtn()}
      <div class="output-box" id="out"></div>`;
    const gen = () => {
      const n = +m.querySelector("#n").value, wpp = +m.querySelector("#wpp").value; let paras = [];
      for (let p=0;p<n;p++){ let words=[]; for(let i=0;i<wpp;i++) words.push(W[Math.floor(Math.random()*W.length)]);
        let s = words.join(" "); s = s[0].toUpperCase()+s.slice(1)+"."; paras.push(s); }
      m.querySelector("#out").textContent = paras.join("\n\n");
    };
    m.querySelector("#go").addEventListener("click", gen); gen();
    wireCopy(m, () => m.querySelector("#out").textContent);
  };

  IMPL["remove-duplicate-lines"] = (m) => {
    m.innerHTML = `<label>Text (one item per line)</label><textarea id="in"></textarea>
      <div class="checkbox-row"><input type="checkbox" id="ci"><label for="ci">Case-insensitive</label></div>
      <div class="checkbox-row"><input type="checkbox" id="sort"><label for="sort">Sort A→Z</label></div>
      <div class="checkbox-row"><input type="checkbox" id="trim" checked><label for="trim">Trim & drop empty lines</label></div>
      <button class="btn" id="go">Clean</button> ${copyBtn()}
      <label style="margin-top:12px">Result</label><div class="output-box" id="out"></div>`;
    m.querySelector("#go").addEventListener("click", () => {
      let lines = m.querySelector("#in").value.split("\n");
      if (m.querySelector("#trim").checked) lines = lines.map(l=>l.trim()).filter(Boolean);
      const seen = new Set(), ci = m.querySelector("#ci").checked, res = [];
      lines.forEach(l => { const k = ci ? l.toLowerCase() : l; if (!seen.has(k)) { seen.add(k); res.push(l); } });
      if (m.querySelector("#sort").checked) res.sort((a,b)=>a.localeCompare(b));
      m.querySelector("#out").textContent = res.join("\n");
    });
    wireCopy(m, () => m.querySelector("#out").textContent);
  };

  IMPL["reverse-text"] = (m) => {
    m.innerHTML = `<label>Text</label><textarea id="in"></textarea>
      <div class="row"><button class="btn small" data-m="chars">Reverse characters</button>
      <button class="btn small" data-m="words">Reverse words</button>
      <button class="btn small" data-m="lines">Reverse lines</button></div>
      <label style="margin-top:12px">Result ${copyBtn()}</label><div class="output-box" id="out"></div>`;
    m.querySelectorAll("[data-m]").forEach(b=>b.addEventListener("click",()=>{
      const v = m.querySelector("#in").value, mode=b.dataset.m; let r=v;
      if (mode==="chars") r=v.split("").reverse().join("");
      else if (mode==="words") r=v.split(/\s+/).reverse().join(" ");
      else r=v.split("\n").reverse().join("\n");
      m.querySelector("#out").textContent=r;
    }));
    wireCopy(m, () => m.querySelector("#out").textContent);
  };

  IMPL["slug-generator"] = (m) => {
    m.innerHTML = `<label>Title / text</label><input type="text" id="in" placeholder="My Awesome Blog Post!">
      <label style="margin-top:12px">Slug ${copyBtn()}</label><div class="output-box" id="out"></div>`;
    const upd = () => { m.querySelector("#out").textContent = m.querySelector("#in").value.toLowerCase().trim()
      .replace(/[^a-z0-9\s-]/g,"").replace(/\s+/g,"-").replace(/-+/g,"-").replace(/^-|-$/g,""); };
    m.querySelector("#in").addEventListener("input", upd); upd();
    wireCopy(m, () => m.querySelector("#out").textContent);
  };

  IMPL["text-repeater"] = (m) => {
    m.innerHTML = `<label>Text</label><textarea id="in"></textarea>
      <div class="row"><div><label>Times</label><input type="number" id="n" value="5" min="1" max="10000"></div>
      <div><label>Separator</label><select id="sep"><option value="\n">New line</option><option value=" ">Space</option><option value=", ">Comma</option><option value="">None</option></select></div></div>
      <button class="btn" id="go">Repeat</button> ${copyBtn()}
      <div class="output-box" id="out"></div>`;
    m.querySelector("#go").addEventListener("click", () => {
      const sep = m.querySelector("#sep").value.replace("\\n","\n");
      m.querySelector("#out").textContent = Array(+m.querySelector("#n").value).fill(m.querySelector("#in").value).join(sep);
    });
    wireCopy(m, () => m.querySelector("#out").textContent);
  };

  /* ================= CONVERTERS ================= */
  function encodeTool(m, label, enc, dec) {
    m.innerHTML = `<label>${label} input</label><textarea id="in"></textarea>
      <div class="row"><button class="btn small" id="e">Encode →</button><button class="btn small secondary" id="d">← Decode</button></div>
      <label style="margin-top:12px">Output ${copyBtn()}</label><div class="output-box" id="out"></div>`;
    const out = m.querySelector("#out");
    m.querySelector("#e").addEventListener("click", () => { try { out.textContent = enc(m.querySelector("#in").value); out.classList.remove("result-err"); } catch(e){ out.textContent="Error: "+e.message; out.classList.add("result-err"); } });
    m.querySelector("#d").addEventListener("click", () => { try { out.textContent = dec(m.querySelector("#in").value); out.classList.remove("result-err"); } catch(e){ out.textContent="Invalid input"; out.classList.add("result-err"); } });
    wireCopy(m, () => out.textContent);
  }
  IMPL["base64"] = (m) => encodeTool(m,"Base64", s=>btoa(unescape(encodeURIComponent(s))), s=>decodeURIComponent(escape(atob(s.trim()))));
  IMPL["url-encode"] = (m) => encodeTool(m,"URL", encodeURIComponent, decodeURIComponent);
  IMPL["html-encode"] = (m) => encodeTool(m,"HTML", esc, s=>{ const d=document.createElement("textarea"); d.innerHTML=s; return d.value; });

  IMPL["json-formatter"] = (m) => {
    m.innerHTML = `<label>JSON</label><textarea id="in" placeholder='{"hello":"world"}'></textarea>
      <div class="row"><div><label>Indent</label><select id="ind"><option>2</option><option>4</option><option value="\t">Tab</option></select></div></div>
      <div class="row"><button class="btn small" id="beauty">Beautify</button><button class="btn small secondary" id="min">Minify</button><button class="btn small secondary" id="val">Validate</button></div>
      <label style="margin-top:12px">Output ${copyBtn()}</label><div class="output-box" id="out"></div>`;
    const out = m.querySelector("#out");
    const parse = () => JSON.parse(m.querySelector("#in").value);
    const ind = () => { const v = m.querySelector("#ind").value; return v==="\\t"?"\t":+v; };
    m.querySelector("#beauty").addEventListener("click",()=>{ try{ out.textContent=JSON.stringify(parse(),null,ind()); out.className="output-box result-ok"; }catch(e){ out.textContent="❌ "+e.message; out.className="output-box result-err"; }});
    m.querySelector("#min").addEventListener("click",()=>{ try{ out.textContent=JSON.stringify(parse()); out.className="output-box"; }catch(e){ out.textContent="❌ "+e.message; out.className="output-box result-err"; }});
    m.querySelector("#val").addEventListener("click",()=>{ try{ parse(); out.textContent="✅ Valid JSON"; out.className="output-box result-ok"; }catch(e){ out.textContent="❌ "+e.message; out.className="output-box result-err"; }});
    wireCopy(m, () => out.textContent);
  };

  IMPL["json-to-csv"] = (m) => {
    m.innerHTML = `<label>JSON array of objects</label><textarea id="in" placeholder='[{"name":"Al","age":30},{"name":"Bo","age":25}]'></textarea>
      <button class="btn" id="go">Convert to CSV</button> ${copyBtn()} <button class="btn small secondary" id="dl">⬇ Download</button>
      <div class="output-box" id="out"></div>`;
    const out = m.querySelector("#out");
    m.querySelector("#go").addEventListener("click", () => {
      try { const arr = JSON.parse(m.querySelector("#in").value); if(!Array.isArray(arr)) throw 0;
        const keys = [...new Set(arr.flatMap(o=>Object.keys(o)))];
        const rows = arr.map(o=>keys.map(k=>{ let v=o[k]??""; v=String(v); return /[",\n]/.test(v)?'"'+v.replace(/"/g,'""')+'"':v; }).join(","));
        out.textContent = [keys.join(","), ...rows].join("\n"); out.className="output-box";
      } catch { out.textContent="❌ Provide a valid JSON array of objects."; out.className="output-box result-err"; }
    });
    m.querySelector("#dl").addEventListener("click",()=>download("data.csv", out.textContent, "text/csv"));
    wireCopy(m, () => out.textContent);
  };

  IMPL["csv-to-json"] = (m) => {
    m.innerHTML = `<label>CSV (first row = headers)</label><textarea id="in" placeholder="name,age\nAl,30\nBo,25"></textarea>
      <button class="btn" id="go">Convert to JSON</button> ${copyBtn()}
      <div class="output-box" id="out"></div>`;
    const out = m.querySelector("#out");
    m.querySelector("#go").addEventListener("click", () => {
      const lines = m.querySelector("#in").value.trim().split("\n");
      if (lines.length<2){ out.textContent="Need headers + at least one row."; return; }
      const parse = (l)=>{ const r=[]; let cur="",q=false; for(const c of l){ if(c==='"') q=!q; else if(c===","&&!q){r.push(cur);cur="";} else cur+=c; } r.push(cur); return r.map(x=>x.trim()); };
      const headers = parse(lines[0]);
      const data = lines.slice(1).map(l=>{ const cells=parse(l); const o={}; headers.forEach((h,i)=>o[h]=cells[i]??""); return o; });
      out.textContent = JSON.stringify(data,null,2);
    });
    wireCopy(m, () => out.textContent);
  };

  IMPL["number-base"] = (m) => {
    m.innerHTML = `<div class="row"><div><label>Value</label><input type="text" id="v" value="255"></div>
      <div><label>From base</label><select id="from"><option>2</option><option>8</option><option selected>10</option><option>16</option></select></div></div>
      <div class="stat-grid" style="margin-top:14px">
        <div class="stat-box"><b id="b2" style="font-size:15px">-</b><span>Binary</span></div>
        <div class="stat-box"><b id="b8" style="font-size:15px">-</b><span>Octal</span></div>
        <div class="stat-box"><b id="b10" style="font-size:15px">-</b><span>Decimal</span></div>
        <div class="stat-box"><b id="b16" style="font-size:15px">-</b><span>Hex</span></div>
      </div>`;
    const upd = () => { const n = parseInt(m.querySelector("#v").value, +m.querySelector("#from").value);
      const ok = !isNaN(n);
      m.querySelector("#b2").textContent = ok?n.toString(2):"—";
      m.querySelector("#b8").textContent = ok?n.toString(8):"—";
      m.querySelector("#b10").textContent = ok?n.toString(10):"—";
      m.querySelector("#b16").textContent = ok?n.toString(16).toUpperCase():"—"; };
    m.querySelector("#v").addEventListener("input",upd); m.querySelector("#from").addEventListener("change",upd); upd();
  };

  IMPL["unit-converter"] = (m) => {
    const units = {
      Length: { Meter:1, Kilometer:1000, Centimeter:0.01, Mile:1609.34, Yard:0.9144, Foot:0.3048, Inch:0.0254 },
      Weight: { Kilogram:1, Gram:0.001, Pound:0.453592, Ounce:0.0283495, Ton:1000 },
      Temperature: "temp",
      Area: { "Sq Meter":1, "Sq Km":1e6, "Sq Foot":0.092903, Acre:4046.86, Hectare:10000 },
      "Data": { Byte:1, KB:1024, MB:1048576, GB:1073741824, TB:1099511627776 }
    };
    m.innerHTML = `<div class="row"><div><label>Category</label><select id="cat">${Object.keys(units).map(k=>`<option>${k}</option>`).join("")}</select></div></div>
      <div class="row" style="margin-top:10px"><div><label>From</label><input type="number" id="fv" value="1"><select id="fu"></select></div>
      <div><label>To</label><input type="number" id="tv" readonly><select id="tu"></select></div></div>`;
    const cat=m.querySelector("#cat"), fu=m.querySelector("#fu"), tu=m.querySelector("#tu"), fv=m.querySelector("#fv"), tv=m.querySelector("#tv");
    function fill(){ const u=units[cat.value]; let keys = u==="temp"?["Celsius","Fahrenheit","Kelvin"]:Object.keys(u);
      fu.innerHTML=tu.innerHTML=keys.map(k=>`<option>${k}</option>`).join(""); tu.selectedIndex=Math.min(1,keys.length-1); conv(); }
    function conv(){ const u=units[cat.value], x=parseFloat(fv.value)||0;
      if(u==="temp"){ let c; const f=fu.value; c=f==="Celsius"?x:f==="Fahrenheit"?(x-32)*5/9:x-273.15;
        const t=tu.value; tv.value=(t==="Celsius"?c:t==="Fahrenheit"?c*9/5+32:c+273.15).toFixed(4); }
      else tv.value=(x*u[fu.value]/u[tu.value]).toPrecision(8).replace(/\.?0+$/,""); }
    cat.addEventListener("change",fill); [fv,fu,tu].forEach(e=>e.addEventListener("input",conv)); fill();
  };

  IMPL["color-converter"] = (m) => {
    m.innerHTML = `<label>Pick or type a color</label><div class="row">
      <input type="color" id="cp" value="#4f46e5" style="height:48px">
      <input type="text" id="hex" value="#4f46e5"></div>
      <div class="stat-grid" style="margin-top:14px">
        <div class="stat-box"><b id="rHex" style="font-size:15px">-</b><span>HEX</span></div>
        <div class="stat-box"><b id="rRgb" style="font-size:13px">-</b><span>RGB</span></div>
        <div class="stat-box"><b id="rHsl" style="font-size:13px">-</b><span>HSL</span></div>
      </div>`;
    const cp=m.querySelector("#cp"), hex=m.querySelector("#hex");
    function fromHex(h){ h=h.replace("#",""); if(h.length===3) h=h.split("").map(c=>c+c).join(""); const n=parseInt(h,16); return [n>>16&255,n>>8&255,n&255]; }
    function toHsl(r,g,b){ r/=255;g/=255;b/=255; const mx=Math.max(r,g,b),mn=Math.min(r,g,b); let h,s,l=(mx+mn)/2;
      if(mx===mn){h=s=0;}else{const d=mx-mn; s=l>.5?d/(2-mx-mn):d/(mx+mn); h=mx===r?(g-b)/d+(g<b?6:0):mx===g?(b-r)/d+2:(r-g)/d+4; h/=6;}
      return [Math.round(h*360),Math.round(s*100),Math.round(l*100)]; }
    function upd(h){ if(!/^#?[0-9a-f]{3,6}$/i.test(h)) return; const [r,g,b]=fromHex(h); const [hh,s,l]=toHsl(r,g,b);
      m.querySelector("#rHex").textContent="#"+((1<<24)+(r<<16)+(g<<8)+b).toString(16).slice(1).toUpperCase();
      m.querySelector("#rRgb").textContent=`rgb(${r}, ${g}, ${b})`;
      m.querySelector("#rHsl").textContent=`hsl(${hh}, ${s}%, ${l}%)`; }
    cp.addEventListener("input",()=>{hex.value=cp.value; upd(cp.value);});
    hex.addEventListener("input",()=>{ if(/^#?[0-9a-f]{6}$/i.test(hex.value)) cp.value=hex.value.startsWith("#")?hex.value:"#"+hex.value; upd(hex.value); });
    upd(hex.value);
  };

  IMPL["timestamp-converter"] = (m) => { // Timestamp converter
    m.innerHTML = `<label>Unix timestamp (seconds or ms)</label><div class="row"><input type="text" id="ts"><button class="btn small" id="now">Now</button></div>
      <div class="output-box" id="o1"></div>
      <label style="margin-top:14px">Human date → timestamp</label><input type="datetime-local" id="dt">
      <div class="output-box" id="o2"></div>`;
    const conv=()=>{ let v=m.querySelector("#ts").value.trim(); if(!v) return; let n=+v; if(v.length<=10) n*=1000;
      const d=new Date(n); m.querySelector("#o1").textContent = isNaN(d)?"Invalid":d.toString()+"\nUTC: "+d.toUTCString(); };
    m.querySelector("#ts").addEventListener("input",conv);
    m.querySelector("#now").addEventListener("click",()=>{ m.querySelector("#ts").value=Date.now(); conv(); });
    m.querySelector("#dt").addEventListener("input",e=>{ const t=new Date(e.target.value).getTime();
      m.querySelector("#o2").textContent = isNaN(t)?"":"Seconds: "+Math.floor(t/1000)+"\nMillis: "+t; });
  };
})();

/* ================= GENERATORS + CALCULATORS ================= */
(function () {
  const IMPL = window.TOOL_IMPL;
  const esc = (s) => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const copyBtn = () => `<button class="btn secondary small" data-copy="1">📋 Copy</button>`;
  function wireCopy(m, getText) { const b = m.querySelector('[data-copy]'); if (b) b.addEventListener("click", async () => { try { await navigator.clipboard.writeText(getText()); b.textContent="✅ Copied"; setTimeout(()=>b.textContent="📋 Copy",1200);}catch{b.textContent="Ctrl+C";} }); }

  IMPL["password-generator"] = (m) => {
    m.innerHTML = `<div class="row"><div><label>Length: <span id="ln">16</span></label><input type="range" id="len" min="4" max="64" value="16"></div></div>
      <div class="checkbox-row"><input type="checkbox" id="up" checked><label for="up">Uppercase</label></div>
      <div class="checkbox-row"><input type="checkbox" id="lo" checked><label for="lo">Lowercase</label></div>
      <div class="checkbox-row"><input type="checkbox" id="nu" checked><label for="nu">Numbers</label></div>
      <div class="checkbox-row"><input type="checkbox" id="sy" checked><label for="sy">Symbols</label></div>
      <button class="btn" id="go">Generate</button> ${copyBtn()}
      <div class="output-box" id="out" style="font-size:18px"></div>`;
    const gen = () => {
      let set=""; if(m.querySelector("#up").checked) set+="ABCDEFGHJKLMNPQRSTUVWXYZ";
      if(m.querySelector("#lo").checked) set+="abcdefghijkmnopqrstuvwxyz"; if(m.querySelector("#nu").checked) set+="23456789";
      if(m.querySelector("#sy").checked) set+="!@#$%^&*()-_=+[]{}"; if(!set){ m.querySelector("#out").textContent="Select at least one option."; return; }
      const len=+m.querySelector("#len").value, arr=new Uint32Array(len); crypto.getRandomValues(arr);
      m.querySelector("#out").textContent=[...arr].map(x=>set[x%set.length]).join("");
    };
    m.querySelector("#len").addEventListener("input",e=>{m.querySelector("#ln").textContent=e.target.value;gen();});
    m.querySelectorAll("input[type=checkbox]").forEach(c=>c.addEventListener("change",gen));
    m.querySelector("#go").addEventListener("click",gen); gen();
    wireCopy(m, () => m.querySelector("#out").textContent);
  };

  IMPL["qr-generator"] = (m) => {
    m.innerHTML = `<label>Text or URL</label><input type="text" id="in" value="https://mastertools.example">
      <div class="row" style="margin-top:8px"><div><label>Size</label><input type="number" id="sz" value="240" min="80" max="1000"></div></div>
      <button class="btn" id="go">Generate QR</button> <button class="btn secondary small" id="dl">⬇ Download PNG</button>
      <div id="qr" style="margin-top:16px"></div>`;
    let qr;
    const gen = () => {
      const box=m.querySelector("#qr"); box.innerHTML="";
      if (typeof QRCode === "undefined") { box.innerHTML='<p class="result-err">QR library still loading, click again in a second.</p>'; return; }
      qr = new QRCode(box, { text: m.querySelector("#in").value || " ", width:+m.querySelector("#sz").value, height:+m.querySelector("#sz").value });
    };
    m.querySelector("#go").addEventListener("click",gen);
    m.querySelector("#dl").addEventListener("click",()=>{ const img=m.querySelector("#qr img")||m.querySelector("#qr canvas");
      if(!img){alert("Generate a QR first.");return;} const a=document.createElement("a");
      a.href=img.src||img.toDataURL("image/png"); a.download="qrcode.png"; a.click(); });
    gen();
  };

  IMPL["uuid-generator"] = (m) => {
    m.innerHTML = `<div class="row"><div><label>How many</label><input type="number" id="n" value="5" min="1" max="500"></div></div>
      <button class="btn" id="go">Generate</button> ${copyBtn()}
      <div class="output-box" id="out"></div>`;
    const gen=()=>{ const n=+m.querySelector("#n").value, arr=[]; for(let i=0;i<n;i++) arr.push(crypto.randomUUID());
      m.querySelector("#out").textContent=arr.join("\n"); };
    m.querySelector("#go").addEventListener("click",gen); gen();
    wireCopy(m, () => m.querySelector("#out").textContent);
  };

  IMPL["random-number"] = (m) => {
    m.innerHTML = `<div class="row"><div><label>Min</label><input type="number" id="min" value="1"></div>
      <div><label>Max</label><input type="number" id="max" value="100"></div>
      <div><label>Count</label><input type="number" id="cnt" value="1" min="1" max="1000"></div></div>
      <div class="checkbox-row"><input type="checkbox" id="uniq"><label for="uniq">Unique values only</label></div>
      <button class="btn" id="go">Generate</button> ${copyBtn()}
      <div class="output-box" id="out" style="font-size:18px"></div>`;
    m.querySelector("#go").addEventListener("click",()=>{
      let min=+m.querySelector("#min").value,max=+m.querySelector("#max").value,cnt=+m.querySelector("#cnt").value;
      if(min>max)[min,max]=[max,min]; const uniq=m.querySelector("#uniq").checked; const res=[];
      if(uniq){ const pool=[]; for(let i=min;i<=max;i++)pool.push(i); for(let i=pool.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[pool[i],pool[j]]=[pool[j],pool[i]];} res.push(...pool.slice(0,cnt)); }
      else for(let i=0;i<cnt;i++) res.push(Math.floor(Math.random()*(max-min+1))+min);
      m.querySelector("#out").textContent=res.join(", ");
    });
    wireCopy(m, () => m.querySelector("#out").textContent);
  };

  IMPL["hash-generator"] = (m) => {
    m.innerHTML = `<label>Text to hash</label><textarea id="in"></textarea>
      <div class="row"><div><label>Algorithm</label><select id="alg"><option>SHA-1</option><option selected>SHA-256</option><option>SHA-384</option><option>SHA-512</option></select></div></div>
      <button class="btn" id="go">Hash</button> ${copyBtn()}
      <div class="output-box" id="out"></div>`;
    m.querySelector("#go").addEventListener("click", async () => {
      const enc=new TextEncoder().encode(m.querySelector("#in").value);
      const buf=await crypto.subtle.digest(m.querySelector("#alg").value, enc);
      m.querySelector("#out").textContent=[...new Uint8Array(buf)].map(b=>b.toString(16).padStart(2,"0")).join("");
    });
    wireCopy(m, () => m.querySelector("#out").textContent);
  };

  IMPL["password-strength"] = (m) => {
    m.innerHTML = `<label>Password to test</label><input type="text" id="in" placeholder="Type a password...">
      <div class="output-box" id="out">Strength appears here.</div>`;
    m.querySelector("#in").addEventListener("input", e => {
      const p=e.target.value; let s=0; const notes=[];
      if(p.length>=8)s++; else notes.push("use 8+ characters");
      if(p.length>=12)s++; if(/[A-Z]/.test(p))s++; else notes.push("add uppercase");
      if(/[0-9]/.test(p))s++; else notes.push("add numbers");
      if(/[^A-Za-z0-9]/.test(p))s++; else notes.push("add symbols");
      const labels=["Very weak","Weak","Fair","Good","Strong","Very strong"];
      const out=m.querySelector("#out");
      out.innerHTML = p?`<b>${labels[s]}</b> (${s}/5)${notes.length?"<br>Tips: "+notes.join(", "):" — 🔒 excellent!"}`:"Strength appears here.";
      out.className="output-box "+(s>=4?"result-ok":s<=1?"result-err":"");
    });
  };

  IMPL["fancy-text"] = (m) => {
    const styles = {
      "𝗕𝗼𝗹𝗱": [0x1D5D4,0x1D5EE,0x1D7EC], "𝑰𝒕𝒂𝒍𝒊𝒄":[0x1D608,0x1D622,null], "𝕯𝖔𝖚𝖇𝖑𝖊":[0x1D538,0x1D552,0x1D7D8],
      "𝓼𝓬𝓻𝓲𝓹𝓽":[0x1D4D0,0x1D4EA,null], "Ⓒⓘⓡⓒⓛⓔ":[0x24B6,0x24D0,0x2460]
    };
    m.innerHTML = `<label>Your text</label><input type="text" id="in" value="Hello">
      <div id="out" style="margin-top:12px"></div>`;
    const conv=(txt,[U,L,N])=>[...txt].map(ch=>{ const c=ch.codePointAt(0);
      if(ch>="A"&&ch<="Z") return String.fromCodePoint(U+(c-65));
      if(ch>="a"&&ch<="z"&&L) return String.fromCodePoint(L+(c-97));
      if(ch>="0"&&ch<="9"&&N) return String.fromCodePoint(N+(c-48)); return ch; }).join("");
    const upd=()=>{ const txt=m.querySelector("#in").value;
      m.querySelector("#out").innerHTML=Object.entries(styles).map(([n,s])=>{ const r=conv(txt,s);
        return `<div class="output-box" style="font-size:18px;cursor:pointer" title="Click to copy" data-t="${esc(r)}">${esc(r)}</div>`; }).join("");
      m.querySelectorAll("[data-t]").forEach(d=>d.addEventListener("click",()=>navigator.clipboard.writeText(d.dataset.t))); };
    m.querySelector("#in").addEventListener("input",upd); upd();
  };

  /* -------- Calculators -------- */
  function calcTool(m, html, compute) { m.innerHTML = html + `<button class="btn" id="go">Calculate</button><div class="output-box" id="out"></div>`;
    const run=()=>compute(m, m.querySelector("#out")); m.querySelector("#go").addEventListener("click",run);
    m.querySelectorAll("input,select").forEach(e=>e.addEventListener("input",run)); run(); }
  const val = (m,id)=>parseFloat(m.querySelector("#"+id).value)||0;

  IMPL["percentage-calc"] = (m) => calcTool(m,
    `<div class="row"><div><label>X</label><input type="number" id="x" value="25"></div>
     <div><label>% of Y</label><input type="number" id="y" value="200"></div></div>`,
    (m,o)=>{ o.innerHTML=`<b>${val(m,"x")}%</b> of <b>${val(m,"y")}</b> = <b class="result-ok">${(val(m,"x")/100*val(m,"y")).toLocaleString()}</b><br>
      ${val(m,"x")} is <b>${val(m,"y")?(val(m,"x")/val(m,"y")*100).toFixed(2):0}%</b> of ${val(m,"y")}`; });

  IMPL["bmi-calc"] = (m) => calcTool(m,
    `<div class="row"><div><label>Weight (kg)</label><input type="number" id="w" value="70"></div>
     <div><label>Height (cm)</label><input type="number" id="h" value="175"></div></div>`,
    (m,o)=>{ const h=val(m,"h")/100; const bmi=h?val(m,"w")/(h*h):0; const cat=bmi<18.5?"Underweight":bmi<25?"Normal":bmi<30?"Overweight":"Obese";
      o.innerHTML=`Your BMI: <b class="result-ok">${bmi.toFixed(1)}</b> — <b>${cat}</b>`; });

  IMPL["age-calc"] = (m) => calcTool(m,
    `<label>Date of birth</label><input type="date" id="dob">`,
    (m,o)=>{ const d=new Date(m.querySelector("#dob").value); if(isNaN(d)){o.textContent="Pick a date.";return;}
      const now=new Date(); let y=now.getFullYear()-d.getFullYear(),mo=now.getMonth()-d.getMonth(),da=now.getDate()-d.getDate();
      if(da<0){mo--;da+=new Date(now.getFullYear(),now.getMonth(),0).getDate();} if(mo<0){y--;mo+=12;}
      const days=Math.floor((now-d)/864e5); o.innerHTML=`<b class="result-ok">${y}</b> years, <b>${mo}</b> months, <b>${da}</b> days<br>= ${days.toLocaleString()} days total`; });

  IMPL["loan-calc"] = (m) => calcTool(m,
    `<div class="row"><div><label>Amount</label><input type="number" id="p" value="20000"></div>
     <div><label>Annual %</label><input type="number" id="r" value="7.5"></div>
     <div><label>Years</label><input type="number" id="n" value="5"></div></div>`,
    (m,o)=>{ const P=val(m,"p"),r=val(m,"r")/1200,n=val(m,"n")*12;
      const emi=r? P*r*Math.pow(1+r,n)/(Math.pow(1+r,n)-1) : P/n; const tot=emi*n;
      o.innerHTML=`Monthly payment: <b class="result-ok">${emi.toFixed(2)}</b><br>Total paid: <b>${tot.toFixed(2)}</b><br>Total interest: <b>${(tot-P).toFixed(2)}</b>`; });

  IMPL["tip-calc"] = (m) => calcTool(m,
    `<div class="row"><div><label>Bill</label><input type="number" id="b" value="50"></div>
     <div><label>Tip %</label><input type="number" id="t" value="15"></div>
     <div><label>Split</label><input type="number" id="s" value="1" min="1"></div></div>`,
    (m,o)=>{ const tip=val(m,"b")*val(m,"t")/100, total=val(m,"b")+tip, s=Math.max(1,val(m,"s"));
      o.innerHTML=`Tip: <b>${tip.toFixed(2)}</b> • Total: <b class="result-ok">${total.toFixed(2)}</b><br>Per person: <b>${(total/s).toFixed(2)}</b>`; });

  IMPL["discount-calc"] = (m) => calcTool(m,
    `<div class="row"><div><label>Price</label><input type="number" id="p" value="120"></div>
     <div><label>Discount %</label><input type="number" id="d" value="25"></div></div>`,
    (m,o)=>{ const save=val(m,"p")*val(m,"d")/100; o.innerHTML=`You save <b>${save.toFixed(2)}</b><br>Final price: <b class="result-ok">${(val(m,"p")-save).toFixed(2)}</b>`; });

  IMPL["compound-interest"] = (m) => calcTool(m,
    `<div class="row"><div><label>Principal</label><input type="number" id="p" value="1000"></div>
     <div><label>Annual %</label><input type="number" id="r" value="8"></div>
     <div><label>Years</label><input type="number" id="y" value="10"></div>
     <div><label>Compounds/yr</label><input type="number" id="n" value="12"></div></div>`,
    (m,o)=>{ const P=val(m,"p"),r=val(m,"r")/100,n=val(m,"n"),t=val(m,"y");
      const A=P*Math.pow(1+r/n,n*t); o.innerHTML=`Future value: <b class="result-ok">${A.toFixed(2)}</b><br>Interest earned: <b>${(A-P).toFixed(2)}</b>`; });

  IMPL["date-diff"] = (m) => calcTool(m,
    `<div class="row"><div><label>From</label><input type="date" id="a"></div><div><label>To</label><input type="date" id="b"></div></div>`,
    (m,o)=>{ const a=new Date(m.querySelector("#a").value),b=new Date(m.querySelector("#b").value);
      if(isNaN(a)||isNaN(b)){o.textContent="Pick both dates.";return;} const d=Math.abs(b-a)/864e5;
      o.innerHTML=`<b class="result-ok">${Math.round(d)}</b> days<br>= ${(d/7).toFixed(1)} weeks • ${(d/30.44).toFixed(1)} months • ${(d/365.25).toFixed(2)} years`; });
})();

/* ================= IMAGE + COLOR + EVERYDAY + VIDEO ================= */
(function () {
  const IMPL = window.TOOL_IMPL;
  const esc = (s) => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const copyBtn = () => `<button class="btn secondary small" data-copy="1">📋 Copy</button>`;
  function wireCopy(m, getText){ const b=m.querySelector('[data-copy]'); if(b) b.addEventListener("click",async()=>{try{await navigator.clipboard.writeText(getText());b.textContent="✅ Copied";setTimeout(()=>b.textContent="📋 Copy",1200);}catch{b.textContent="Ctrl+C";}}); }
  function download(name, blobOrStr, type){ const blob=blobOrStr instanceof Blob?blobOrStr:new Blob([blobOrStr],{type}); const a=document.createElement("a"); a.href=URL.createObjectURL(blob); a.download=name; a.click(); setTimeout(()=>URL.revokeObjectURL(a.href),2000); }
  function dropzone(m, onFile, accept){
    const dz=m.querySelector(".dropzone"), inp=m.querySelector("input[type=file]");
    dz.addEventListener("click",()=>inp.click());
    dz.addEventListener("dragover",e=>{e.preventDefault();dz.classList.add("drag");});
    dz.addEventListener("dragleave",()=>dz.classList.remove("drag"));
    dz.addEventListener("drop",e=>{e.preventDefault();dz.classList.remove("drag"); if(e.dataTransfer.files[0]) onFile(e.dataTransfer.files[0]);});
    inp.addEventListener("change",e=>{ if(e.target.files[0]) onFile(e.target.files[0]); });
  }
  function loadImage(file){ return new Promise((res,rej)=>{ const img=new Image(); img.onload=()=>res(img); img.onerror=rej; img.src=URL.createObjectURL(file); }); }

  IMPL["image-compressor"] = (m) => {
    m.innerHTML = `<div class="dropzone">📁 Drop an image or click to upload<input type="file" accept="image/*" hidden></div>
      <label style="margin-top:14px">Quality: <span id="qv">80</span>%</label><input type="range" id="q" min="10" max="100" value="80">
      <div id="res"></div>`;
    let file;
    const process = async () => { if(!file) return; const img=await loadImage(file);
      const c=document.createElement("canvas"); c.width=img.width; c.height=img.height; c.getContext("2d").drawImage(img,0,0);
      c.toBlob(b=>{ const res=m.querySelector("#res"); res.innerHTML=`<img class="preview" src="${URL.createObjectURL(b)}">
        <p class="hint">Original: ${(file.size/1024).toFixed(1)} KB → Compressed: <b class="result-ok">${(b.size/1024).toFixed(1)} KB</b> (${(100-b.size/file.size*100).toFixed(0)}% smaller)</p>
        <button class="btn" id="dl">⬇ Download</button>`;
        res.querySelector("#dl").addEventListener("click",()=>download("compressed.jpg",b)); }, "image/jpeg", +m.querySelector("#q").value/100); };
    dropzone(m, f=>{file=f; process();});
    m.querySelector("#q").addEventListener("input",e=>{m.querySelector("#qv").textContent=e.target.value; process();});
  };

  IMPL["image-resizer"] = (m) => {
    m.innerHTML = `<div class="dropzone">📁 Drop an image or click to upload<input type="file" accept="image/*" hidden></div>
      <div class="row" style="margin-top:12px"><div><label>Width</label><input type="number" id="w"></div>
      <div><label>Height</label><input type="number" id="h"></div></div>
      <div class="checkbox-row"><input type="checkbox" id="lock" checked><label for="lock">Keep aspect ratio</label></div>
      <button class="btn" id="go">Resize & Download</button><div id="res"></div>`;
    let img, ratio=1;
    dropzone(m, async f=>{ img=await loadImage(f); ratio=img.width/img.height;
      m.querySelector("#w").value=img.width; m.querySelector("#h").value=img.height;
      m.querySelector("#res").innerHTML=`<img class="preview" src="${img.src}" style="max-height:200px">`; });
    m.querySelector("#w").addEventListener("input",e=>{ if(m.querySelector("#lock").checked&&img) m.querySelector("#h").value=Math.round(e.target.value/ratio); });
    m.querySelector("#h").addEventListener("input",e=>{ if(m.querySelector("#lock").checked&&img) m.querySelector("#w").value=Math.round(e.target.value*ratio); });
    m.querySelector("#go").addEventListener("click",()=>{ if(!img)return alert("Upload an image first.");
      const c=document.createElement("canvas"); c.width=+m.querySelector("#w").value; c.height=+m.querySelector("#h").value;
      c.getContext("2d").drawImage(img,0,0,c.width,c.height); c.toBlob(b=>download("resized.png",b)); });
  };

  IMPL["image-converter"] = (m) => {
    m.innerHTML = `<div class="dropzone">📁 Drop an image or click to upload<input type="file" accept="image/*" hidden></div>
      <div class="row" style="margin-top:12px"><div><label>Convert to</label><select id="fmt"><option value="image/png">PNG</option><option value="image/jpeg">JPG</option><option value="image/webp">WebP</option></select></div></div>
      <button class="btn" id="go">Convert & Download</button><div id="res"></div>`;
    let img;
    dropzone(m, async f=>{ img=await loadImage(f); m.querySelector("#res").innerHTML=`<img class="preview" src="${img.src}" style="max-height:200px">`; });
    m.querySelector("#go").addEventListener("click",()=>{ if(!img)return alert("Upload an image first.");
      const c=document.createElement("canvas"); c.width=img.width; c.height=img.height; c.getContext("2d").drawImage(img,0,0);
      const fmt=m.querySelector("#fmt").value, ext=fmt.split("/")[1]; c.toBlob(b=>download("converted."+ext,b),fmt,0.92); });
  };

  IMPL["image-to-base64"] = (m) => {
    m.innerHTML = `<div class="dropzone">📁 Drop an image or click to upload<input type="file" accept="image/*" hidden></div>
      <label style="margin-top:12px">Base64 Data URI ${copyBtn()}</label><div class="output-box" id="out" style="max-height:200px;overflow:auto"></div>`;
    dropzone(m, f=>{ const r=new FileReader(); r.onload=()=>m.querySelector("#out").textContent=r.result; r.readAsDataURL(f); });
    wireCopy(m, () => m.querySelector("#out").textContent);
  };

  IMPL["favicon-generator"] = (m) => {
    m.innerHTML = `<div class="dropzone">📁 Drop a square image<input type="file" accept="image/*" hidden></div>
      <div id="res"></div>`;
    dropzone(m, async f=>{ const img=await loadImage(f); const res=m.querySelector("#res"); res.innerHTML="";
      [16,32,48,180,192,512].forEach(sz=>{ const c=document.createElement("canvas"); c.width=c.height=sz; c.getContext("2d").drawImage(img,0,0,sz,sz);
        c.toBlob(b=>{ const wrap=document.createElement("span"); wrap.style.margin="6px"; wrap.style.display="inline-block";
          wrap.innerHTML=`<img src="${URL.createObjectURL(b)}" style="border:1px solid var(--border)"><br><button class="btn small secondary">${sz}×${sz} ⬇</button>`;
          wrap.querySelector("button").addEventListener("click",()=>download(`favicon-${sz}.png`,b)); res.appendChild(wrap); }); }); });
  };

  IMPL["color-from-image"] = (m) => {
    m.innerHTML = `<div class="dropzone">📁 Drop an image, then click it to pick colors<input type="file" accept="image/*" hidden></div>
      <canvas id="cv" style="max-width:100%;margin-top:12px;border-radius:10px;cursor:crosshair;display:none"></canvas>
      <div class="output-box" id="out">Upload then click on the image.</div>`;
    const cv=m.querySelector("#cv"), ctx=cv.getContext("2d");
    dropzone(m, async f=>{ const img=await loadImage(f); const scale=Math.min(1,600/img.width); cv.width=img.width*scale; cv.height=img.height*scale;
      ctx.drawImage(img,0,0,cv.width,cv.height); cv.style.display="block"; });
    cv.addEventListener("click",e=>{ const r=cv.getBoundingClientRect(); const x=(e.clientX-r.left)*cv.width/r.width, y=(e.clientY-r.top)*cv.height/r.height;
      const [rr,g,b]=ctx.getImageData(x,y,1,1).data; const hex="#"+[rr,g,b].map(v=>v.toString(16).padStart(2,"0")).join("").toUpperCase();
      m.querySelector("#out").innerHTML=`<span style="display:inline-block;width:24px;height:24px;background:${hex};border-radius:5px;vertical-align:middle"></span> <b>${hex}</b> • rgb(${rr}, ${g}, ${b})`; });
  };

  IMPL["meme-generator"] = (m) => {
    m.innerHTML = `<div class="dropzone">📁 Drop an image<input type="file" accept="image/*" hidden></div>
      <div class="row" style="margin-top:10px"><input type="text" id="top" placeholder="TOP TEXT"><input type="text" id="bot" placeholder="BOTTOM TEXT"></div>
      <canvas id="cv" style="max-width:100%;margin-top:12px;border-radius:10px;display:none"></canvas><br>
      <button class="btn" id="dl" style="display:none">⬇ Download Meme</button>`;
    let img; const cv=m.querySelector("#cv"), ctx=cv.getContext("2d");
    const draw=()=>{ if(!img)return; cv.width=img.width; cv.height=img.height; ctx.drawImage(img,0,0);
      const fs=img.width/10; ctx.font=`bold ${fs}px Impact, sans-serif`; ctx.textAlign="center"; ctx.lineWidth=fs/12; ctx.strokeStyle="#000"; ctx.fillStyle="#fff";
      const t=m.querySelector("#top").value.toUpperCase(), b=m.querySelector("#bot").value.toUpperCase();
      ctx.textBaseline="top"; ctx.strokeText(t,cv.width/2,10); ctx.fillText(t,cv.width/2,10);
      ctx.textBaseline="bottom"; ctx.strokeText(b,cv.width/2,cv.height-10); ctx.fillText(b,cv.width/2,cv.height-10); };
    dropzone(m, async f=>{ img=await loadImage(f); cv.style.display="block"; m.querySelector("#dl").style.display="inline-flex"; draw(); });
    m.querySelector("#top").addEventListener("input",draw); m.querySelector("#bot").addEventListener("input",draw);
    m.querySelector("#dl").addEventListener("click",()=>cv.toBlob(b=>download("meme.png",b)));
  };

  /* -------- Color/Design -------- */
  IMPL["color-picker"] = (m) => IMPL["color-converter"](m);

  IMPL["gradient-generator"] = (m) => {
    m.innerHTML = `<div class="row"><input type="color" id="c1" value="#4f46e5"><input type="color" id="c2" value="#7c3aed">
      <div><label>Angle</label><input type="number" id="a" value="90"></div></div>
      <div id="prev" style="height:120px;border-radius:12px;margin-top:12px"></div>
      <label style="margin-top:12px">CSS ${copyBtn()}</label><div class="output-box" id="out"></div>`;
    const upd=()=>{ const css=`linear-gradient(${m.querySelector("#a").value}deg, ${m.querySelector("#c1").value}, ${m.querySelector("#c2").value})`;
      m.querySelector("#prev").style.background=css; m.querySelector("#out").textContent="background: "+css+";"; };
    m.querySelectorAll("input").forEach(i=>i.addEventListener("input",upd)); upd();
    wireCopy(m, () => m.querySelector("#out").textContent);
  };

  IMPL["contrast-checker"] = (m) => {
    m.innerHTML = `<div class="row"><div><label>Foreground</label><input type="color" id="fg" value="#333333"></div>
      <div><label>Background</label><input type="color" id="bg" value="#ffffff"></div></div>
      <div id="prev" style="padding:20px;border-radius:10px;margin-top:12px;text-align:center;font-size:18px">Sample text 123</div>
      <div class="output-box" id="out"></div>`;
    const lum=h=>{ const c=[1,3,5].map(i=>parseInt(h.substr(i,2),16)/255).map(v=>v<=.03928?v/12.92:((v+.055)/1.055)**2.4); return .2126*c[0]+.7152*c[1]+.0722*c[2]; };
    const upd=()=>{ const fg=m.querySelector("#fg").value,bg=m.querySelector("#bg").value;
      const ratio=(Math.max(lum(fg),lum(bg))+.05)/(Math.min(lum(fg),lum(bg))+.05);
      const p=m.querySelector("#prev"); p.style.color=fg; p.style.background=bg;
      m.querySelector("#out").innerHTML=`Contrast ratio: <b>${ratio.toFixed(2)}:1</b><br>
        AA normal: ${ratio>=4.5?'<span class="result-ok">Pass</span>':'<span class="result-err">Fail</span>'} •
        AAA normal: ${ratio>=7?'<span class="result-ok">Pass</span>':'<span class="result-err">Fail</span>'}`; };
    m.querySelectorAll("input").forEach(i=>i.addEventListener("input",upd)); upd();
  };

  IMPL["palette-generator"] = (m) => {
    m.innerHTML = `<button class="btn" id="go">🎲 Generate palette</button><div id="pal" class="cat-grid" style="margin-top:14px"></div>`;
    const gen=()=>{ m.querySelector("#pal").innerHTML=Array(5).fill(0).map(()=>{ const h="#"+Math.floor(Math.random()*16777215).toString(16).padStart(6,"0").toUpperCase();
      return `<div class="tool-card" style="cursor:pointer" data-h="${h}"><div style="height:60px;background:${h};border-radius:8px"></div><div class="tc-name">${h}</div></div>`; }).join("");
      m.querySelectorAll("[data-h]").forEach(d=>d.addEventListener("click",()=>navigator.clipboard.writeText(d.dataset.h))); };
    m.querySelector("#go").addEventListener("click",gen); gen();
  };

  IMPL["shadow-generator"] = (m) => {
    m.innerHTML = `<div class="row"><div><label>X</label><input type="number" id="x" value="0"></div><div><label>Y</label><input type="number" id="y" value="8"></div>
      <div><label>Blur</label><input type="number" id="bl" value="20"></div><div><label>Spread</label><input type="number" id="sp" value="0"></div>
      <input type="color" id="col" value="#000000"></div>
      <label>Opacity: <span id="ov">20</span>%</label><input type="range" id="op" min="0" max="100" value="20">
      <div style="text-align:center;padding:30px"><div id="box" style="width:120px;height:120px;background:var(--surface);border-radius:12px;margin:0 auto"></div></div>
      <label>CSS ${copyBtn()}</label><div class="output-box" id="out"></div>`;
    const upd=()=>{ const c=m.querySelector("#col").value, op=+m.querySelector("#op").value/100;
      const rgba=`rgba(${parseInt(c.substr(1,2),16)},${parseInt(c.substr(3,2),16)},${parseInt(c.substr(5,2),16)},${op})`;
      const css=`${m.querySelector("#x").value}px ${m.querySelector("#y").value}px ${m.querySelector("#bl").value}px ${m.querySelector("#sp").value}px ${rgba}`;
      m.querySelector("#box").style.boxShadow=css; m.querySelector("#ov").textContent=m.querySelector("#op").value;
      m.querySelector("#out").textContent="box-shadow: "+css+";"; };
    m.querySelectorAll("input").forEach(i=>i.addEventListener("input",upd)); upd();
    wireCopy(m, () => m.querySelector("#out").textContent);
  };

  /* -------- Everyday -------- */
  IMPL["stopwatch"] = (m) => {
    m.innerHTML = `<div style="text-align:center"><div id="disp" style="font-size:48px;font-family:monospace">00:00:00.0</div>
      <button class="btn" id="s">Start</button><button class="btn secondary" id="r">Reset</button></div>`;
    let t=0, iv=null, running=false;
    const fmt=ms=>{ const h=String(Math.floor(ms/3.6e6)).padStart(2,"0"),mi=String(Math.floor(ms/6e4)%60).padStart(2,"0"),s=String(Math.floor(ms/1e3)%60).padStart(2,"0"),d=Math.floor(ms/100)%10; return `${h}:${mi}:${s}.${d}`; };
    m.querySelector("#s").addEventListener("click",e=>{ if(running){clearInterval(iv);e.target.textContent="Start";}else{const st=Date.now()-t; iv=setInterval(()=>{t=Date.now()-st;m.querySelector("#disp").textContent=fmt(t);},50);e.target.textContent="Pause";} running=!running; });
    m.querySelector("#r").addEventListener("click",()=>{clearInterval(iv);t=0;running=false;m.querySelector("#disp").textContent="00:00:00.0";m.querySelector("#s").textContent="Start";});
  };

  IMPL["notepad"] = (m) => {
    m.innerHTML = `<label>Notes (auto-saved in your browser)</label><textarea id="n" style="min-height:300px"></textarea><p class="hint" id="st"></p>`;
    const t=m.querySelector("#n"); t.value=localStorage.getItem("mt-notepad")||"";
    t.addEventListener("input",()=>{ localStorage.setItem("mt-notepad",t.value); m.querySelector("#st").textContent="Saved ✓ "+new Date().toLocaleTimeString(); });
  };

  IMPL["wheel-picker"] = (m) => {
    m.innerHTML = `<label>Options (one per line)</label><textarea id="opts">Pizza\nBurger\nSushi\nTacos</textarea>
      <button class="btn" id="go">🎡 Pick one</button><div class="output-box" id="out" style="font-size:22px;text-align:center"></div>`;
    m.querySelector("#go").addEventListener("click",()=>{ const o=m.querySelector("#opts").value.split("\n").map(x=>x.trim()).filter(Boolean);
      if(!o.length)return; let i=0,n=20+Math.floor(Math.random()*15); const iv=setInterval(()=>{ m.querySelector("#out").textContent=o[i%o.length]; i++;
        if(i>n){clearInterval(iv);m.querySelector("#out").innerHTML='🎉 <b class="result-ok">'+esc(o[(i-1)%o.length])+'</b>';} },60); });
  };

  IMPL["dice-roller"] = (m) => {
    m.innerHTML = `<div class="row"><div><label>Sides</label><input type="number" id="s" value="6"></div><div><label>Dice</label><input type="number" id="n" value="2"></div></div>
      <button class="btn" id="go">🎲 Roll</button><div class="output-box" id="out" style="font-size:22px;text-align:center"></div>`;
    m.querySelector("#go").addEventListener("click",()=>{ const s=+m.querySelector("#s").value,n=+m.querySelector("#n").value,rolls=[];
      for(let i=0;i<n;i++)rolls.push(Math.floor(Math.random()*s)+1); m.querySelector("#out").innerHTML=`${rolls.join(" + ")} = <b class="result-ok">${rolls.reduce((a,b)=>a+b,0)}</b>`; });
  };

  IMPL["coin-flip"] = (m) => {
    m.innerHTML = `<div style="text-align:center"><button class="btn" id="go">🪙 Flip coin</button><div id="out" style="font-size:40px;margin-top:16px"></div></div>`;
    m.querySelector("#go").addEventListener("click",()=>{ let i=0; const iv=setInterval(()=>{ m.querySelector("#out").textContent=i%2?"🪙 Heads":"🪙 Tails"; i++;
      if(i>10){clearInterval(iv);m.querySelector("#out").innerHTML=(Math.random()<.5?"🪙 <b>Heads</b>":"🪙 <b>Tails</b>");} },80); });
  };

  IMPL["screen-resolution"] = (m) => {
    m.innerHTML = `<div class="stat-grid">
      <div class="stat-box"><b style="font-size:18px">${screen.width}×${screen.height}</b><span>Screen</span></div>
      <div class="stat-box"><b style="font-size:18px">${window.innerWidth}×${window.innerHeight}</b><span>Viewport</span></div>
      <div class="stat-box"><b style="font-size:18px">${window.devicePixelRatio}</b><span>Pixel ratio</span></div>
      <div class="stat-box"><b style="font-size:18px">${screen.colorDepth}-bit</b><span>Color depth</span></div>
      </div><p class="hint">Resize your window — viewport updates on reload.</p>`;
  };

  /* -------- Video -------- */
  IMPL["thumbnail-downloader"] = (m) => {
    m.innerHTML = `<label>YouTube video URL</label><input type="text" id="in" placeholder="https://youtube.com/watch?v=...">
      <button class="btn" id="go">Get thumbnails</button><div id="res"></div>`;
    m.querySelector("#go").addEventListener("click",()=>{ const url=m.querySelector("#in").value;
      const idm=url.match(/(?:v=|youtu\.be\/|shorts\/|embed\/)([\w-]{11})/); if(!idm){m.querySelector("#res").innerHTML='<p class="result-err">Could not find a video ID in that URL.</p>';return;}
      const id=idm[1]; m.querySelector("#res").innerHTML=["maxresdefault","hqdefault","mqdefault"].map(q=>{ const u=`https://img.youtube.com/vi/${id}/${q}.jpg`;
        return `<div style="margin-top:12px"><img class="preview" src="${u}" style="max-height:200px"><br><a class="btn small secondary" href="${u}" target="_blank" download>⬇ ${q}</a></div>`; }).join(""); });
  };
})();

/* ================= DEVELOPER + SEO + PDF ================= */
(function () {
  const IMPL = window.TOOL_IMPL;
  const esc = (s) => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const copyBtn = () => `<button class="btn secondary small" data-copy="1">📋 Copy</button>`;
  function wireCopy(m, getText){ const b=m.querySelector('[data-copy]'); if(b) b.addEventListener("click",async()=>{try{await navigator.clipboard.writeText(getText());b.textContent="✅ Copied";setTimeout(()=>b.textContent="📋 Copy",1200);}catch{b.textContent="Ctrl+C";}}); }
  function download(name, blobOrStr, type){ const blob=blobOrStr instanceof Blob?blobOrStr:new Blob([blobOrStr],{type}); const a=document.createElement("a"); a.href=URL.createObjectURL(blob); a.download=name; a.click(); setTimeout(()=>URL.revokeObjectURL(a.href),2000); }
  const scriptCache={};
  function loadScript(src){ if(scriptCache[src])return scriptCache[src]; scriptCache[src]=new Promise((res,rej)=>{const s=document.createElement("script");s.src=src;s.onload=res;s.onerror=()=>rej(new Error("load fail"));document.head.appendChild(s);}); return scriptCache[src]; }

  IMPL["regex-tester"] = (m) => {
    m.innerHTML = `<div class="row"><div style="flex:3"><label>Pattern</label><input type="text" id="pat" value="\\b\\w+@\\w+\\.\\w+\\b"></div>
      <div><label>Flags</label><input type="text" id="fl" value="g"></div></div>
      <label>Test text</label><textarea id="txt">Email me at hi@site.com or team@work.io</textarea>
      <div class="output-box" id="out"></div>`;
    const upd=()=>{ try{ const re=new RegExp(m.querySelector("#pat").value, m.querySelector("#fl").value);
      const txt=m.querySelector("#txt").value; const matches=[...txt.matchAll(re.flags.includes("g")?re:new RegExp(re.source,re.flags+"g"))];
      m.querySelector("#out").innerHTML = matches.length? `<b class="result-ok">${matches.length} match(es):</b><br>`+matches.map(x=>esc(x[0])).join("<br>") : "No matches.";
    }catch(e){ m.querySelector("#out").innerHTML='<span class="result-err">Invalid regex: '+esc(e.message)+'</span>'; } };
    m.querySelectorAll("input,textarea").forEach(e=>e.addEventListener("input",upd)); upd();
  };

  IMPL["markdown-preview"] = (m) => {
    m.innerHTML = `<div class="row"><div><label>Markdown</label><textarea id="md" style="min-height:300px"># Hello\n\n**Bold** and *italic* and \`code\`.\n\n- item 1\n- item 2\n\n[link](https://example.com)</textarea></div>
      <div><label>Preview</label><div class="output-box" id="prev" style="min-height:300px"></div></div></div>`;
    const md=s=>esc(s)
      .replace(/^### (.*)$/gm,"<h3>$1</h3>").replace(/^## (.*)$/gm,"<h2>$1</h2>").replace(/^# (.*)$/gm,"<h1>$1</h1>")
      .replace(/\*\*(.+?)\*\*/g,"<b>$1</b>").replace(/\*(.+?)\*/g,"<i>$1</i>").replace(/`(.+?)`/g,"<code>$1</code>")
      .replace(/\[(.+?)\]\((.+?)\)/g,'<a href="$2" target="_blank">$1</a>')
      .replace(/^\s*[-*] (.*)$/gm,"<li>$1</li>").replace(/(<li>.*<\/li>)/s,"<ul>$1</ul>").replace(/\n/g,"<br>");
    const upd=()=>m.querySelector("#prev").innerHTML=md(m.querySelector("#md").value);
    m.querySelector("#md").addEventListener("input",upd); upd();
  };

  IMPL["jwt-decoder"] = (m) => {
    m.innerHTML = `<label>Paste JWT</label><textarea id="in" placeholder="eyJ..."></textarea>
      <label>Header</label><div class="output-box" id="h"></div>
      <label>Payload</label><div class="output-box" id="p"></div>`;
    m.querySelector("#in").addEventListener("input",()=>{ const parts=m.querySelector("#in").value.trim().split(".");
      const dec=s=>{ try{ return JSON.stringify(JSON.parse(decodeURIComponent(escape(atob(s.replace(/-/g,"+").replace(/_/g,"/"))))),null,2); }catch{ return "—"; } };
      m.querySelector("#h").textContent=parts[0]?dec(parts[0]):"—"; m.querySelector("#p").textContent=parts[1]?dec(parts[1]):"—"; });
  };

  IMPL["html-minify"] = (m) => {
    m.innerHTML = `<label>Code (HTML/CSS/JS)</label><textarea id="in"></textarea>
      <button class="btn" id="go">Minify</button> ${copyBtn()}<div class="output-box" id="out"></div>`;
    m.querySelector("#go").addEventListener("click",()=>{ m.querySelector("#out").textContent=m.querySelector("#in").value
      .replace(/\/\*[\s\S]*?\*\//g,"").replace(/<!--[\s\S]*?-->/g,"").replace(/\s+/g," ").replace(/>\s+</g,"><").trim(); });
    wireCopy(m, () => m.querySelector("#out").textContent);
  };

  IMPL["js-beautify"] = (m) => {
    m.innerHTML = `<label>Minified/messy code</label><textarea id="in"></textarea>
      <button class="btn" id="go">Beautify</button> ${copyBtn()}<div class="output-box" id="out"></div>`;
    m.querySelector("#go").addEventListener("click",()=>{ let s=m.querySelector("#in").value, out="", ind=0;
      s=s.replace(/([{};])/g,"$1\n").replace(/\n\s*\n/g,"\n");
      out=s.split("\n").map(line=>{ line=line.trim(); if(line.startsWith("}"))ind=Math.max(0,ind-1); const r="  ".repeat(ind)+line; if(line.endsWith("{"))ind++; return r; }).join("\n");
      m.querySelector("#out").textContent=out; });
    wireCopy(m, () => m.querySelector("#out").textContent);
  };

  IMPL["cron-generator"] = (m) => {
    m.innerHTML = `<div class="row"><div><label>Minute</label><input type="text" id="mi" value="0"></div><div><label>Hour</label><input type="text" id="h" value="*"></div>
      <div><label>Day</label><input type="text" id="dm" value="*"></div><div><label>Month</label><input type="text" id="mo" value="*"></div><div><label>Weekday</label><input type="text" id="dw" value="*"></div></div>
      <label style="margin-top:12px">Cron ${copyBtn()}</label><div class="output-box" id="out" style="font-size:18px"></div>
      <p class="hint">Format: minute hour day-of-month month day-of-week. Use * for any.</p>`;
    const upd=()=>m.querySelector("#out").textContent=["mi","h","dm","mo","dw"].map(id=>m.querySelector("#"+id).value||"*").join(" ");
    m.querySelectorAll("input").forEach(i=>i.addEventListener("input",upd)); upd();
    wireCopy(m, () => m.querySelector("#out").textContent);
  };

  IMPL["lorem-json"] = (m) => {
    m.innerHTML = `<div class="row"><div><label>How many records</label><input type="number" id="n" value="5" min="1" max="500"></div></div>
      <button class="btn" id="go">Generate</button> ${copyBtn()}<div class="output-box" id="out"></div>`;
    const first=["Al","Bo","Cy","Di","Ed","Fi","Gu","Ha"], last=["Fox","Lee","Kim","Rao","Ng","Diaz"], dom=["mail.com","site.io","test.dev"];
    m.querySelector("#go").addEventListener("click",()=>{ const n=+m.querySelector("#n").value, arr=[];
      for(let i=0;i<n;i++){ const f=first[i%first.length], l=last[Math.floor(Math.random()*last.length)];
        arr.push({ id:i+1, name:`${f} ${l}`, email:`${f.toLowerCase()}.${l.toLowerCase()}@${dom[Math.floor(Math.random()*dom.length)]}`, age:18+Math.floor(Math.random()*50), active:Math.random()>.5 }); }
      m.querySelector("#out").textContent=JSON.stringify(arr,null,2); });
    wireCopy(m, () => m.querySelector("#out").textContent);
  };

  IMPL["text-to-slug"] = (m) => { // dev string-case converter
    m.innerHTML = `<label>Input</label><input type="text" id="in" value="Hello World Example">
      <div class="stat-grid" style="margin-top:12px">
        ${["camelCase","PascalCase","snake_case","kebab-case","CONSTANT_CASE"].map(x=>`<div class="stat-box" style="cursor:pointer" data-c="${x}"><b id="v-${x}" style="font-size:14px">-</b><span>${x}</span></div>`).join("")}
      </div><p class="hint">Click a box to copy.</p>`;
    const upd=()=>{ const words=m.querySelector("#in").value.trim().split(/[\s_-]+/).filter(Boolean).map(w=>w.toLowerCase());
      const set=(id,v)=>m.querySelector("#v-"+id).textContent=v;
      set("camelCase", words.map((w,i)=>i?w[0].toUpperCase()+w.slice(1):w).join(""));
      set("PascalCase", words.map(w=>w[0].toUpperCase()+w.slice(1)).join(""));
      set("snake_case", words.join("_")); set("kebab-case", words.join("-")); set("CONSTANT_CASE", words.join("_").toUpperCase()); };
    m.querySelector("#in").addEventListener("input",upd);
    m.querySelectorAll("[data-c]").forEach(d=>d.addEventListener("click",()=>navigator.clipboard.writeText(m.querySelector("#v-"+d.dataset.c).textContent))); upd();
  };

  /* -------- SEO -------- */
  IMPL["meta-generator"] = (m) => {
    m.innerHTML = `<label>Page title</label><input type="text" id="t" value="My Page">
      <label>Description</label><textarea id="d" style="min-height:80px">A short description.</textarea>
      <label>Keywords (comma)</label><input type="text" id="k" value="tools, free">
      <label style="margin-top:12px">Meta tags ${copyBtn()}</label><div class="output-box" id="out"></div>`;
    const upd=()=>{ const t=esc(m.querySelector("#t").value),d=esc(m.querySelector("#d").value),k=esc(m.querySelector("#k").value);
      m.querySelector("#out").textContent=`<title>${t}</title>\n<meta name="description" content="${d}">\n<meta name="keywords" content="${k}">\n<meta property="og:title" content="${t}">\n<meta property="og:description" content="${d}">\n<meta name="twitter:card" content="summary_large_image">`; };
    m.querySelectorAll("input,textarea").forEach(e=>e.addEventListener("input",upd)); upd();
    wireCopy(m, () => m.querySelector("#out").textContent);
  };

  IMPL["keyword-density"] = (m) => {
    m.innerHTML = `<label>Paste content</label><textarea id="in"></textarea><button class="btn" id="go">Analyze</button><div class="output-box" id="out"></div>`;
    m.querySelector("#go").addEventListener("click",()=>{ const words=(m.querySelector("#in").value.toLowerCase().match(/\b[a-z']{2,}\b/g)||[]);
      const total=words.length, freq={}; words.forEach(w=>freq[w]=(freq[w]||0)+1);
      const top=Object.entries(freq).sort((a,b)=>b[1]-a[1]).slice(0,15);
      m.querySelector("#out").innerHTML= total? top.map(([w,c])=>`${esc(w)}: <b>${c}</b> (${(c/total*100).toFixed(1)}%)`).join("<br>") : "No text."; });
  };

  IMPL["robots-generator"] = (m) => {
    m.innerHTML = `<div class="checkbox-row"><input type="checkbox" id="all" checked><label for="all">Allow all crawlers</label></div>
      <label>Disallow paths (one per line)</label><textarea id="dis">/admin\n/private</textarea>
      <label>Sitemap URL</label><input type="text" id="sm" value="https://example.com/sitemap.xml">
      <label style="margin-top:12px">robots.txt ${copyBtn()}</label><div class="output-box" id="out"></div>`;
    const upd=()=>{ let out="User-agent: *\n"; if(m.querySelector("#all").checked) out+="Allow: /\n";
      m.querySelector("#dis").value.split("\n").map(x=>x.trim()).filter(Boolean).forEach(p=>out+="Disallow: "+p+"\n");
      if(m.querySelector("#sm").value) out+="\nSitemap: "+m.querySelector("#sm").value; m.querySelector("#out").textContent=out; };
    m.querySelectorAll("input,textarea").forEach(e=>e.addEventListener("input",upd)); upd();
    wireCopy(m, () => m.querySelector("#out").textContent);
  };

  IMPL["utm-builder"] = (m) => {
    m.innerHTML = `<label>Website URL</label><input type="text" id="u" value="https://example.com">
      <div class="row"><div><label>Source</label><input type="text" id="s" value="newsletter"></div>
      <div><label>Medium</label><input type="text" id="md" value="email"></div>
      <div><label>Campaign</label><input type="text" id="c" value="launch"></div></div>
      <label style="margin-top:12px">Tracking URL ${copyBtn()}</label><div class="output-box" id="out"></div>`;
    const upd=()=>{ const base=m.querySelector("#u").value; const p=new URLSearchParams();
      if(m.querySelector("#s").value)p.set("utm_source",m.querySelector("#s").value); if(m.querySelector("#md").value)p.set("utm_medium",m.querySelector("#md").value); if(m.querySelector("#c").value)p.set("utm_campaign",m.querySelector("#c").value);
      m.querySelector("#out").textContent=base+(base.includes("?")?"&":"?")+p.toString(); };
    m.querySelectorAll("input").forEach(e=>e.addEventListener("input",upd)); upd();
    wireCopy(m, () => m.querySelector("#out").textContent);
  };

  IMPL["serp-preview"] = (m) => {
    m.innerHTML = `<label>Title</label><input type="text" id="t" value="Best Free Online Tools — MasterTools">
      <label>URL</label><input type="text" id="u" value="https://mastertools.example/tools">
      <label>Description</label><textarea id="d" style="min-height:70px">Hundreds of free online tools in one place.</textarea>
      <div class="output-box" style="background:#fff;color:#000" id="prev"></div>`;
    const upd=()=>{ const t=m.querySelector("#t").value.slice(0,60), d=m.querySelector("#d").value.slice(0,160);
      m.querySelector("#prev").innerHTML=`<div style="color:#1a0dab;font-size:19px">${esc(t)}</div><div style="color:#006621;font-size:13px">${esc(m.querySelector("#u").value)}</div><div style="color:#545454;font-size:13px">${esc(d)}</div>`; };
    m.querySelectorAll("input,textarea").forEach(e=>e.addEventListener("input",upd)); upd();
  };

  /* -------- PDF (uses locally-vendored pdf-lib, loaded on demand) -------- */
  const PDFLIB = "vendor/pdf-lib.min.js";

  IMPL["jpg-to-pdf"] = (m) => {
    m.innerHTML = `<div class="dropzone">📁 Drop images (JPG/PNG) or click<input type="file" accept="image/*" multiple hidden></div>
      <div id="list" class="hint"></div><button class="btn" id="go" disabled>Create PDF</button>`;
    let files=[];
    const dz=m.querySelector(".dropzone"), inp=m.querySelector("input");
    const add=fl=>{ files=files.concat([...fl]); m.querySelector("#list").textContent=files.map(f=>f.name).join(", "); m.querySelector("#go").disabled=!files.length; };
    dz.addEventListener("click",()=>inp.click()); inp.addEventListener("change",e=>add(e.target.files));
    dz.addEventListener("dragover",e=>{e.preventDefault();dz.classList.add("drag");}); dz.addEventListener("drop",e=>{e.preventDefault();dz.classList.remove("drag");add(e.dataTransfer.files);});
    m.querySelector("#go").addEventListener("click",async()=>{ const btn=m.querySelector("#go"); btn.textContent="Working…"; btn.disabled=true;
      try{ await loadScript(PDFLIB); const doc=await PDFLib.PDFDocument.create();
        for(const f of files){ const bytes=await f.arrayBuffer(); const img=f.type.includes("png")?await doc.embedPng(bytes):await doc.embedJpg(bytes);
          const page=doc.addPage([img.width,img.height]); page.drawImage(img,{x:0,y:0,width:img.width,height:img.height}); }
        const out=await doc.save(); download("images.pdf",new Blob([out],{type:"application/pdf"})); btn.textContent="Create PDF"; btn.disabled=false;
      }catch(e){ btn.textContent="Create PDF"; btn.disabled=false; alert("Error: "+e.message); } });
  };

  IMPL["merge-pdf"] = (m) => {
    m.innerHTML = `<div class="dropzone">📁 Drop PDF files or click (order = selection order)<input type="file" accept="application/pdf" multiple hidden></div>
      <div id="list" class="hint"></div><button class="btn" id="go" disabled>Merge PDFs</button>`;
    let files=[]; const dz=m.querySelector(".dropzone"), inp=m.querySelector("input");
    const add=fl=>{ files=files.concat([...fl]); m.querySelector("#list").textContent=files.map(f=>f.name).join(", "); m.querySelector("#go").disabled=files.length<2; };
    dz.addEventListener("click",()=>inp.click()); inp.addEventListener("change",e=>add(e.target.files));
    dz.addEventListener("dragover",e=>{e.preventDefault();dz.classList.add("drag");}); dz.addEventListener("drop",e=>{e.preventDefault();dz.classList.remove("drag");add(e.dataTransfer.files);});
    m.querySelector("#go").addEventListener("click",async()=>{ const btn=m.querySelector("#go"); btn.textContent="Merging…"; btn.disabled=true;
      try{ await loadScript(PDFLIB); const out=await PDFLib.PDFDocument.create();
        for(const f of files){ const src=await PDFLib.PDFDocument.load(await f.arrayBuffer()); const pages=await out.copyPages(src,src.getPageIndices()); pages.forEach(p=>out.addPage(p)); }
        const bytes=await out.save(); download("merged.pdf",new Blob([bytes],{type:"application/pdf"})); btn.textContent="Merge PDFs"; btn.disabled=false;
      }catch(e){ btn.textContent="Merge PDFs"; btn.disabled=false; alert("Error: "+e.message); } });
  };
})();
