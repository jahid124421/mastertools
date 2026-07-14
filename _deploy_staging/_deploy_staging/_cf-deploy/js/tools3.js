/* ============================================================
   MasterTools — UNLOCKED premium tools (batch 3)
   Every "PRO" tool now runs client-side (libs lazy-loaded from CDN).
   A few that need real server data (SSL, backlinks) do the max
   possible in-browser and say so honestly.
   ============================================================ */
(function () {
  const IMPL = window.TOOL_IMPL;
  const H = window.__mtHelpers;
  const { esc, copyBtn, wireCopy, download, loadScript, loadImage, dz } = H;

  const LIB = {
    pdfjs: "vendor/pdf.min.js",
    pdfjsWorker: "vendor/pdf.worker.min.js",
    pdflib: "vendor/pdf-lib.min.js",
    jspdf: "vendor/jspdf.umd.min.js",
    xlsx: "vendor/xlsx.full.min.js",
    mammoth: "vendor/mammoth.browser.min.js",
    jszip: "vendor/jszip.min.js",
    bcrypt: "vendor/bcrypt.min.js",
    pdflibEncrypt: "vendor/pdf-lib-plus-encrypt.min.js"
  };
  let _enc;
  async function pdflibEncrypt() { if (_enc) return _enc; await loadScript(LIB.pdflibEncrypt); _enc = window.PDFLib; return _enc; }
  async function pdfjs() { await loadScript(LIB.pdfjs); window.pdfjsLib.GlobalWorkerOptions.workerSrc = LIB.pdfjsWorker; return window.pdfjsLib; }
  const jsPDF = async () => { await loadScript(LIB.jspdf); return window.jspdf.jsPDF; };
  const bcryptLib = async () => { await loadScript(LIB.bcrypt); return window.dcodeIO ? window.dcodeIO.bcrypt : window.bcrypt; };

  function fileUI(m, accept, label, multiple) {
    m.innerHTML = `<div class="dropzone">📡 ${label||"Drop a file or click to upload"}<input type="file" accept="${accept}" ${multiple?"multiple":""} hidden></div>
      <div id="opts"></div><div id="status" class="hint"></div><div id="res"></div>`;
    return { status: m.querySelector("#status"), res: m.querySelector("#res"), opts: m.querySelector("#opts") };
  }
  const busy = (el, msg) => { el.innerHTML = `⏳ ${msg}`; };

  /* ---------- PDF: extract text (pdf.js) ---------- */
  async function extractPdfText(file, onProgress) {
    const lib = await pdfjs();
    const doc = await lib.getDocument({ data: await file.arrayBuffer() }).promise;
    let out = [];
    for (let p = 1; p <= doc.numPages; p++) {
      const page = await doc.getPage(p);
      const content = await page.getTextContent();
      out.push(content.items.map(i => i.str).join(" "));
      if (onProgress) onProgress(p, doc.numPages);
    }
    return out; // array of page texts
  }

  IMPL["pdf-extract-text"] = (m) => {
    const u = fileUI(m, "application/pdf", "Drop a PDF to extract its text");
    dz(m, async f => { try { busy(u.status, "Extracting text…"); const pages = await extractPdfText(f, (p,t)=>busy(u.status,`Page ${p}/${t}…`));
      const text = pages.join("\n\n"); u.status.textContent = `Done — ${pages.length} page(s).`;
      u.res.innerHTML = `<label>Extracted text ${copyBtn()}</label><div class="output-box" style="max-height:300px;overflow:auto">${esc(text)}</div>
        <button class="btn" id="dl">⬇ Download .txt</button>`;
      u.res.querySelector("#dl").addEventListener("click", ()=>download(f.name.replace(/\.pdf$/i,"")+".txt", text, "text/plain"));
      wireCopy(u.res, ()=>text);
    } catch(e){ u.status.innerHTML = `<span class="result-err">Error: ${esc(e.message)}</span>`; } });
  };

  IMPL["pdf-to-word"] = (m) => {
    const u = fileUI(m, "application/pdf", "Drop a PDF to convert to Word (.doc)");
    dz(m, async f => { try { busy(u.status,"Converting…"); const pages = await extractPdfText(f);
      const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word"><head><meta charset="utf-8"></head><body>${pages.map(p=>`<p>${esc(p)}</p>`).join("<br>")}</body></html>`;
      download(f.name.replace(/\.pdf$/i,"")+".doc", html, "application/msword");
      u.status.innerHTML = `<span class="result-ok">✓ Word document downloaded (text layer).</span>`;
    } catch(e){ u.status.innerHTML = `<span class="result-err">Error: ${esc(e.message)}</span>`; } });
  };

  IMPL["pdf-to-excel"] = (m) => {
    const u = fileUI(m, "application/pdf", "Drop a PDF to extract rows to CSV");
    dz(m, async f => { try { busy(u.status,"Extracting…"); const pages = await extractPdfText(f);
      const csv = pages.join("\n").split("\n").map(l=>l.trim()).filter(Boolean).map(l=>l.replace(/\s{2,}/g,",")).join("\n");
      download(f.name.replace(/\.pdf$/i,"")+".csv", csv, "text/csv");
      u.status.innerHTML = `<span class="result-ok">✓ CSV downloaded. Open in Excel.</span> <span class="hint">Line-based extraction (best for simple layouts).</span>`;
    } catch(e){ u.status.innerHTML = `<span class="result-err">Error: ${esc(e.message)}</span>`; } });
  };

  /* ---------- PDF: pdf-lib powered ---------- */
  async function pdflib() { await loadScript(LIB.pdflib); return window.PDFLib; }
  function loadPdfTool(m, label, run, opts) {
    m.innerHTML = `<div class="dropzone">📡 ${label}<input type="file" accept="application/pdf" hidden></div>${opts||""}
      <button class="btn" id="go" disabled>Process & Download</button><div id="status" class="hint"></div>`;
    let file; dz(m, f=>{file=f; m.querySelector("#go").disabled=false; m.querySelector("#status").textContent=f.name;});
    m.querySelector("#go").addEventListener("click", async ()=>{ if(!file)return; const st=m.querySelector("#status");
      try{ busy(st,"Processing…"); await run(file, m, st); }catch(e){ st.innerHTML=`<span class="result-err">Error: ${esc(e.message)}</span>`; } });
  }
  IMPL["watermark-pdf"] = (m) => loadPdfTool(m, "Drop a PDF to watermark",
    async (file,m,st)=>{ const L=await pdflib(); const doc=await L.PDFDocument.load(await file.arrayBuffer(),{ignoreEncryption:true}); const font=await doc.embedFont(L.StandardFonts.HelveticaBold);
      const txt=m.querySelector("#wm").value||"CONFIDENTIAL";
      doc.getPages().forEach(p=>{ const {width,height}=p.getSize(); p.drawText(txt,{x:width/2-txt.length*9,y:height/2,size:40,font,color:L.rgb(.6,.6,.6),opacity:.3,rotate:L.degrees(45)}); });
      download("watermarked.pdf", new Blob([await doc.save()],{type:"application/pdf"})); st.innerHTML='<span class="result-ok">✓ Downloaded.</span>'; },
    `<label>Watermark text</label><input type="text" id="wm" value="CONFIDENTIAL">`);
  IMPL["pdf-page-numbers"] = (m) => loadPdfTool(m, "Drop a PDF to add page numbers",
    async (file,m,st)=>{ const L=await pdflib(); const doc=await L.PDFDocument.load(await file.arrayBuffer(),{ignoreEncryption:true}); const font=await doc.embedFont(L.StandardFonts.Helvetica); const pages=doc.getPages();
      pages.forEach((p,i)=>{ const {width}=p.getSize(); p.drawText(`${i+1} / ${pages.length}`,{x:width/2-20,y:24,size:11,font,color:L.rgb(.3,.3,.3)}); });
      download("numbered.pdf", new Blob([await doc.save()],{type:"application/pdf"})); st.innerHTML='<span class="result-ok">✓ Downloaded.</span>'; });
  IMPL["esign-pdf"] = (m) => loadPdfTool(m, "Drop a PDF to sign",
    async (file,m,st)=>{ const L=await pdflib(); const doc=await L.PDFDocument.load(await file.arrayBuffer(),{ignoreEncryption:true}); const font=await doc.embedFont(L.StandardFonts.HelveticaBoldOblique);
      const sig=m.querySelector("#sig").value||"Signature"; const last=doc.getPages()[doc.getPageCount()-1];
      last.drawText(sig,{x:60,y:70,size:26,font,color:L.rgb(0,0,.55)}); last.drawLine({start:{x:60,y:64},end:{x:260,y:64},thickness:1,color:L.rgb(0,0,0)}); last.drawText("Signed via MasterTools · "+new Date().toLocaleDateString(),{x:60,y:50,size:8,font,color:L.rgb(.4,.4,.4)});
      download("signed.pdf", new Blob([await doc.save()],{type:"application/pdf"})); st.innerHTML='<span class="result-ok">✓ Signed & downloaded.</span>'; },
    `<label>Your signature (typed)</label><input type="text" id="sig" value="Jane Doe">`);
  IMPL["split-pdf"] = (m) => loadPdfTool(m, "Drop a PDF to extract a page range",
    async (file,m,st)=>{ const L=await pdflib(); const src=await L.PDFDocument.load(await file.arrayBuffer(),{ignoreEncryption:true}); const total=src.getPageCount();
      const from=Math.max(1,+m.querySelector("#from").value||1), to=Math.min(total,+m.querySelector("#to").value||total);
      const out=await L.PDFDocument.create(); const idx=[]; for(let i=from-1;i<to;i++)idx.push(i); const pgs=await out.copyPages(src,idx); pgs.forEach(p=>out.addPage(p));
      download(`pages_${from}-${to}.pdf`, new Blob([await out.save()],{type:"application/pdf"})); st.innerHTML=`<span class="result-ok">✓ Extracted pages ${from}–${to} of ${total}.</span>`; },
    `<div class="row"><div><label>From page</label><input type="number" id="from" value="1"></div><div><label>To page</label><input type="number" id="to" value="1"></div></div>`);
  IMPL["compress-pdf"] = (m) => loadPdfTool(m, "Drop a PDF to optimize",
    async (file,m,st)=>{ const L=await pdflib(); const doc=await L.PDFDocument.load(await file.arrayBuffer(),{ignoreEncryption:true}); const bytes=await doc.save({useObjectStreams:true});
      download("optimized.pdf", new Blob([bytes],{type:"application/pdf"})); st.innerHTML=`<span class="result-ok">✓ ${(file.size/1024).toFixed(0)}KB → ${(bytes.byteLength/1024).toFixed(0)}KB (structure-optimized).</span>`; });
  IMPL["unlock-pdf"] = (m) => {
    m.innerHTML = `<div class="dropzone">📡 Drop a restricted / password-protected PDF<input type="file" accept="application/pdf" hidden></div>
      <label>Password <span class="hint">(only if the PDF asks for one to open)</span></label>
      <input type="text" id="pw" placeholder="Leave blank for permission-only locked PDFs">
      <button class="btn" id="go" disabled>🔓 Unlock & Download</button><div id="status" class="hint"></div>`;
    let file; dz(m, f => { file = f; m.querySelector("#go").disabled = false; m.querySelector("#status").textContent = f.name; });
    m.querySelector("#go").addEventListener("click", async () => {
      const st = m.querySelector("#status"); if (!file) return;
      const pw = m.querySelector("#pw").value;
      try {
        busy(st, "Unlocking…");
        const lib = await pdfjs();
        const bytes = await file.arrayBuffer();
        let doc;
        try {
          doc = await lib.getDocument({ data: bytes, password: pw || undefined }).promise;
        } catch (err) {
          if (err && (err.name === "PasswordException" || /password/i.test(err.message || ""))) {
            st.innerHTML = '<span class="result-err">This PDF needs its open password. Type it in the box above, then click Unlock again.</span>';
            return;
          }
          throw err;
        }
        const JS = await jsPDF();
        let pdf = null;
        for (let i = 1; i <= doc.numPages; i++) {
          busy(st, `Rebuilding page ${i}/${doc.numPages}…`);
          const page = await doc.getPage(i);
          const vp = page.getViewport({ scale: 2 });
          const c = document.createElement("canvas");
          c.width = Math.ceil(vp.width); c.height = Math.ceil(vp.height);
          await page.render({ canvasContext: c.getContext("2d"), viewport: vp }).promise;
          const img = c.toDataURL("image/jpeg", 0.92);
          if (!pdf) pdf = new JS({ unit: "px", format: [c.width, c.height] });
          else pdf.addPage([c.width, c.height]);
          pdf.addImage(img, "JPEG", 0, 0, c.width, c.height);
        }
        pdf.save((file.name.replace(/\.pdf$/i, "") || "document") + "-unlocked.pdf");
        st.innerHTML = '<span class="result-ok">✓ Unlocked PDF downloaded — opens with no password and no restrictions.</span> <span class="hint">Pages are flattened to images.</span>';
      } catch (e) { st.innerHTML = `<span class="result-err">Error: ${esc(e.message)}</span>`; }
    });
  };
  IMPL["protect-pdf"] = (m) => {
    m.innerHTML = `<div class="dropzone">📡 Drop a PDF to password-protect<input type="file" accept="application/pdf" hidden></div>
      <label>Password (required to open the PDF)</label><input type="text" id="pw" placeholder="Enter a password">
      <button class="btn" id="go" disabled>🔒 Encrypt & Download</button><div id="status" class="hint"></div>`;
    let file; dz(m, f => { file = f; m.querySelector("#go").disabled = false; m.querySelector("#status").textContent = f.name; });
    m.querySelector("#go").addEventListener("click", async () => {
      const st = m.querySelector("#status"), pw = m.querySelector("#pw").value;
      if (!file) return; if (!pw) { st.innerHTML = '<span class="result-err">Enter a password first.</span>'; return; }
      try {
        busy(st, "Encrypting…");
        const L = await pdflibEncrypt();
        const doc = await L.PDFDocument.load(await file.arrayBuffer(), { ignoreEncryption: true });
        await doc.encrypt({ userPassword: pw, ownerPassword: pw });
        download(file.name.replace(/\.pdf$/i, "") + "-protected.pdf", new Blob([await doc.save()], { type: "application/pdf" }));
        st.innerHTML = '<span class="result-ok">✓ Password-protected PDF downloaded.</span> <span class="hint">It now asks for this password to open.</span>';
      } catch (e) { st.innerHTML = `<span class="result-err">Error: ${esc(e.message)}</span>`; }
    });
  };

  /* ---------- Office → PDF ---------- */
  IMPL["word-to-pdf"] = (m) => {
    const u = fileUI(m, ".docx", "Drop a .docx to convert to PDF");
    dz(m, async f => { try { busy(u.status,"Converting…"); await loadScript(LIB.mammoth); const {value}=await window.mammoth.extractRawText({arrayBuffer:await f.arrayBuffer()});
      const JS=await jsPDF(); const pdf=new JS({unit:"pt",format:"a4"}); const lines=pdf.splitTextToSize(value, 500); pdf.setFontSize(11);
      let y=50; lines.forEach(l=>{ if(y>790){pdf.addPage();y=50;} pdf.text(l,50,y); y+=15; }); pdf.save(f.name.replace(/\.docx$/i,"")+".pdf");
      u.status.innerHTML='<span class="result-ok">✓ PDF downloaded (text layer).</span>';
    } catch(e){ u.status.innerHTML=`<span class="result-err">Error: ${esc(e.message)}</span>`; } });
  };
  IMPL["excel-to-pdf"] = (m) => {
    const u = fileUI(m, ".xlsx,.xls,.csv", "Drop a spreadsheet to convert to PDF");
    dz(m, async f => { try { busy(u.status,"Converting…"); await loadScript(LIB.xlsx); const wb=window.XLSX.read(await f.arrayBuffer(),{type:"array"}); const sheet=wb.Sheets[wb.SheetNames[0]]; const rows=window.XLSX.utils.sheet_to_json(sheet,{header:1});
      const JS=await jsPDF(); const pdf=new JS({unit:"pt",format:"a4"}); pdf.setFontSize(9); let y=40;
      rows.forEach(r=>{ if(y>800){pdf.addPage();y=40;} pdf.text((r||[]).join("  |  ").slice(0,120),40,y); y+=14; }); pdf.save(f.name.replace(/\.[^.]+$/,"")+".pdf");
      u.status.innerHTML='<span class="result-ok">✓ PDF downloaded.</span>';
    } catch(e){ u.status.innerHTML=`<span class="result-err">Error: ${esc(e.message)}</span>`; } });
  };
  IMPL["ppt-to-pdf"] = (m) => {
    const u = fileUI(m, ".pptx", "Drop a .pptx to convert to PDF");
    dz(m, async f => { try { busy(u.status,"Reading slides…"); await loadScript(LIB.jszip); const zip=await window.JSZip.loadAsync(await f.arrayBuffer());
      const slideFiles=Object.keys(zip.files).filter(n=>/ppt\/slides\/slide\d+\.xml$/.test(n)).sort();
      const JS=await jsPDF(); const pdf=new JS({unit:"pt",format:[720,540]}); pdf.setFontSize(14);
      for(let i=0;i<slideFiles.length;i++){ const xml=await zip.files[slideFiles[i]].async("string"); const texts=[...xml.matchAll(/<a:t>([^<]*)<\/a:t>/g)].map(x=>x[1]);
        if(i>0)pdf.addPage([720,540]); pdf.setFontSize(20); pdf.text(`Slide ${i+1}`,40,50); pdf.setFontSize(13); let y=90; pdf.splitTextToSize(texts.join("\n"),640).forEach(l=>{if(y>500){pdf.addPage([720,540]);y=50;}pdf.text(l,40,y);y+=20;}); }
      pdf.save(f.name.replace(/\.pptx$/i,"")+".pdf"); u.status.innerHTML=`<span class="result-ok">✓ ${slideFiles.length} slides → PDF (text).</span>`;
    } catch(e){ u.status.innerHTML=`<span class="result-err">Error: ${esc(e.message)}</span>`; } });
  };

  /* ---------- Image AI-ish (canvas) ---------- */
  IMPL["background-remover"] = (m) => {
    m.innerHTML = `<div class="dropzone">📡 Drop an image (works best on solid/plain backgrounds)<input type="file" accept="image/*" hidden></div>
      <label style="margin-top:10px">Tolerance: <span id="tv">40</span></label><input type="range" id="tol" min="5" max="120" value="40">
      <canvas id="cv" style="display:none;margin-top:12px;border-radius:10px;background:repeating-conic-gradient(#555 0% 25%, #777 0% 50%) 50%/20px 20px"></canvas><br>
      <button class="btn" id="dl" style="display:none">⬇ Download PNG</button><div class="hint">Samples the 4 corners and erases matching pixels. AI-model version = server tier.</div>`;
    let img; const cv=m.querySelector("#cv"), ctx=cv.getContext("2d");
    const run=()=>{ if(!img)return; cv.width=img.width; cv.height=img.height; ctx.clearRect(0,0,cv.width,cv.height); ctx.drawImage(img,0,0);
      const d=ctx.getImageData(0,0,cv.width,cv.height), p=d.data, tol=+m.querySelector("#tol").value;
      const corners=[[0,0],[cv.width-1,0],[0,cv.height-1],[cv.width-1,cv.height-1]].map(([x,y])=>{const i=(y*cv.width+x)*4;return[p[i],p[i+1],p[i+2]];});
      for(let i=0;i<p.length;i+=4){ for(const c of corners){ if(Math.abs(p[i]-c[0])<tol&&Math.abs(p[i+1]-c[1])<tol&&Math.abs(p[i+2]-c[2])<tol){p[i+3]=0;break;} } }
      ctx.putImageData(d,0,0); };
    dz(m, async f=>{ img=await loadImage(f); cv.style.display="block"; m.querySelector("#dl").style.display="inline-flex"; run(); });
    m.querySelector("#tol").addEventListener("input",e=>{m.querySelector("#tv").textContent=e.target.value;run();});
    m.querySelector("#dl").addEventListener("click",()=>cv.toBlob(b=>download("no-bg.png",b)));
  };
  IMPL["image-upscaler"] = (m) => {
    m.innerHTML = `<div class="dropzone">📡 Drop an image to upscale<input type="file" accept="image/*" hidden></div>
      <div class="row" style="margin-top:10px"><div><label>Scale</label><select id="sc"><option>2</option><option>3</option><option>4</option></select></div></div>
      <button class="btn" id="go" disabled>Upscale & Download</button><div id="status" class="hint"></div>`;
    let img; dz(m, async f=>{img=await loadImage(f); m.querySelector("#go").disabled=false; m.querySelector("#status").textContent=`${img.width}×${img.height} loaded`;});
    m.querySelector("#go").addEventListener("click",()=>{ if(!img)return; const s=+m.querySelector("#sc").value; const c=document.createElement("canvas"); c.width=img.width*s; c.height=img.height*s; const x=c.getContext("2d"); x.imageSmoothingEnabled=true; x.imageSmoothingQuality="high"; x.drawImage(img,0,0,c.width,c.height); c.toBlob(b=>{download("upscaled.png",b); m.querySelector("#status").innerHTML=`<span class="result-ok">✓ ${c.width}×${c.height} downloaded.</span>`;}); });
  };
  IMPL["collage-maker"] = (m) => {
    m.innerHTML = `<div class="dropzone">📡 Drop multiple images<input type="file" accept="image/*" multiple hidden></div>
      <div class="row" style="margin-top:10px"><div><label>Columns</label><input type="number" id="cols" value="2"></div><div><label>Gap</label><input type="number" id="gap" value="8"></div></div>
      <button class="btn" id="go" disabled>Build & Download</button><div id="status" class="hint"></div>`;
    let imgs=[]; dz(m, async fl=>{ imgs=[]; for(const f of fl)imgs.push(await loadImage(f)); m.querySelector("#go").disabled=!imgs.length; m.querySelector("#status").textContent=`${imgs.length} images`; }, true);
    m.querySelector("#go").addEventListener("click",()=>{ if(!imgs.length)return; const cols=Math.max(1,+m.querySelector("#cols").value), gap=+m.querySelector("#gap").value; const cell=300, rows=Math.ceil(imgs.length/cols);
      const c=document.createElement("canvas"); c.width=cols*cell+(cols+1)*gap; c.height=rows*cell+(rows+1)*gap; const x=c.getContext("2d"); x.fillStyle="#0b0f1f"; x.fillRect(0,0,c.width,c.height);
      imgs.forEach((im,i)=>{ const cx=(i%cols)*(cell+gap)+gap, cy=Math.floor(i/cols)*(cell+gap)+gap; const sc=Math.min(cell/im.width,cell/im.height); const w=im.width*sc,h=im.height*sc; x.drawImage(im,cx+(cell-w)/2,cy+(cell-h)/2,w,h); });
      c.toBlob(b=>{download("collage.png",b); m.querySelector("#status").innerHTML='<span class="result-ok">✓ Collage downloaded.</span>';}); });
  };
})();

/* ================= VIDEO + AI-TEXT + CURRENCY + GEN + SEO + SECURITY + MISC ================= */
(function () {
  const IMPL = window.TOOL_IMPL;
  const H = window.__mtHelpers;
  const { esc, copyBtn, wireCopy, download, loadScript, dz } = H;
  const jsPDF = async () => { await loadScript("vendor/jspdf.umd.min.js"); return window.jspdf.jsPDF; };
  const bcryptLib = async () => { await loadScript("vendor/bcrypt.min.js"); return window.dcodeIO ? window.dcodeIO.bcrypt : window.bcrypt; };

  /* ============================================================
     Shared in-browser engines (downloaded on demand, progress-tracked)
     - Whisper (transformers.js) for speech recognition
     - ffmpeg.wasm (single-thread core, no COOP/COEP needed) for A/V
     ============================================================ */
  const CDN = {
    transformers: "https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.0.2",
    ffUtil: "https://cdn.jsdelivr.net/npm/@ffmpeg/util@0.12.2/dist/umd/index.js",
    ffMain: "https://cdn.jsdelivr.net/npm/@ffmpeg/ffmpeg@0.12.10/dist/umd/ffmpeg.js",
    ffWorker: "https://cdn.jsdelivr.net/npm/@ffmpeg/ffmpeg@0.12.10/dist/umd/814.ffmpeg.js",
    ffCore: "https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.6/dist/umd"
  };

  // A live progress bar rendered into `host`.
  function progressUI(host) {
    if (!host) return null;
    host.innerHTML = `<div style="margin:12px 0">
      <div class="pbar-label hint" style="margin-bottom:6px">Starting…</div>
      <div style="height:12px;background:rgba(255,255,255,.08);border:1px solid var(--border);border-radius:8px;overflow:hidden">
        <div class="pbar-fill" style="height:100%;width:0%;background:linear-gradient(90deg,#22d3ee,#e879f9);box-shadow:0 0 12px rgba(34,211,238,.55);transition:width .25s"></div>
      </div></div>`;
    const fill = host.querySelector(".pbar-fill"), lab = host.querySelector(".pbar-label");
    let creep = null;
    const stopCreep = () => { if (creep) { clearInterval(creep); creep = null; } };
    return {
      set(pct, label) { stopCreep(); if (pct >= 0) fill.style.width = Math.min(100, Math.max(0, pct)) + "%"; if (label) lab.textContent = label; },
      busy(label) { if (label) lab.textContent = label; if (!creep) { let p = Math.max(6, parseFloat(fill.style.width) || 6);
        creep = setInterval(() => { p = Math.min(94, p + (94 - p) * 0.05 + 0.4); fill.style.width = p + "%"; }, 300); } },
      done(label) { stopCreep(); fill.style.width = "100%"; if (label) lab.textContent = label; },
      hide() { stopCreep(); host.innerHTML = ""; }
    };
  }

  /* ---------- Whisper (speech recognition) ---------- */
  let _asr;
  async function getASR(bar) {
    if (_asr) return _asr;
    if (bar) bar.busy("Loading AI engine…");
    const { pipeline } = await import(CDN.transformers);
    _asr = await pipeline("automatic-speech-recognition", "Xenova/whisper-tiny.en", {
      progress_callback: (p) => {
        if (!bar) return;
        if (p.status === "progress" && p.total) {
          bar.set(Math.round(p.progress), `Downloading AI model: ${p.file} — ${(p.loaded / 1048576).toFixed(1)}/${(p.total / 1048576).toFixed(1)} MB`);
        } else if (p.status === "ready") { bar.done("Model ready ✓"); }
      }
    });
    if (bar) bar.done("Model ready ✓");
    return _asr;
  }

  /* ---------- ffmpeg.wasm (audio/video processing) ---------- */
  let _ff, _ffCb = null;
  const setFFProgress = (cb) => { _ffCb = cb; };
  async function getFFmpeg(bar) {
    if (_ff) return _ff;
    if (bar) bar.busy("Downloading video engine (~32 MB, first time only)…");
    await loadScript(CDN.ffUtil);
    await loadScript(CDN.ffMain);
    const { FFmpeg } = window.FFmpegWASM;
    const { toBlobURL, fetchFile } = window.FFmpegUtil;
    const ff = new FFmpeg();
    ff.on("progress", (ev) => { if (_ffCb && ev && typeof ev.progress === "number") _ffCb(Math.max(0, Math.min(1, ev.progress))); });
    const [coreURL, wasmURL, classWorkerURL] = await Promise.all([
      toBlobURL(`${CDN.ffCore}/ffmpeg-core.js`, "text/javascript"),
      toBlobURL(`${CDN.ffCore}/ffmpeg-core.wasm`, "application/wasm"),
      toBlobURL(CDN.ffWorker, "text/javascript")
    ]);
    await ff.load({ coreURL, wasmURL, classWorkerURL });
    _ff = { ff, fetchFile };
    return _ff;
  }

  // expose engines so tools in other files (e.g. speech-to-text) can reuse them
  window.__mtEngines = { getASR, getFFmpeg, setFFProgress, progressUI };

  function transcribeUI(m, srt) {
    m.innerHTML = `<div class="dropzone">📡 Drop audio or video to transcribe (runs 100% in your browser)<input type="file" accept="audio/*,video/*" hidden></div>
      <button class="btn" id="go" disabled>${srt ? "Generate Subtitles (.srt)" : "Transcribe"}</button>
      <div id="prog"></div><div id="status" class="hint"></div><div id="res"></div>`;
    let file; dz(m, f => { file = f; m.querySelector("#go").disabled = false; m.querySelector("#status").textContent = f.name; });
    m.querySelector("#go").addEventListener("click", async () => {
      const st = m.querySelector("#status"), res = m.querySelector("#res"); res.innerHTML = "";
      const bar = progressUI(m.querySelector("#prog"));
      try {
        const asr = await getASR(bar);
        bar.busy("Transcribing… (first run also warms up the model)");
        const url = URL.createObjectURL(file);
        const out = await asr(url, { chunk_length_s: 30, stride_length_s: 5, return_timestamps: srt });
        bar.done("Done ✓");
        if (srt) {
          const fmt = s => { const h = String(Math.floor(s / 3600)).padStart(2, "0"), mi = String(Math.floor(s / 60) % 60).padStart(2, "0"), se = String(Math.floor(s) % 60).padStart(2, "0"), ms = String(Math.floor((s % 1) * 1000)).padStart(3, "0"); return `${h}:${mi}:${se},${ms}`; };
          const srtTxt = (out.chunks || []).map((c, i) => `${i + 1}\n${fmt(c.timestamp[0] || 0)} --> ${fmt(c.timestamp[1] || (c.timestamp[0] + 2))}\n${c.text.trim()}\n`).join("\n");
          res.innerHTML = `<label>SRT ${copyBtn()}</label><div class="output-box" style="max-height:300px;overflow:auto">${esc(srtTxt)}</div><button class="btn" id="dl">⬇ Download .srt</button>`;
          res.querySelector("#dl").addEventListener("click", () => download("subtitles.srt", srtTxt, "text/plain")); wireCopy(res, () => srtTxt);
        } else {
          const txt = out.text.trim(); res.innerHTML = `<label>Transcript ${copyBtn()}</label><div class="output-box" style="max-height:300px;overflow:auto">${esc(txt)}</div><button class="btn" id="dl">⬇ Download .txt</button>`;
          res.querySelector("#dl").addEventListener("click", () => download("transcript.txt", txt, "text/plain")); wireCopy(res, () => txt);
        }
        st.innerHTML = '<span class="result-ok">✓ Done.</span>';
      } catch (e) { if (bar) bar.hide(); st.innerHTML = `<span class="result-err">Error: ${esc(e.message)}. Try a shorter clip.</span>`; }
    });
  }
  IMPL["reel-transcriber"] = (m) => transcribeUI(m, false);
  IMPL["subtitle-generator"] = (m) => transcribeUI(m, true);

  /* ---------- Media tools: TRUE MP3/MP4 via ffmpeg.wasm (single-thread core) ----------
     Runs the @ffmpeg/core 0.12.6 single-thread build inside our own classic worker.
     No SharedArrayBuffer / COOP-COEP required -> works on any static host and never
     blocks the other CDN-based tools. Falls back to native MediaRecorder (WebM) if the
     engine can't be fetched (offline / blocked). Handles every input format ffmpeg reads. */
  // Vendored locally (self-contained / offline). jsDelivr is only a fallback if the
  // local file is somehow missing. Relative paths also work when hosted in a subfolder.
  const FF_CORE_JS = ["vendor/ffmpeg/ffmpeg-core.js", "https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.js"];
  const FF_CORE_WASM = ["vendor/ffmpeg/ffmpeg-core.wasm", "https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.wasm"];
  async function ffFetch(sources) {
    let lastErr;
    for (const url of sources) {
      try { const r = await fetch(url); if (r.ok) return r; lastErr = new Error("HTTP " + r.status + " for " + url); }
      catch (e) { lastErr = e; }
    }
    throw lastErr || new Error("Could not load the video engine.");
  }
  const FF_WORKER_SRC = `
    self.onmessage = async (e) => {
      const { coreJsURL, wasmURL, inBytes, inName, outName, args } = e.data;
      try {
        importScripts(coreJsURL);
        const wasmBinary = await (await fetch(wasmURL)).arrayBuffer();
        const Core = await self.createFFmpegCore({ wasmBinary, locateFile: (p) => p,
          print: () => {}, printErr: (msg) => { try { const t = /time=(\\d+):(\\d+):([\\d.]+)/.exec(msg);
            if (t) self.postMessage({ type: "progress", t: (+t[1]) * 3600 + (+t[2]) * 60 + parseFloat(t[3]) }); } catch (_) {} } });
        Core.FS.writeFile(inName, inBytes);
        if (Core.exec) Core.exec.apply(Core, args); else Core.callMain(args);
        const out = Core.FS.readFile(outName);
        self.postMessage({ type: "done", out }, [out.buffer]);
      } catch (err) { self.postMessage({ type: "error", message: (err && err.message) || String(err) }); }
    };`;
  let _ffCoreJsURL = null, _ffWasmURL = null, _ffWorkerURL = null;
  async function ffPrepare(bar) {
    if (!_ffCoreJsURL) {
      if (bar) bar.busy("Loading video engine (~30 MB, first run only, then cached)…");
      const [js, wasm] = await Promise.all([ffFetch(FF_CORE_JS).then(r => r.blob()), ffFetch(FF_CORE_WASM).then(r => r.blob())]);
      _ffCoreJsURL = URL.createObjectURL(new Blob([await js.arrayBuffer()], { type: "text/javascript" }));
      _ffWasmURL = URL.createObjectURL(new Blob([await wasm.arrayBuffer()], { type: "application/wasm" }));
      _ffWorkerURL = URL.createObjectURL(new Blob([FF_WORKER_SRC], { type: "text/javascript" }));
    }
    return { coreJsURL: _ffCoreJsURL, wasmURL: _ffWasmURL, workerURL: _ffWorkerURL };
  }
  function ffTranscode({ file, inName, outName, args, duration, bar, label }) {
    return new Promise(async (resolve, reject) => {
      try {
        const { coreJsURL, wasmURL, workerURL } = await ffPrepare(bar);
        const inBytes = new Uint8Array(await file.arrayBuffer());
        const w = new Worker(workerURL);
        w.onmessage = (ev) => {
          const d = ev.data;
          if (d.type === "progress") { if (bar) { if (duration > 0) bar.set(Math.min(99, d.t / duration * 100), `${label}… ${Math.round(d.t / duration * 100)}%`); else bar.busy(`${label}…`); } }
          else if (d.type === "done") { w.terminate(); resolve(new Uint8Array(d.out)); }
          else if (d.type === "error") { w.terminate(); reject(new Error(d.message)); }
        };
        w.onerror = (ev) => { w.terminate(); reject(new Error(ev.message || "ffmpeg worker error")); };
        w.postMessage({ coreJsURL, wasmURL, inBytes, inName, outName, args }, [inBytes.buffer]);
      } catch (e) { reject(e); }
    });
  }
  const mediaDuration = (file) => new Promise((res) => {
    const el = document.createElement(file.type.startsWith("audio") ? "audio" : "video");
    el.preload = "metadata"; el.onloadedmetadata = () => { res(el.duration || 0); };
    el.onerror = () => res(0); el.src = URL.createObjectURL(file);
  });
  // native fallbacks (WebM) if the ffmpeg engine can't load
  const recMime = (kind) => {
    const cands = kind === "audio" ? ["audio/webm;codecs=opus", "audio/webm", "audio/ogg"]
      : ["video/webm;codecs=vp9,opus", "video/webm;codecs=vp8,opus", "video/webm"];
    return cands.find(t => MediaRecorder.isTypeSupported(t)) || cands[cands.length - 1];
  };
  const whenMeta = (v) => new Promise((res, rej) => { if (v.readyState >= 1) return res(); v.onloadedmetadata = () => res(); v.onerror = () => rej(new Error("Could not read this video.")); });

  IMPL["video-to-mp3"] = (m) => {
    m.innerHTML = `<div class="dropzone">📡 Drop a video (or audio) to extract MP3<input type="file" accept="video/*,audio/*" hidden></div>
      <video id="v" style="display:none"></video>
      <button class="btn" id="go" disabled>Extract MP3</button><div id="prog"></div><div id="status" class="hint"></div><div id="res"></div>`;
    let file, v = m.querySelector("#v");
    dz(m, f => { file = f; v.src = URL.createObjectURL(f); m.querySelector("#go").disabled = false; m.querySelector("#status").textContent = f.name; });
    m.querySelector("#go").addEventListener("click", async () => {
      const st = m.querySelector("#status"), res = m.querySelector("#res"); res.innerHTML = ""; if (!file) return;
      const bar = progressUI(m.querySelector("#prog"));
      try {
        const dur = await mediaDuration(file);
        const data = await ffTranscode({ file, inName: "input", outName: "out.mp3", duration: dur, bar, label: "Encoding MP3",
          args: ["-i", "input", "-vn", "-acodec", "libmp3lame", "-q:a", "2", "out.mp3"] });
        bar.done("Done ✓");
        const blob = new Blob([data], { type: "audio/mpeg" });
        download((file.name.replace(/\.[^.]+$/, "") || "audio") + ".mp3", blob);
        res.innerHTML = `<audio controls src="${URL.createObjectURL(blob)}" style="width:100%;margin-top:10px"></audio>`;
        st.innerHTML = `<span class="result-ok">✓ MP3 downloaded (${(blob.size / 1024).toFixed(0)} KB).</span>`;
      } catch (e) {
        try {
          bar.busy("Engine unavailable — extracting audio natively…");
          await whenMeta(v); const stream = v.captureStream ? v.captureStream() : v.mozCaptureStream();
          const aTracks = stream.getAudioTracks(); if (!aTracks.length) throw new Error("No audio track found.");
          const mime = recMime("audio"), ext = mime.includes("ogg") ? "ogg" : "webm";
          const rec = new MediaRecorder(new MediaStream(aTracks), { mimeType: mime }); const chunks = [];
          rec.ondataavailable = ev => ev.data.size && chunks.push(ev.data); const done = new Promise(r => rec.onstop = r);
          v.currentTime = 0; v.muted = true; await v.play(); rec.start(); v.onended = () => rec.stop(); await done;
          bar.hide(); const blob = new Blob(chunks, { type: mime });
          download((file.name.replace(/\.[^.]+$/, "") || "audio") + "." + ext, blob);
          res.innerHTML = `<audio controls src="${URL.createObjectURL(blob)}" style="width:100%;margin-top:10px"></audio>`;
          st.innerHTML = `<span class="result-ok">✓ Audio extracted (${ext.toUpperCase()}).</span> <span class="hint">MP3 engine was unreachable; saved browser-native audio.</span>`;
        } catch (e2) { bar.hide(); st.innerHTML = `<span class="result-err">Error: ${esc(e2.message)}</span>`; }
      }
    });
  };
  IMPL["video-compressor"] = (m) => {
    m.innerHTML = `<div class="dropzone">📡 Drop a video to compress<input type="file" accept="video/*" hidden></div>
      <video id="v" style="display:none"></video><canvas id="c" style="display:none"></canvas>
      <div class="row" style="margin-top:10px"><div><label>Target width (px)</label><input type="number" id="w" value="640"></div>
      <div><label>Quality (CRF 18–34 · higher = smaller)</label><input type="number" id="crf" value="28"></div></div>
      <button class="btn" id="go" disabled>Compress</button><div id="prog"></div><div id="status" class="hint"></div><div id="res"></div>`;
    let file, v = m.querySelector("#v"), c = m.querySelector("#c");
    dz(m, f => { file = f; v.src = URL.createObjectURL(f); m.querySelector("#go").disabled = false; m.querySelector("#status").textContent = f.name; });
    m.querySelector("#go").addEventListener("click", async () => {
      const st = m.querySelector("#status"), res = m.querySelector("#res"); res.innerHTML = ""; if (!file) return;
      const bar = progressUI(m.querySelector("#prog"));
      const tw = Math.max(16, +m.querySelector("#w").value || 640), crf = Math.min(40, Math.max(10, +m.querySelector("#crf").value || 28));
      try {
        const dur = await mediaDuration(file);
        const data = await ffTranscode({ file, inName: "input", outName: "out.mp4", duration: dur, bar, label: "Compressing",
          args: ["-i", "input", "-vf", `scale=${tw}:-2`, "-c:v", "libx264", "-preset", "veryfast", "-crf", String(crf), "-c:a", "aac", "-b:a", "128k", "out.mp4"] });
        bar.done("Done ✓");
        const blob = new Blob([data], { type: "video/mp4" });
        download((file.name.replace(/\.[^.]+$/, "") || "video") + "-compressed.mp4", blob);
        res.innerHTML = `<video controls src="${URL.createObjectURL(blob)}" style="max-width:100%;margin-top:10px;border-radius:8px"></video>`;
        st.innerHTML = `<span class="result-ok">✓ ${(file.size / 1048576).toFixed(2)} MB → ${(blob.size / 1048576).toFixed(2)} MB (MP4).</span>`;
      } catch (e) {
        try {
          bar.busy("Engine unavailable — compressing natively (WebM)…");
          await whenMeta(v); const scale = tw / v.videoWidth; c.width = tw; c.height = Math.max(2, Math.round(v.videoHeight * scale)); const x = c.getContext("2d");
          const cStream = c.captureStream(30); const aTracks = v.captureStream ? v.captureStream().getAudioTracks() : []; aTracks.forEach(t => cStream.addTrack(t));
          const mime = recMime("video"); const rec = new MediaRecorder(cStream, { mimeType: mime, videoBitsPerSecond: 1e6 }); const chunks = [];
          rec.ondataavailable = ev => ev.data.size && chunks.push(ev.data); const done = new Promise(r => rec.onstop = r);
          v.currentTime = 0; v.muted = true; await v.play(); rec.start();
          const draw = () => { if (!v.paused && !v.ended) { x.drawImage(v, 0, 0, c.width, c.height); requestAnimationFrame(draw); } }; draw();
          v.onended = () => rec.stop(); await done; bar.hide();
          const blob = new Blob(chunks, { type: mime });
          download((file.name.replace(/\.[^.]+$/, "") || "video") + "-compressed.webm", blob);
          res.innerHTML = `<video controls src="${URL.createObjectURL(blob)}" style="max-width:100%;margin-top:10px;border-radius:8px"></video>`;
          st.innerHTML = `<span class="result-ok">✓ Compressed (WebM).</span> <span class="hint">MP4 engine was unreachable; used native encoder.</span>`;
        } catch (e2) { bar.hide(); st.innerHTML = `<span class="result-err">Error: ${esc(e2.message)}</span>`; }
      }
    });
  };
  IMPL["clip-maker"] = (m) => {
    m.innerHTML = `<div class="dropzone">📡 Drop a video to clip<input type="file" accept="video/*" hidden></div>
      <video id="v" controls style="max-width:100%;margin-top:12px;display:none;border-radius:10px"></video>
      <div class="row" style="margin-top:10px"><div><label>Start (s)</label><input type="number" id="s" value="0"></div><div><label>End (s)</label><input type="number" id="e" value="5"></div></div>
      <button class="btn" id="go" disabled>Export Clip (MP4)</button><div id="prog"></div><div id="status" class="hint"></div>`;
    let file, v = m.querySelector("#v");
    dz(m, f => { file = f; v.src = URL.createObjectURL(f); v.style.display = "block"; m.querySelector("#go").disabled = false; m.querySelector("#status").textContent = f.name; });
    m.querySelector("#go").addEventListener("click", async () => {
      const st = m.querySelector("#status"); if (!file) return;
      const s = Math.max(0, +m.querySelector("#s").value || 0), e = +m.querySelector("#e").value || 0;
      if (e <= s) { st.innerHTML = '<span class="result-err">End time must be greater than start time.</span>'; return; }
      const bar = progressUI(m.querySelector("#prog"));
      try {
        const data = await ffTranscode({ file, inName: "input", outName: "out.mp4", duration: (e - s), bar, label: "Cutting clip",
          args: ["-ss", String(s), "-to", String(e), "-i", "input", "-c:v", "libx264", "-preset", "veryfast", "-c:a", "aac", "out.mp4"] });
        bar.done("Done ✓");
        download((file.name.replace(/\.[^.]+$/, "") || "clip") + `-clip_${s}-${e}s.mp4`, new Blob([data], { type: "video/mp4" }));
        st.innerHTML = '<span class="result-ok">✓ Clip downloaded (MP4).</span>';
      } catch (err) {
        try {
          bar.busy("Engine unavailable — recording clip natively (WebM)…");
          const stream = v.captureStream ? v.captureStream() : v.mozCaptureStream(); const mime = recMime("video");
          const rec = new MediaRecorder(stream, { mimeType: mime }); const chunks = [];
          rec.ondataavailable = ev => ev.data.size && chunks.push(ev.data); const done = new Promise(r => rec.onstop = r);
          v.muted = true; v.currentTime = s; await v.play(); rec.start();
          const check = () => { if (v.currentTime >= e || v.ended) { rec.stop(); v.pause(); } else requestAnimationFrame(check); }; check(); await done; bar.hide();
          download((file.name.replace(/\.[^.]+$/, "") || "clip") + `-clip_${s}-${e}s.webm`, new Blob(chunks, { type: mime }));
          st.innerHTML = '<span class="result-ok">✓ Clip downloaded (WebM).</span> <span class="hint">MP4 engine was unreachable; used native recorder.</span>';
        } catch (e2) { bar.hide(); st.innerHTML = `<span class="result-err">Error: ${esc(e2.message)}</span>`; }
      }
    });
  };
  IMPL["video-downloader"] = (m) => {
    m.innerHTML = `<label>Direct media URL (.mp4/.webm/.mp3/image)</label><input type="text" id="u" placeholder="https://example.com/video.mp4">
      <button class="btn" id="go">Fetch & Download</button><div id="status" class="hint"></div>
      <p class="hint">Downloads direct, CORS-enabled media links. It cannot grab DRM-protected sites like YouTube/Netflix (against their terms).</p>`;
    m.querySelector("#go").addEventListener("click", async ()=>{ const st=m.querySelector("#status"), url=m.querySelector("#u").value.trim();
      try{ st.textContent="Fetching…"; const r=await fetch(url); const blob=await r.blob(); download(url.split("/").pop().split("?")[0]||"download", blob); st.innerHTML='<span class="result-ok">✓ Downloaded.</span>';
      }catch(e){ st.innerHTML=`<span class="result-err">Blocked or unreachable (CORS). ${esc(e.message)}</span>`; } });
  };
  IMPL["fake-tweet"] = (m) => {
    m.innerHTML = `<div class="row"><div><label>Name</label><input type="text" id="n" value="Elon Musk"></div><div><label>@handle</label><input type="text" id="h" value="elonmusk"></div></div>
      <label>Tweet text</label><textarea id="t" style="min-height:80px">Occupy Mars 🚀</textarea>
      <div class="row"><div><label>Likes</label><input type="number" id="l" value="128000"></div><div><label>Retweets</label><input type="number" id="r" value="24000"></div></div>
      <button class="btn" id="go">Generate</button><div id="res"></div><p class="hint">For parody/mockups. Don't use to impersonate or mislead.</p>`;
    m.querySelector("#go").addEventListener("click",()=>{ const c=document.createElement("canvas"); c.width=560; c.height=240; const x=c.getContext("2d");
      x.fillStyle="#15202b"; x.fillRect(0,0,560,240); x.fillStyle="#1d9bf0"; x.beginPath(); x.arc(50,55,24,0,7); x.fill();
      x.fillStyle="#fff"; x.font="bold 20px sans-serif"; x.fillText(m.querySelector("#n").value,90,50); x.fillStyle="#8899a6"; x.font="16px sans-serif"; x.fillText("@"+m.querySelector("#h").value,90,74);
      x.fillStyle="#fff"; x.font="20px sans-serif"; const words=m.querySelector("#t").value.split(" "); let line="",y=120; words.forEach(w=>{ if((line+w).length>46){x.fillText(line,30,y);y+=28;line="";} line+=w+" "; }); x.fillText(line,30,y);
      x.fillStyle="#8899a6"; x.font="15px sans-serif"; x.fillText(`❤ ${(+m.querySelector("#l").value).toLocaleString()}    🔁 ${(+m.querySelector("#r").value).toLocaleString()}`,30,215);
      m.querySelector("#res").innerHTML=`<img class="preview" src="${c.toDataURL()}"><br><a class="btn small secondary" href="${c.toDataURL()}" download="tweet.png">⬇ Download</a>`; });
    m.querySelector("#go").click();
  };

  /* ---------- AI text (algorithms + free API) ---------- */
  IMPL["grammar-checker"] = (m) => {
    m.innerHTML = `<label>Text to check</label><textarea id="in">She dont knows what she are doing but it dont matter.</textarea>
      <button class="btn" id="go">Check Grammar</button><div id="status" class="hint"></div><div class="output-box" id="out"></div>
      <p class="hint">Powered by the free LanguageTool API.</p>`;
    m.querySelector("#go").addEventListener("click", async ()=>{ const st=m.querySelector("#status"), out=m.querySelector("#out"), txt=m.querySelector("#in").value;
      try{ st.textContent="Checking…"; const r=await fetch("https://api.languagetool.org/v2/check",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:"language=en-US&text="+encodeURIComponent(txt)});
        const d=await r.json(); st.textContent=""; out.innerHTML = d.matches.length? d.matches.map(mt=>`⚠ <b>${esc(mt.message)}</b><br><span class="hint">"…${esc(txt.substr(Math.max(0,mt.offset-15),mt.length+30))}…" ${mt.replacements.length?"→ "+esc(mt.replacements.slice(0,3).map(x=>x.value).join(", ")):""}</span>`).join("<br><br>") : '<span class="result-ok">✓ No issues found.</span>';
      }catch(e){ st.innerHTML=`<span class="result-err">API error: ${esc(e.message)}</span>`; } });
  };
  IMPL["summarizer"] = (m) => {
    m.innerHTML = `<label>Long text</label><textarea id="in" style="min-height:180px"></textarea>
      <div class="row"><div><label>Summary sentences</label><input type="number" id="n" value="3"></div></div>
      <button class="btn" id="go">Summarize</button> ${copyBtn()}<div class="output-box" id="out"></div>`;
    m.querySelector("#go").addEventListener("click",()=>{ const txt=m.querySelector("#in").value; const sents=txt.match(/[^.!?]+[.!?]+/g)||[txt];
      const words=txt.toLowerCase().match(/\b[a-z']{3,}\b/g)||[]; const stop=new Set("the and for are but not you all any can her was one our out has him his how man new now old see two way who did its let put say she too use".split(" "));
      const freq={}; words.forEach(w=>{if(!stop.has(w))freq[w]=(freq[w]||0)+1;});
      const scored=sents.map((s,i)=>({s,i,score:(s.toLowerCase().match(/\b[a-z']{3,}\b/g)||[]).reduce((a,w)=>a+(freq[w]||0),0)/Math.sqrt(s.length||1)}));
      const top=scored.slice().sort((a,b)=>b.score-a.score).slice(0,Math.max(1,+m.querySelector("#n").value)).sort((a,b)=>a.i-b.i);
      m.querySelector("#out").textContent=top.map(x=>x.s.trim()).join(" ")||"Add more text."; });
    wireCopy(m,()=>m.querySelector("#out").textContent);
  };
  IMPL["paraphraser"] = (m) => {
    const syn={quick:"fast",fast:"rapid",big:"large",large:"sizable",small:"tiny",happy:"glad",sad:"unhappy",good:"great",bad:"poor",important:"crucial",help:"assist",make:"create",use:"utilize",show:"demonstrate",start:"begin",end:"conclude",buy:"purchase",smart:"intelligent",easy:"simple",hard:"difficult",many:"numerous",also:"additionally",but:"however",so:"therefore",very:"extremely",get:"obtain",need:"require"};
    m.innerHTML = `<label>Text to rewrite</label><textarea id="in"></textarea><button class="btn" id="go">Paraphrase</button> ${copyBtn()}<div class="output-box" id="out"></div><p class="hint">Rule-based synonym rewrite. LLM-quality paraphrasing = server tier.</p>`;
    m.querySelector("#go").addEventListener("click",()=>{ m.querySelector("#out").textContent=m.querySelector("#in").value.replace(/\b[a-z]+\b/gi,w=>{ const l=w.toLowerCase(); if(syn[l]){const r=syn[l];return w[0]===w[0].toUpperCase()?r[0].toUpperCase()+r.slice(1):r;} return w; }); });
    wireCopy(m,()=>m.querySelector("#out").textContent);
  };
  IMPL["plagiarism-checker"] = (m) => {
    m.innerHTML = `<label>Text</label><textarea id="in"></textarea><button class="btn" id="go">Analyze</button><div class="output-box" id="out"></div>
      <p class="hint">Local originality analysis: repeated sentences & phrase reuse. Web-wide matching = server tier.</p>`;
    m.querySelector("#go").addEventListener("click",()=>{ const txt=m.querySelector("#in").value; const sents=(txt.match(/[^.!?]+[.!?]+/g)||[]).map(s=>s.trim().toLowerCase());
      const seen={},dupes=[]; sents.forEach(s=>{ if(s.length>15){ seen[s]=(seen[s]||0)+1; if(seen[s]===2)dupes.push(s); } });
      const words=txt.toLowerCase().match(/\b\w+\b/g)||[]; const uniq=new Set(words).size; const div=words.length?(uniq/words.length*100).toFixed(1):0;
      m.querySelector("#out").innerHTML=`Lexical diversity: <b class="result-ok">${div}%</b> (higher = more original)<br>Repeated sentences: <b>${dupes.length}</b>${dupes.length?"<br>"+dupes.map(d=>"• "+esc(d.slice(0,60))+"…").join("<br>"):""}`; });
  };
  IMPL["ai-detector"] = (m) => {
    m.innerHTML = `<label>Text</label><textarea id="in"></textarea><button class="btn" id="go">Analyze</button><div class="output-box" id="out"></div>
      <p class="hint">Heuristic estimate (sentence-length variance + common AI phrasing). Not definitive.</p>`;
    m.querySelector("#go").addEventListener("click",()=>{ const txt=m.querySelector("#in").value; const sents=(txt.match(/[^.!?]+[.!?]+/g)||[]); const lens=sents.map(s=>(s.match(/\S+/g)||[]).length);
      const mean=lens.reduce((a,b)=>a+b,0)/(lens.length||1); const variance=lens.reduce((a,b)=>a+(b-mean)**2,0)/(lens.length||1); const burst=Math.sqrt(variance);
      const phrases=["it is important to note","in conclusion","furthermore","moreover","delve","tapestry","in today's world","navigating the","a testament to","plays a crucial role"];
      const hits=phrases.filter(p=>txt.toLowerCase().includes(p)).length;
      let score=50; score-=burst*4; score+=hits*12; score=Math.max(2,Math.min(98,score));
      m.querySelector("#out").innerHTML=`Estimated AI-written likelihood: <b class="${score>60?"result-err":"result-ok"}">${score.toFixed(0)}%</b><br><span class="hint">Sentence burstiness: ${burst.toFixed(1)} • AI-phrase hits: ${hits}</span>`; });
  };

  /* ---------- Currency (free API) ---------- */
  IMPL["currency-converter"] = (m) => {
    m.innerHTML = `<div class="row"><div><label>Amount</label><input type="number" id="a" value="100"></div>
      <div><label>From</label><select id="f"></select></div><div><label>To</label><select id="t"></select></div></div>
      <button class="btn" id="go">Convert</button><div class="output-box" id="out">Loading rates…</div>`;
    let rates={};
    fetch("https://open.er-api.com/v6/latest/USD").then(r=>r.json()).then(d=>{ rates=d.rates||{}; const codes=Object.keys(rates); const opts=codes.map(c=>`<option>${c}</option>`).join("");
      m.querySelector("#f").innerHTML=opts; m.querySelector("#t").innerHTML=opts; m.querySelector("#f").value="USD"; m.querySelector("#t").value="EUR"; conv();
    }).catch(()=>m.querySelector("#out").textContent="Couldn't load rates (offline?).");
    const conv=()=>{ const a=+m.querySelector("#a").value,f=m.querySelector("#f").value,t=m.querySelector("#t").value; if(!rates[f]||!rates[t])return; const usd=a/rates[f], res=usd*rates[t];
      m.querySelector("#out").innerHTML=`<b class="result-ok" style="font-size:20px">${res.toFixed(2)} ${t}</b><br><span class="hint">1 ${f} = ${(rates[t]/rates[f]).toFixed(4)} ${t}</span>`; };
    m.querySelector("#go").addEventListener("click",conv); m.addEventListener("input",e=>{if(e.target.matches("input,select"))conv();});
  };

  /* ---------- Generators ---------- */
  IMPL["business-name"] = (m) => {
    const pre=["Nova","Neo","Hyper","Quantum","Zen","Apex","Lumen","Vertex","Astra","Nexa","Flux","Cyber","Aero","Echo","Orbit"], suf=["ly","ify","hub","lab","forge","wave","core","genix","sync","verse","pulse","works","AI","io","mind"];
    m.innerHTML = `<label>Keyword</label><input type="text" id="k" value="cloud"><button class="btn" id="go">Generate 20</button> ${copyBtn()}<div class="output-box" id="out"></div>`;
    const gen=()=>{ const k=m.querySelector("#k").value.trim()||"app"; const cap=k[0].toUpperCase()+k.slice(1); const out=new Set();
      while(out.size<20){ const r=Math.random(); if(r<.33)out.add(pre[Math.random()*pre.length|0]+cap); else if(r<.66)out.add(cap+suf[Math.random()*suf.length|0]); else out.add(pre[Math.random()*pre.length|0]+suf[Math.random()*suf.length|0]); }
      m.querySelector("#out").textContent=[...out].join("   •   "); };
    m.querySelector("#go").addEventListener("click",gen); gen(); wireCopy(m,()=>m.querySelector("#out").textContent);
  };
  IMPL["invoice-generator"] = (m) => {
    m.innerHTML = `<div class="row"><div><label>Your business</label><input type="text" id="from" value="Acme Studio"></div><div><label>Bill to</label><input type="text" id="to" value="Client Co."></div></div>
      <div class="row"><div><label>Invoice #</label><input type="text" id="num" value="INV-001"></div><div><label>Tax %</label><input type="number" id="tax" value="0"></div></div>
      <label>Items (description, qty, price — one per line)</label><textarea id="items">Website design, 1, 1200\nHosting setup, 2, 150</textarea>
      <button class="btn" id="go">Generate PDF</button><div id="status" class="hint"></div>`;
    m.querySelector("#go").addEventListener("click", async ()=>{ const st=m.querySelector("#status");
      try{ const JS=await jsPDF(); const pdf=new JS({unit:"pt",format:"a4"}); pdf.setFontSize(22); pdf.text("INVOICE",50,60); pdf.setFontSize(11);
        pdf.text("From: "+m.querySelector("#from").value,50,100); pdf.text("Bill to: "+m.querySelector("#to").value,50,118); pdf.text("Invoice #: "+m.querySelector("#num").value,400,100);
        let y=160,total=0; pdf.setFont(undefined,"bold"); pdf.text("Description",50,y); pdf.text("Qty",330,y); pdf.text("Price",400,y); pdf.text("Amount",480,y); pdf.setFont(undefined,"normal"); y+=8; pdf.line(50,y,545,y); y+=20;
        m.querySelector("#items").value.split("\n").forEach(l=>{ const[d,q,p]=l.split(",").map(s=>s&&s.trim()); if(!d)return; const amt=(+q||0)*(+p||0); total+=amt; pdf.text(d.slice(0,40),50,y); pdf.text(String(q||""),330,y); pdf.text(String(p||""),400,y); pdf.text(amt.toFixed(2),480,y); y+=18; });
        const tax=total*(+m.querySelector("#tax").value)/100; y+=10; pdf.line(50,y,545,y); y+=22; pdf.text("Subtotal: "+total.toFixed(2),400,y); y+=18; pdf.text("Tax: "+tax.toFixed(2),400,y); y+=20; pdf.setFont(undefined,"bold"); pdf.text("TOTAL: "+(total+tax).toFixed(2),400,y);
        pdf.save(m.querySelector("#num").value+".pdf"); st.innerHTML='<span class="result-ok">✓ Invoice PDF downloaded.</span>';
      }catch(e){ st.innerHTML=`<span class="result-err">Error: ${esc(e.message)}</span>`; } });
  };
  IMPL["resume-builder"] = (m) => {
    m.innerHTML = `<div class="row"><div><label>Full name</label><input type="text" id="n" value="Jordan Lee"></div><div><label>Title</label><input type="text" id="t" value="Software Engineer"></div></div>
      <label>Contact</label><input type="text" id="c" value="jordan@email.com · +1 555 0100 · City">
      <label>Summary</label><textarea id="sum" style="min-height:60px">Engineer with 5 years building web apps.</textarea>
      <label>Experience (one per line)</label><textarea id="exp">Senior Dev — TechCorp (2022–now)\nDeveloper — StartCo (2019–2022)</textarea>
      <label>Skills (comma separated)</label><input type="text" id="sk" value="JavaScript, Python, React, SQL">
      <button class="btn" id="go">Generate PDF</button><div id="status" class="hint"></div>`;
    m.querySelector("#go").addEventListener("click", async ()=>{ const st=m.querySelector("#status");
      try{ const JS=await jsPDF(); const pdf=new JS({unit:"pt",format:"a4"}); pdf.setFontSize(24); pdf.text(m.querySelector("#n").value,50,60); pdf.setFontSize(13); pdf.setTextColor(90); pdf.text(m.querySelector("#t").value,50,80); pdf.setFontSize(10); pdf.text(m.querySelector("#c").value,50,98); pdf.setTextColor(0);
        let y=130; const sec=(t)=>{pdf.setFontSize(13);pdf.setFont(undefined,"bold");pdf.text(t,50,y);pdf.setFont(undefined,"normal");pdf.setFontSize(11);y+=8;pdf.line(50,y,545,y);y+=18;};
        sec("Summary"); pdf.splitTextToSize(m.querySelector("#sum").value,495).forEach(l=>{pdf.text(l,50,y);y+=15;}); y+=10;
        sec("Experience"); m.querySelector("#exp").value.split("\n").forEach(l=>{if(l.trim()){pdf.text("• "+l.trim(),50,y);y+=16;}}); y+=10;
        sec("Skills"); pdf.text(m.querySelector("#sk").value,50,y);
        pdf.save("resume.pdf"); st.innerHTML='<span class="result-ok">✓ Resume PDF downloaded.</span>';
      }catch(e){ st.innerHTML=`<span class="result-err">Error: ${esc(e.message)}</span>`; } });
  };

  /* ---------- SEO ---------- */
  IMPL["keyword-suggestion"] = (m) => {
    const mods=["best","top","how to","why","what is","cheap","free","near me","for beginners","vs","review","2026","alternative","tutorial","online","tips","guide","tool","software","examples"];
    m.innerHTML = `<label>Seed keyword</label><input type="text" id="k" value="ai tools"><button class="btn" id="go">Generate ideas</button> ${copyBtn()}<div class="output-box" id="out"></div><p class="hint">Idea expansion (no live volume — that's the server tier).</p>`;
    const gen=()=>{ const k=m.querySelector("#k").value.trim(); m.querySelector("#out").textContent=mods.map(mo=>mo.includes(" ")&&/^(how|why|what)/.test(mo)?`${mo} ${k}`:`${k} ${mo}`).concat(mods.map(mo=>`${mo} ${k}`)).filter((v,i,a)=>a.indexOf(v)===i).join("\n"); };
    m.querySelector("#go").addEventListener("click",gen); gen(); wireCopy(m,()=>m.querySelector("#out").textContent);
  };
  IMPL["backlink-checker"] = (m) => {
    m.innerHTML = `<label>Paste a page's HTML source</label><textarea id="in" placeholder="&lt;a href=...&gt;"></textarea><button class="btn" id="go">Extract links</button><div class="output-box" id="out"></div>
      <p class="hint">Analyzes links in pasted HTML (live crawling of other domains is blocked by browsers — that's the server tier).</p>`;
    m.querySelector("#go").addEventListener("click",()=>{ const html=m.querySelector("#in").value; const links=[...html.matchAll(/<a\s[^>]*href=["']([^"']+)["'][^>]*>(.*?)<\/a>/gis)];
      const ext=links.filter(l=>/^https?:\/\//.test(l[1])); m.querySelector("#out").innerHTML=links.length?`Total links: <b>${links.length}</b> • External: <b class="result-ok">${ext.length}</b><br><br>`+links.slice(0,40).map(l=>`→ ${esc(l[1])} <span class="hint">(${esc(l[2].replace(/<[^>]+>/g,"").trim().slice(0,30))||"no anchor"})</span>`).join("<br>"):"No links found."; });
  };

  /* ---------- Security ---------- */
  IMPL["bcrypt-generator"] = (m) => {
    m.innerHTML = `<label>Text to hash</label><input type="text" id="in" value="mypassword">
      <div class="row"><div><label>Rounds</label><input type="number" id="r" value="10"></div></div>
      <button class="btn" id="go">Generate bcrypt</button> ${copyBtn()}<div class="output-box" id="out"></div>
      <label style="margin-top:14px">Verify against a hash</label><input type="text" id="vh" placeholder="$2a$..."><button class="btn secondary small" id="vgo">Verify</button><div class="output-box" id="vout"></div>`;
    m.querySelector("#go").addEventListener("click", async ()=>{ const out=m.querySelector("#out"); try{ out.textContent="Hashing…"; const b=await bcryptLib(); out.textContent=b.hashSync(m.querySelector("#in").value,+m.querySelector("#r").value); }catch(e){ out.textContent="Error: "+e.message; } });
    m.querySelector("#vgo").addEventListener("click", async ()=>{ const v=m.querySelector("#vout"); try{ const b=await bcryptLib(); const ok=b.compareSync(m.querySelector("#in").value,m.querySelector("#vh").value); v.innerHTML=ok?'<span class="result-ok">✓ Match</span>':'<span class="result-err">✗ No match</span>'; }catch{ v.textContent="Invalid hash"; } });
    wireCopy(m,()=>m.querySelector("#out").textContent);
  };
  IMPL["htpasswd"] = (m) => {
    m.innerHTML = `<div class="row"><div><label>Username</label><input type="text" id="u" value="admin"></div><div><label>Password</label><input type="text" id="p" value="secret"></div></div>
      <button class="btn" id="go">Generate entry</button> ${copyBtn()}<div class="output-box" id="out"></div><p class="hint">bcrypt format ($2y). Paste into your .htpasswd file.</p>`;
    m.querySelector("#go").addEventListener("click", async ()=>{ const out=m.querySelector("#out"); try{ out.textContent="Hashing…"; const b=await bcryptLib(); const hash=b.hashSync(m.querySelector("#p").value,10).replace(/^\$2a\$/,"$2y$"); out.textContent=m.querySelector("#u").value+":"+hash; }catch(e){ out.textContent="Error: "+e.message; } });
    wireCopy(m,()=>m.querySelector("#out").textContent);
  };
  IMPL["ssl-checker"] = (m) => {
    m.innerHTML = `<label>Domain or https URL</label><input type="text" id="u" value="https://example.com"><button class="btn" id="go">Check</button><div class="output-box" id="out"></div>
      <p class="hint">Browser can test HTTPS reachability. Full certificate details (issuer, expiry) require the server tier.</p>`;
    m.querySelector("#go").addEventListener("click", async ()=>{ const out=m.querySelector("#out"); let url=m.querySelector("#u").value.trim(); if(!/^https?:/.test(url))url="https://"+url;
      out.textContent="Checking…"; const t=performance.now(); try{ await fetch(url,{mode:"no-cors"}); out.innerHTML=`<span class="result-ok">✓ HTTPS reachable</span> — responded in ${(performance.now()-t).toFixed(0)}ms<br><span class="hint">Certificate is valid enough for the browser to connect.</span>`; }catch(e){ out.innerHTML=`<span class="result-err">✗ Could not connect over HTTPS.</span>`; } });
  };

  /* ---------- Misc ---------- */
  IMPL["internet-speed"] = (m) => {
    m.innerHTML = `<div style="text-align:center"><button class="btn" id="go">🚀 Start speed test</button><div id="out" style="font-size:28px;font-family:var(--font-display);margin-top:16px"></div><div class="hint" id="sub"></div></div>`;
    m.querySelector("#go").addEventListener("click", async ()=>{ const out=m.querySelector("#out"), sub=m.querySelector("#sub"); out.textContent="…"; sub.textContent="Downloading test payload…";
      const url="https://speed.cloudflare.com/__down?bytes=10000000"; const t=performance.now();
      try{ const r=await fetch(url,{cache:"no-store"}); const blob=await r.blob(); const secs=(performance.now()-t)/1000; const mbps=(blob.size*8/1e6)/secs;
        out.innerHTML=`<span class="result-ok">${mbps.toFixed(1)} Mbps</span>`; sub.textContent=`Downloaded ${(blob.size/1e6).toFixed(1)} MB in ${secs.toFixed(2)}s`;
      }catch(e){ out.textContent="Failed"; sub.textContent="Network blocked the test."; } });
  };
})();

/* ================= PDF → IMAGE (pdf.js render) ================= */
(function () {
  const IMPL = window.TOOL_IMPL;
  const { esc, download, loadScript, dz } = window.__mtHelpers;
  async function pdfjs() { await loadScript("vendor/pdf.min.js"); window.pdfjsLib.GlobalWorkerOptions.workerSrc = "vendor/pdf.worker.min.js"; return window.pdfjsLib; }

  function pdfToImage(m, type, ext) {
    m.innerHTML = `<div class="dropzone">📡 Drop a PDF to render pages as ${ext.toUpperCase()}<input type="file" accept="application/pdf" hidden></div>
      <div class="row" style="margin-top:10px"><div><label>Quality (scale)</label><select id="sc"><option value="1">1x</option><option value="2" selected>2x</option><option value="3">3x</option></select></div></div>
      <div id="status" class="hint"></div><div id="res" class="cat-grid" style="margin-top:12px"></div>`;
    dz(m, async f => { const st=m.querySelector("#status"), res=m.querySelector("#res"); res.innerHTML="";
      try{ st.textContent="Rendering…"; const lib=await pdfjs(); const doc=await lib.getDocument({data:await f.arrayBuffer()}).promise; const scale=+m.querySelector("#sc").value;
        for(let p=1;p<=doc.numPages;p++){ st.textContent=`Rendering page ${p}/${doc.numPages}…`; const page=await doc.getPage(p); const vp=page.getViewport({scale});
          const c=document.createElement("canvas"); c.width=vp.width; c.height=vp.height; await page.render({canvasContext:c.getContext("2d"),viewport:vp}).promise;
          await new Promise(r=>c.toBlob(b=>{ const url=URL.createObjectURL(b); const card=document.createElement("div"); card.className="tool-card";
            card.innerHTML=`<img src="${url}" style="width:100%;border-radius:6px"><button class="btn small secondary" style="margin-top:8px">Page ${p} ⬇</button>`;
            card.querySelector("button").addEventListener("click",()=>download(`page-${p}.${ext}`,b)); res.appendChild(card); r(); }, type, .92)); }
        st.innerHTML=`<span class="result-ok">✓ ${doc.numPages} page(s) rendered.</span>`;
      }catch(e){ st.innerHTML=`<span class="result-err">Error: ${esc(e.message)}</span>`; } });
  }
  IMPL["pdf-to-jpg"] = (m) => pdfToImage(m, "image/jpeg", "jpg");
  IMPL["pdf-to-png"] = (m) => pdfToImage(m, "image/png", "png");
})();
