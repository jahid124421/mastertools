/* ============================================================
   MasterTools — Tool implementations (batch 2)
   Text, Converters, Generators, Calculators, Math, Health,
   Date/Time, Dev, SEO, Color, Security, Misc, Image extras.
   ============================================================ */
(function () {
  const IMPL = window.TOOL_IMPL;
  const esc = (s) => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const copyBtn = () => `<button class="btn secondary small" data-copy="1">📋 Copy</button>`;
  function wireCopy(m, get){ const b=m.querySelector('[data-copy]'); if(b) b.addEventListener("click",async()=>{try{await navigator.clipboard.writeText(get());b.textContent="✅ Copied";setTimeout(()=>b.textContent="📋 Copy",1200);}catch{b.textContent="Ctrl+C";}}); }
  function download(name, data, type){ const blob=data instanceof Blob?data:new Blob([data],{type}); const a=document.createElement("a"); a.href=URL.createObjectURL(blob); a.download=name; a.click(); setTimeout(()=>URL.revokeObjectURL(a.href),2000); }
  const sc={}; function loadScript(src){ if(sc[src])return sc[src]; sc[src]=new Promise((res,rej)=>{const s=document.createElement("script");s.src=src;s.onload=res;s.onerror=()=>rej(new Error("load fail"));document.head.appendChild(s);}); return sc[src]; }
  function loadImage(file){ return new Promise((res,rej)=>{const i=new Image();i.onload=()=>res(i);i.onerror=rej;i.src=URL.createObjectURL(file);}); }
  function dz(m,onFile,multiple){ const d=m.querySelector(".dropzone"),inp=m.querySelector("input[type=file]"); if(multiple)inp.multiple=true;
    d.addEventListener("click",()=>inp.click()); d.addEventListener("dragover",e=>{e.preventDefault();d.classList.add("drag");});
    d.addEventListener("dragleave",()=>d.classList.remove("drag")); d.addEventListener("drop",e=>{e.preventDefault();d.classList.remove("drag");onFile(multiple?e.dataTransfer.files:e.dataTransfer.files[0]);});
    inp.addEventListener("change",e=>onFile(multiple?e.target.files:e.target.files[0])); }

  /* Generic single-input text transform tool */
  function textTool(m, opts) {
    m.innerHTML = `<label>${opts.inLabel||"Input"}</label><textarea id="in" placeholder="${opts.ph||""}"></textarea>
      ${opts.controls||""}
      <button class="btn" id="go">${opts.btn||"Convert"}</button> ${copyBtn()}
      <label style="margin-top:12px">Result</label><div class="output-box" id="out"></div>`;
    const run=()=>{ try{ m.querySelector("#out").textContent = opts.fn(m.querySelector("#in").value, m); m.querySelector("#out").classList.remove("result-err"); }
      catch(e){ m.querySelector("#out").textContent="Error: "+e.message; m.querySelector("#out").classList.add("result-err"); } };
    m.querySelector("#go").addEventListener("click",run);
    if(opts.live!==false) m.querySelector("#in").addEventListener("input",run);
    wireCopy(m, ()=>m.querySelector("#out").textContent);
  }
  /* Generic calculator tool */
  function calc(m, fields, compute, note) {
    m.innerHTML = `<div class="row">${fields.map(f=>`<div><label>${f.l}</label>${f.opts?`<select id="${f.id}">${f.opts.map(o=>`<option value="${o.v??o}">${o.t??o}</option>`).join("")}</select>`:`<input type="${f.t||"number"}" id="${f.id}" value="${f.v??""}" ${f.step?`step="${f.step}"`:""}></input>`}</div>`).join("")}</div>
      <button class="btn" id="go">Calculate</button><div class="output-box" id="out"></div>${note?`<p class="hint">${note}</p>`:""}`;
    const V=id=>{ const e=m.querySelector("#"+id); return e.type==="number"?(parseFloat(e.value)||0):e.value; };
    const run=()=>{ try{ m.querySelector("#out").innerHTML=compute(V,m); }catch(e){ m.querySelector("#out").textContent=e.message; } };
    m.querySelector("#go").addEventListener("click",run); m.querySelectorAll("input,select").forEach(e=>e.addEventListener("input",run)); run();
  }
  window.__mtHelpers = { esc, copyBtn, wireCopy, download, loadScript, loadImage, dz, textTool, calc };

  /* ================= TEXT ================= */
  IMPL["find-replace"] = (m) => {
    m.innerHTML = `<label>Text</label><textarea id="in"></textarea>
      <div class="row"><div><label>Find</label><input type="text" id="f"></div><div><label>Replace with</label><input type="text" id="r"></div></div>
      <div class="checkbox-row"><input type="checkbox" id="re"><label for="re">Regex</label></div>
      <div class="checkbox-row"><input type="checkbox" id="ci"><label for="ci">Case-insensitive</label></div>
      <button class="btn" id="go">Replace All</button> ${copyBtn()}<div class="output-box" id="out"></div>`;
    m.querySelector("#go").addEventListener("click",()=>{ const t=m.querySelector("#in").value,f=m.querySelector("#f").value,r=m.querySelector("#r").value;
      let flags="g"+(m.querySelector("#ci").checked?"i":""); try{ const re=m.querySelector("#re").checked?new RegExp(f,flags):new RegExp(f.replace(/[.*+?^${}()|[\]\\]/g,"\\$&"),flags);
        m.querySelector("#out").textContent=t.replace(re,r); }catch(e){ m.querySelector("#out").textContent="Invalid regex"; } });
    wireCopy(m, ()=>m.querySelector("#out").textContent);
  };
  IMPL["sort-lines"] = (m) => textTool(m,{inLabel:"Lines",btn:"Sort",controls:`<div class="row"><select id="mode"><option value="az">A → Z</option><option value="za">Z → A</option><option value="len">By length</option><option value="num">Numeric</option><option value="rand">Random</option></select></div>`,fn:(v,m)=>{ let l=v.split("\n"); const mode=m.querySelector("#mode").value;
    if(mode==="az")l.sort((a,b)=>a.localeCompare(b)); else if(mode==="za")l.sort((a,b)=>b.localeCompare(a)); else if(mode==="len")l.sort((a,b)=>a.length-b.length);
    else if(mode==="num")l.sort((a,b)=>(parseFloat(a)||0)-(parseFloat(b)||0)); else if(mode==="rand")l.sort(()=>Math.random()-.5); return l.join("\n"); }});
  IMPL["remove-empty-lines"] = (m) => textTool(m,{fn:v=>v.split("\n").filter(l=>l.trim()).join("\n")});
  IMPL["remove-extra-spaces"] = (m) => textTool(m,{fn:v=>v.replace(/[ \t]+/g," ").replace(/ *\n */g,"\n").trim()});
  IMPL["remove-line-breaks"] = (m) => textTool(m,{fn:v=>v.replace(/\s*\n\s*/g," ").trim()});
  IMPL["add-line-numbers"] = (m) => textTool(m,{fn:v=>v.split("\n").map((l,i)=>(i+1)+". "+l).join("\n")});
  IMPL["whitespace-remover"] = (m) => textTool(m,{fn:v=>v.replace(/\s+/g,"")});
  IMPL["text-to-binary"] = (m) => textTool(m,{fn:v=>[...v].map(c=>c.charCodeAt(0).toString(2).padStart(8,"0")).join(" ")});
  IMPL["binary-to-text"] = (m) => textTool(m,{ph:"01001000 01101001",fn:v=>v.trim().split(/\s+/).map(b=>String.fromCharCode(parseInt(b,2))).join("")});
  IMPL["upside-down-text"] = (m) => { const map={a:"ɐ",b:"q",c:"ɔ",d:"p",e:"ǝ",f:"ɟ",g:"ƃ",h:"ɥ",i:"ᴉ",j:"ɾ",k:"ʞ",l:"l",m:"ɯ",n:"u",o:"o",p:"d",q:"b",r:"ɹ",s:"s",t:"ʇ",u:"n",v:"ʌ",w:"ʍ",x:"x",y:"ʎ",z:"z",".":"˙",",":"'","?":"¿","!":"¡","'":",","(":")",")":"("};
    textTool(m,{fn:v=>[...v.toLowerCase()].reverse().map(c=>map[c]||c).join("")}); };
  IMPL["text-to-morse"] = (m) => { const M={A:".-",B:"-...",C:"-.-.",D:"-..",E:".",F:"..-.",G:"--.",H:"....",I:"..",J:".---",K:"-.-",L:".-..",M:"--",N:"-.",O:"---",P:".--.",Q:"--.-",R:".-.",S:"...",T:"-",U:"..-",V:"...-",W:".--",X:"-..-",Y:"-.--",Z:"--..","0":"-----","1":".----","2":"..---","3":"...--","4":"....-","5":".....","6":"-....","7":"--...","8":"---..","9":"----.",".":".-.-.-",",":"--..--","?":"..--.."};
    const R={}; Object.entries(M).forEach(([k,v])=>R[v]=k);
    m.innerHTML=`<label>Text or Morse</label><textarea id="in"></textarea>
      <div class="row"><button class="btn small" id="enc">Text → Morse</button><button class="btn small secondary" id="dec">Morse → Text</button></div>
      <label style="margin-top:12px">Result ${copyBtn()}</label><div class="output-box" id="out"></div>`;
    m.querySelector("#enc").addEventListener("click",()=>m.querySelector("#out").textContent=[...m.querySelector("#in").value.toUpperCase()].map(c=>c===" "?"/":M[c]||"").join(" "));
    m.querySelector("#dec").addEventListener("click",()=>m.querySelector("#out").textContent=m.querySelector("#in").value.trim().split(" ").map(x=>x==="/"?" ":R[x]||"").join(""));
    wireCopy(m, ()=>m.querySelector("#out").textContent); };
  IMPL["count-letters"] = (m) => textTool(m,{btn:"Analyze",live:false,fn:v=>{ const f={}; for(const c of v) if(c.trim()) f[c]=(f[c]||0)+1;
    return Object.entries(f).sort((a,b)=>b[1]-a[1]).map(([c,n])=>`${c} : ${n}`).join("\n"); }});

  /* ================= CONVERTERS ================= */
  IMPL["json-to-xml"] = (m) => textTool(m,{inLabel:"JSON",ph:'{"user":{"name":"Al","age":30}}',btn:"To XML",live:false,fn:v=>{
    const toXml=(o,ind="")=>{ if(Array.isArray(o))return o.map(x=>toXml(x,ind)).join("");
      if(typeof o==="object"&&o) return Object.entries(o).map(([k,val])=>`${ind}<${k}>${typeof val==="object"?"\n"+toXml(val,ind+"  ")+ind:esc(String(val))}</${k}>\n`).join("");
      return esc(String(o)); }; return '<?xml version="1.0"?>\n'+toXml(JSON.parse(v)); }});
  IMPL["json-to-yaml"] = (m) => {
    const toYaml=(o,ind=0)=>{ const sp="  ".repeat(ind);
      if(Array.isArray(o))return o.map(x=>sp+"- "+toYaml(x,ind+1).trim()).join("\n");
      if(typeof o==="object"&&o)return Object.entries(o).map(([k,v])=>typeof v==="object"&&v?`${sp}${k}:\n${toYaml(v,ind+1)}`:`${sp}${k}: ${v}`).join("\n");
      return String(o); };
    textTool(m,{inLabel:"JSON",btn:"To YAML",live:false,fn:v=>toYaml(JSON.parse(v))});
  };
  IMPL["roman-numeral"] = (m) => {
    m.innerHTML=`<div class="row"><div><label>Number (1–3999)</label><input type="number" id="n" value="2026"></div>
      <div><label>Roman</label><input type="text" id="r" value="MMXXVI"></div></div><div class="output-box" id="out"></div>`;
    const map=[[1000,"M"],[900,"CM"],[500,"D"],[400,"CD"],[100,"C"],[90,"XC"],[50,"L"],[40,"XL"],[10,"X"],[9,"IX"],[5,"V"],[4,"IV"],[1,"I"]];
    const toR=n=>{ if(n<1||n>3999)return"1–3999 only"; let r=""; for(const[v,s]of map)while(n>=v){r+=s;n-=v;} return r; };
    m.querySelector("#n").addEventListener("input",e=>{ const r=toR(+e.target.value); m.querySelector("#r").value=r; m.querySelector("#out").textContent=e.target.value+" = "+r; });
    m.querySelector("#r").addEventListener("input",e=>{ const s=e.target.value.toUpperCase(); let n=0,i=0; for(const[v,sym]of map)while(s.startsWith(sym,i)){n+=v;i+=sym.length;} m.querySelector("#n").value=n; m.querySelector("#out").textContent=s+" = "+n; });
  };
  IMPL["query-parser"] = (m) => textTool(m,{inLabel:"URL or query string",ph:"https://x.com?a=1&b=hello",btn:"Parse",fn:v=>{ const q=v.includes("?")?v.split("?")[1]:v; const p=new URLSearchParams(q); return [...p.entries()].map(([k,val])=>`${k} = ${val}`).join("\n")||"No parameters."; }});
  IMPL["url-parser"] = (m) => textTool(m,{inLabel:"URL",ph:"https://user@host.com:8080/path?x=1#frag",btn:"Parse",fn:v=>{ const u=new URL(v); return `Protocol: ${u.protocol}\nHost: ${u.host}\nHostname: ${u.hostname}\nPort: ${u.port||"(default)"}\nPath: ${u.pathname}\nQuery: ${u.search}\nHash: ${u.hash}`; }});
  IMPL["text-to-speech"] = (m) => {
    m.innerHTML=`<label>Text to read aloud</label><textarea id="in">Hello from MasterTools!</textarea>
      <div class="row"><div><label>Voice</label><select id="voice"></select></div><div><label>Rate</label><input type="range" id="rate" min="0.5" max="2" step="0.1" value="1"></div></div>
      <button class="btn" id="go">🔊 Speak</button><button class="btn secondary" id="stop">Stop</button>`;
    const sel=m.querySelector("#voice"); const fill=()=>{ sel.innerHTML=speechSynthesis.getVoices().map((v,i)=>`<option value="${i}">${v.name} (${v.lang})</option>`).join(""); };
    fill(); speechSynthesis.onvoiceschanged=fill;
    m.querySelector("#go").addEventListener("click",()=>{ const u=new SpeechSynthesisUtterance(m.querySelector("#in").value); const vs=speechSynthesis.getVoices(); if(vs[sel.value])u.voice=vs[sel.value]; u.rate=+m.querySelector("#rate").value; speechSynthesis.speak(u); });
    m.querySelector("#stop").addEventListener("click",()=>speechSynthesis.cancel());
  };
  IMPL["speech-to-text"] = (m) => {
    m.innerHTML = `<p class="hint">Record from your microphone, then transcribe locally with AI (Whisper). Runs 100% in your browser — audio never leaves your device.</p>
      <button class="btn" id="rec">🎤 Start recording</button> <button class="btn secondary" id="stop" disabled>⏹ Stop & transcribe</button>
      <div id="prog"></div><div id="status" class="hint"></div>
      <label style="margin-top:12px">Transcript ${copyBtn()}</label><div class="output-box" id="out"></div>`;
    const st = m.querySelector("#status"), out = m.querySelector("#out");
    let mediaRec, chunks = [], stream;
    m.querySelector("#rec").addEventListener("click", async () => {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) { st.innerHTML = '<span class="result-err">This browser has no microphone access.</span>'; return; }
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        chunks = []; mediaRec = new MediaRecorder(stream);
        mediaRec.ondataavailable = e => e.data.size && chunks.push(e.data);
        mediaRec.onstop = async () => {
          if (stream) stream.getTracks().forEach(t => t.stop());
          const blob = new Blob(chunks, { type: (chunks[0] && chunks[0].type) || "audio/webm" });
          const eng = window.__mtEngines; const bar = eng ? eng.progressUI(m.querySelector("#prog")) : null;
          try {
            if (!eng) throw new Error("AI engine unavailable.");
            const asr = await eng.getASR(bar);
            if (bar) bar.busy("Transcribing…");
            const r = await asr(URL.createObjectURL(blob), { chunk_length_s: 30, stride_length_s: 5 });
            if (bar) bar.done("Done ✓");
            out.textContent = (r.text || "").trim() || "(no speech detected)";
            st.innerHTML = '<span class="result-ok">✓ Transcribed.</span>';
          } catch (err) { if (bar) bar.hide(); st.innerHTML = `<span class="result-err">Error: ${esc(err.message)}</span>`; }
        };
        mediaRec.start();
        st.textContent = "Recording… speak now, then click Stop.";
        m.querySelector("#rec").disabled = true; m.querySelector("#stop").disabled = false;
      } catch (e) { st.innerHTML = `<span class="result-err">Microphone blocked or unavailable: ${esc(e.message)}</span>`; }
    });
    m.querySelector("#stop").addEventListener("click", () => {
      if (mediaRec && mediaRec.state !== "inactive") { mediaRec.stop(); st.textContent = "Processing…"; m.querySelector("#rec").disabled = false; m.querySelector("#stop").disabled = true; }
    });
    wireCopy(m, () => out.textContent);
  };
})();

/* ================= GENERATORS + CALC + MATH + HEALTH ================= */
(function () {
  const IMPL = window.TOOL_IMPL;
  const { esc, copyBtn, wireCopy, loadScript, calc } = window.__mtHelpers;

  /* -- Generators -- */
  IMPL["barcode-generator"] = (m) => {
    m.innerHTML = `<label>Value</label><input type="text" id="in" value="MASTERTOOLS123">
      <button class="btn" id="go">Generate</button> <button class="btn secondary small" id="dl">⬇ PNG</button>
      <div style="background:#fff;padding:10px;border-radius:8px;margin-top:12px;display:inline-block"><svg id="bc"></svg></div>`;
    const gen=async()=>{ try{ await loadScript("vendor/jsbarcode.min.js");
      JsBarcode(m.querySelector("#bc"), m.querySelector("#in").value||" ", {format:"CODE128",displayValue:true}); }catch(e){ alert("Barcode lib failed to load."); } };
    m.querySelector("#go").addEventListener("click",gen);
    m.querySelector("#dl").addEventListener("click",()=>{ const svg=m.querySelector("#bc"); const xml=new XMLSerializer().serializeToString(svg);
      const img=new Image(); img.onload=()=>{ const c=document.createElement("canvas"); c.width=img.width;c.height=img.height; c.getContext("2d").drawImage(img,0,0); const a=document.createElement("a"); a.href=c.toDataURL(); a.download="barcode.png"; a.click(); };
      img.src="data:image/svg+xml;base64,"+btoa(xml); });
    gen();
  };
  IMPL["random-string"] = (m) => {
    m.innerHTML=`<div class="row"><div><label>Length</label><input type="number" id="len" value="16"></div><div><label>Count</label><input type="number" id="cnt" value="5"></div></div>
      <div class="checkbox-row"><input type="checkbox" id="sym"><label for="sym">Include symbols</label></div>
      <button class="btn" id="go">Generate</button> ${copyBtn()}<div class="output-box" id="out"></div>`;
    const gen=()=>{ let set="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"; if(m.querySelector("#sym").checked)set+="!@#$%^&*-_=+";
      const out=[]; for(let i=0;i<+m.querySelector("#cnt").value;i++){ const a=new Uint32Array(+m.querySelector("#len").value); crypto.getRandomValues(a); out.push([...a].map(x=>set[x%set.length]).join("")); } m.querySelector("#out").textContent=out.join("\n"); };
    m.querySelector("#go").addEventListener("click",gen); gen(); wireCopy(m,()=>m.querySelector("#out").textContent);
  };
  IMPL["pin-generator"] = (m) => {
    m.innerHTML=`<div class="row"><div><label>Digits</label><input type="number" id="len" value="4"></div><div><label>How many</label><input type="number" id="cnt" value="5"></div></div>
      <button class="btn" id="go">Generate</button> ${copyBtn()}<div class="output-box" id="out" style="font-size:18px"></div>`;
    const gen=()=>{ const out=[]; for(let i=0;i<+m.querySelector("#cnt").value;i++){ let p=""; const a=new Uint32Array(+m.querySelector("#len").value); crypto.getRandomValues(a); a.forEach(x=>p+=x%10); out.push(p); } m.querySelector("#out").textContent=out.join("\n"); };
    m.querySelector("#go").addEventListener("click",gen); gen(); wireCopy(m,()=>m.querySelector("#out").textContent);
  };
  IMPL["api-key-generator"] = (m) => {
    m.innerHTML=`<div class="row"><div><label>Prefix</label><input type="text" id="pre" value="sk_live"></div><div><label>Bytes</label><input type="number" id="b" value="24"></div></div>
      <button class="btn" id="go">Generate</button> ${copyBtn()}<div class="output-box" id="out"></div>`;
    const gen=()=>{ const a=new Uint8Array(+m.querySelector("#b").value); crypto.getRandomValues(a); const hex=[...a].map(x=>x.toString(16).padStart(2,"0")).join(""); m.querySelector("#out").textContent=(m.querySelector("#pre").value?m.querySelector("#pre").value+"_":"")+hex; };
    m.querySelector("#go").addEventListener("click",gen); gen(); wireCopy(m,()=>m.querySelector("#out").textContent);
  };
  IMPL["random-name"] = (m) => {
    const F=["Alex","Sam","Jordan","Taylor","Morgan","Casey","Riley","Jamie","Avery","Quinn","Noah","Mia","Liam","Emma","Olivia","Ethan"], L=["Smith","Johnson","Lee","Garcia","Brown","Davis","Kim","Patel","Nguyen","Khan","Silva","Rossi","Cohen","Ali"];
    m.innerHTML=`<div class="row"><div><label>How many</label><input type="number" id="n" value="8"></div></div><button class="btn" id="go">Generate</button> ${copyBtn()}<div class="output-box" id="out"></div>`;
    const gen=()=>{ const out=[]; for(let i=0;i<+m.querySelector("#n").value;i++)out.push(F[Math.floor(Math.random()*F.length)]+" "+L[Math.floor(Math.random()*L.length)]); m.querySelector("#out").textContent=out.join("\n"); };
    m.querySelector("#go").addEventListener("click",gen); gen(); wireCopy(m,()=>m.querySelector("#out").textContent);
  };
  IMPL["fake-credit-card"] = (m) => {
    m.innerHTML=`<div class="row"><div><label>Type</label><select id="t"><option value="4">Visa</option><option value="55">Mastercard</option><option value="34">Amex</option></select></div><div><label>How many</label><input type="number" id="n" value="5"></div></div>
      <button class="btn" id="go">Generate</button> ${copyBtn()}<div class="output-box" id="out"></div><p class="hint">Luhn-valid TEST numbers for QA only — not real cards.</p>`;
    const luhn=num=>{ let s=0,alt=false; for(let i=num.length-1;i>=0;i--){ let d=+num[i]; if(alt){d*=2;if(d>9)d-=9;} s+=d; alt=!alt; } return (10-s%10)%10; };
    const gen=()=>{ const pre=m.querySelector("#t").value, len=pre==="34"?15:16, out=[]; for(let i=0;i<+m.querySelector("#n").value;i++){ let n=pre; while(n.length<len-1)n+=Math.floor(Math.random()*10); n+=luhn(n); out.push(n.replace(/(.{4})/g,"$1 ").trim()); } m.querySelector("#out").textContent=out.join("\n"); };
    m.querySelector("#go").addEventListener("click",gen); gen(); wireCopy(m,()=>m.querySelector("#out").textContent);
  };

  /* -- Calculators -- */
  IMPL["percentage-change"] = (m) => calc(m,[{l:"From",id:"a",v:100},{l:"To",id:"b",v:150}],(V)=>{ const c=V("a")?(V("b")-V("a"))/V("a")*100:0; return `Change: <b class="result-ok">${c.toFixed(2)}%</b> (${c>=0?"increase":"decrease"})`; });
  IMPL["mortgage-calc"] = (m) => calc(m,[{l:"Home price",id:"p",v:300000},{l:"Down payment",id:"d",v:60000},{l:"Rate %",id:"r",v:6.5},{l:"Years",id:"y",v:30}],(V)=>{ const L=V("p")-V("d"),r=V("r")/1200,n=V("y")*12,pay=r?L*r*Math.pow(1+r,n)/(Math.pow(1+r,n)-1):L/n; return `Loan: <b>${L.toLocaleString()}</b><br>Monthly payment: <b class="result-ok">${pay.toFixed(2)}</b><br>Total interest: <b>${(pay*n-L).toFixed(2)}</b>`; });
  IMPL["roi-calc"] = (m) => calc(m,[{l:"Initial investment",id:"i",v:1000},{l:"Final value",id:"f",v:1500}],(V)=>{ const roi=V("i")?(V("f")-V("i"))/V("i")*100:0; return `Profit: <b>${(V("f")-V("i")).toLocaleString()}</b><br>ROI: <b class="result-ok">${roi.toFixed(2)}%</b>`; });
  IMPL["salary-calc"] = (m) => calc(m,[{l:"Amount",id:"a",v:25},{l:"Per",id:"p",opts:[{v:"hour",t:"Hour"},{v:"year",t:"Year"}]},{l:"Hours/week",id:"h",v:40}],(V)=>{ const annual=V("p")==="hour"?V("a")*V("h")*52:V("a"); const hourly=V("h")*52?annual/(V("h")*52):0; return `Annual: <b class="result-ok">${annual.toLocaleString(undefined,{maximumFractionDigits:0})}</b><br>Monthly: <b>${(annual/12).toFixed(0)}</b> • Weekly: <b>${(annual/52).toFixed(0)}</b> • Hourly: <b>${hourly.toFixed(2)}</b>`; });
  IMPL["sales-tax"] = (m) => calc(m,[{l:"Amount",id:"a",v:100},{l:"Tax %",id:"t",v:8},{l:"Mode",id:"m",opts:[{v:"add",t:"Add tax"},{v:"remove",t:"Remove tax"}]}],(V)=>{ if(V("m")==="add"){ const tax=V("a")*V("t")/100; return `Tax: <b>${tax.toFixed(2)}</b><br>Total: <b class="result-ok">${(V("a")+tax).toFixed(2)}</b>`; } const net=V("a")/(1+V("t")/100); return `Net: <b class="result-ok">${net.toFixed(2)}</b><br>Tax portion: <b>${(V("a")-net).toFixed(2)}</b>`; });
  IMPL["markup-calc"] = (m) => calc(m,[{l:"Cost",id:"c",v:40},{l:"Sell price",id:"s",v:100}],(V)=>{ const profit=V("s")-V("c"); return `Profit: <b>${profit.toFixed(2)}</b><br>Markup: <b>${V("c")?(profit/V("c")*100).toFixed(1):0}%</b><br>Margin: <b class="result-ok">${V("s")?(profit/V("s")*100).toFixed(1):0}%</b>`; });
  IMPL["fuel-cost"] = (m) => calc(m,[{l:"Distance",id:"d",v:500},{l:"Efficiency (km/L or mpg)",id:"e",v:15},{l:"Price / unit",id:"p",v:1.5}],(V)=>{ const fuel=V("e")?V("d")/V("e"):0; return `Fuel needed: <b>${fuel.toFixed(1)}</b><br>Total cost: <b class="result-ok">${(fuel*V("p")).toFixed(2)}</b>`; });
  IMPL["speed-distance-time"] = (m) => calc(m,[{l:"Distance",id:"d",v:100},{l:"Time (hours)",id:"t",v:2}],(V)=>{ const sp=V("t")?V("d")/V("t"):0; return `Speed: <b class="result-ok">${sp.toFixed(2)}</b> distance/hour`; },"Enter distance and time to get speed.");
  IMPL["average-calc"] = (m) => { m.innerHTML=`<label>Numbers (comma or space separated)</label><textarea id="in">10, 20, 30, 40</textarea><button class="btn" id="go">Calculate</button><div class="output-box" id="out"></div>`;
    m.querySelector("#go").addEventListener("click",()=>{ const n=(m.querySelector("#in").value.match(/-?\d+\.?\d*/g)||[]).map(Number); if(!n.length){m.querySelector("#out").textContent="No numbers.";return;}
      const sum=n.reduce((a,b)=>a+b,0),mean=sum/n.length,sorted=[...n].sort((a,b)=>a-b),med=sorted.length%2?sorted[(sorted.length-1)/2]:(sorted[sorted.length/2-1]+sorted[sorted.length/2])/2;
      m.querySelector("#out").innerHTML=`Count: <b>${n.length}</b> • Sum: <b>${sum}</b><br>Mean: <b class="result-ok">${mean.toFixed(4)}</b> • Median: <b>${med}</b><br>Min: <b>${Math.min(...n)}</b> • Max: <b>${Math.max(...n)}</b>`; });
    m.querySelector("#go").click(); };
  IMPL["gpa-calc"] = (m) => { m.innerHTML=`<label>Grades & credits (e.g. "A 3", one per line)</label><textarea id="in">A 3\nB 4\nA- 3\nB+ 2</textarea><button class="btn" id="go">Calculate GPA</button><div class="output-box" id="out"></div>`;
    const pts={"A+":4,"A":4,"A-":3.7,"B+":3.3,"B":3,"B-":2.7,"C+":2.3,"C":2,"C-":1.7,"D":1,"F":0};
    m.querySelector("#go").addEventListener("click",()=>{ let tp=0,tc=0; m.querySelector("#in").value.split("\n").forEach(l=>{ const [g,c]=l.trim().split(/\s+/); if(pts[g.toUpperCase()]!=null&&c){ tp+=pts[g.toUpperCase()]*(+c); tc+=+c; } });
      m.querySelector("#out").innerHTML=tc?`GPA: <b class="result-ok">${(tp/tc).toFixed(2)}</b> over <b>${tc}</b> credits`:"Check your format."; });
    m.querySelector("#go").click(); };
  IMPL["scientific-calc"] = (m) => {
    m.innerHTML=`<label>Expression</label><input type="text" id="in" value="sqrt(16) + 2^3 * sin(pi/2)">
      <button class="btn" id="go">Evaluate</button><div class="output-box" id="out" style="font-size:20px"></div>
      <p class="hint">Supports + - * / ^ ( ), sqrt, sin, cos, tan, log, ln, abs, pi, e.</p>`;
    m.querySelector("#go").addEventListener("click",()=>{ try{ let ex=m.querySelector("#in").value.toLowerCase()
        .replace(/\bpi\b/g,"Math.PI").replace(/\be\b/g,"Math.E").replace(/\^/g,"**")
        .replace(/\b(sqrt|sin|cos|tan|abs|log|ln)\(/g,(mt,f)=>f==="ln"?"Math.log(":f==="log"?"Math.log10(":"Math."+f+"(");
      if(/[^0-9+\-*/(). ,MathPIELloge]/.test(ex.replace(/Math\.\w+/g,""))) throw new Error("Invalid");
      const r=Function('"use strict";return('+ex+')')(); m.querySelector("#out").textContent="= "+r; }catch{ m.querySelector("#out").textContent="Invalid expression"; } });
    m.querySelector("#go").click();
  };

  /* -- Math -- */
  IMPL["prime-checker"] = (m) => calc(m,[{l:"Number",id:"n",v:97}],(V)=>{ const n=Math.floor(V("n")); if(n<2)return "Not prime."; for(let i=2;i*i<=n;i++)if(n%i===0)return `<b class="result-err">${n} is NOT prime</b> (divisible by ${i})`; return `<b class="result-ok">${n} is prime ✓</b>`; });
  IMPL["factorial-calc"] = (m) => calc(m,[{l:"n (0–170)",id:"n",v:10}],(V)=>{ let n=Math.floor(V("n")); if(n<0||n>170)return "0–170 only"; let f=1; for(let i=2;i<=n;i++)f*=i; return `${n}! = <b class="result-ok">${f}</b>`; });
  IMPL["gcd-lcm"] = (m) => calc(m,[{l:"A",id:"a",v:12},{l:"B",id:"b",v:18}],(V)=>{ const g=(x,y)=>y?g(y,x%y):x; const a=Math.abs(Math.floor(V("a"))),b=Math.abs(Math.floor(V("b"))); const gc=g(a,b); return `GCD: <b class="result-ok">${gc}</b><br>LCM: <b>${gc?a*b/gc:0}</b>`; });
  IMPL["quadratic-solver"] = (m) => calc(m,[{l:"a",id:"a",v:1},{l:"b",id:"b",v:-3},{l:"c",id:"c",v:2}],(V)=>{ const a=V("a"),b=V("b"),c=V("c"); if(!a)return "a can't be 0"; const d=b*b-4*a*c; if(d<0)return `No real roots (discriminant ${d.toFixed(2)})`; const r1=(-b+Math.sqrt(d))/(2*a),r2=(-b-Math.sqrt(d))/(2*a); return `x₁ = <b class="result-ok">${r1.toFixed(4)}</b><br>x₂ = <b class="result-ok">${r2.toFixed(4)}</b>`; });
  IMPL["standard-deviation"] = (m) => { m.innerHTML=`<label>Numbers</label><textarea id="in">4, 8, 15, 16, 23, 42</textarea><button class="btn" id="go">Calculate</button><div class="output-box" id="out"></div>`;
    m.querySelector("#go").addEventListener("click",()=>{ const n=(m.querySelector("#in").value.match(/-?\d+\.?\d*/g)||[]).map(Number); if(n.length<2){m.querySelector("#out").textContent="Need 2+ numbers.";return;}
      const mean=n.reduce((a,b)=>a+b,0)/n.length, variance=n.reduce((a,b)=>a+(b-mean)**2,0)/n.length;
      m.querySelector("#out").innerHTML=`Mean: <b>${mean.toFixed(4)}</b><br>Variance: <b>${variance.toFixed(4)}</b><br>Population SD: <b class="result-ok">${Math.sqrt(variance).toFixed(4)}</b><br>Sample SD: <b>${Math.sqrt(n.reduce((a,b)=>a+(b-mean)**2,0)/(n.length-1)).toFixed(4)}</b>`; });
    m.querySelector("#go").click(); };
  IMPL["rounding-calc"] = (m) => calc(m,[{l:"Number",id:"n",v:3.14159},{l:"Decimals",id:"d",v:2}],(V)=>{ const f=+V("n").toFixed(Math.max(0,Math.floor(V("d")))); return `Rounded: <b class="result-ok">${f}</b><br>Ceil: <b>${Math.ceil(V("n"))}</b> • Floor: <b>${Math.floor(V("n"))}</b> • Nearest int: <b>${Math.round(V("n"))}</b>`; });
  IMPL["fraction-calc"] = (m) => calc(m,[{l:"a",id:"a",v:1},{l:"/ b",id:"b",v:2},{l:"op",id:"op",opts:["+","-","×","÷"]},{l:"c",id:"c",v:1},{l:"/ d",id:"d",v:3}],(V)=>{ const g=(x,y)=>y?g(y,x%y):x; let num,den; const a=V("a"),b=V("b"),c=V("c"),d=V("d"),op=V("op");
    if(op==="+"){num=a*d+c*b;den=b*d;} else if(op==="-"){num=a*d-c*b;den=b*d;} else if(op==="×"){num=a*c;den=b*d;} else {num=a*d;den=b*c;}
    const gc=Math.abs(g(num,den))||1; return `= <b class="result-ok">${num/gc}/${den/gc}</b> = <b>${(num/den).toFixed(4)}</b>`; });
  IMPL["ratio-calc"] = (m) => calc(m,[{l:"A",id:"a",v:16},{l:"B",id:"b",v:9}],(V)=>{ const g=(x,y)=>y?g(y,x%y):x; const gc=g(Math.floor(V("a")),Math.floor(V("b")))||1; return `Simplified: <b class="result-ok">${V("a")/gc} : ${V("b")/gc}</b><br>Decimal: <b>${V("b")?(V("a")/V("b")).toFixed(4):0}</b>`; });
  IMPL["random-picker-num"] = (m) => calc(m,[{l:"Start",id:"s",v:1},{l:"End",id:"e",v:10},{l:"Step",id:"st",v:1}],(V)=>{ const out=[]; for(let i=V("s");i<=V("e")&&out.length<500;i+=(V("st")||1))out.push(i); return "<b>"+out.join(", ")+"</b>"; });
  IMPL["base-n-log"] = (m) => calc(m,[{l:"Value",id:"v",v:1000},{l:"Base (0=ln)",id:"b",v:10}],(V)=>{ const b=V("b"); const r=b===0?Math.log(V("v")):Math.log(V("v"))/Math.log(b); return `Result: <b class="result-ok">${r.toFixed(6)}</b><br>log10: <b>${Math.log10(V("v")).toFixed(4)}</b> • ln: <b>${Math.log(V("v")).toFixed(4)}</b>`; });

  /* -- Health -- */
  IMPL["bmr-calc"] = (m) => calc(m,[{l:"Sex",id:"s",opts:[{v:"m",t:"Male"},{v:"f",t:"Female"}]},{l:"Weight (kg)",id:"w",v:70},{l:"Height (cm)",id:"h",v:175},{l:"Age",id:"a",v:30}],(V)=>{ const bmr=10*V("w")+6.25*V("h")-5*V("a")+(V("s")==="m"?5:-161); return `BMR: <b class="result-ok">${bmr.toFixed(0)}</b> calories/day (at rest)`; });
  IMPL["tdee-calc"] = (m) => calc(m,[{l:"Sex",id:"s",opts:[{v:"m",t:"Male"},{v:"f",t:"Female"}]},{l:"Weight (kg)",id:"w",v:70},{l:"Height (cm)",id:"h",v:175},{l:"Age",id:"a",v:30},{l:"Activity",id:"act",opts:[{v:1.2,t:"Sedentary"},{v:1.375,t:"Light"},{v:1.55,t:"Moderate"},{v:1.725,t:"Active"},{v:1.9,t:"Very active"}]}],(V)=>{ const bmr=10*V("w")+6.25*V("h")-5*V("a")+(V("s")==="m"?5:-161); const tdee=bmr*V("act"); return `TDEE: <b class="result-ok">${tdee.toFixed(0)}</b> cal/day<br>Lose weight: <b>${(tdee-500).toFixed(0)}</b> • Gain: <b>${(tdee+500).toFixed(0)}</b>`; });
  IMPL["calorie-calc"] = (m) => IMPL["tdee-calc"](m);
  IMPL["macro-calc"] = (m) => calc(m,[{l:"Daily calories",id:"c",v:2000},{l:"Goal",id:"g",opts:[{v:"bal",t:"Balanced"},{v:"low",t:"Low carb"},{v:"high",t:"High protein"}]}],(V)=>{ let p,cb,f; const g=V("g"); if(g==="low"){p=.4;cb=.2;f=.4;}else if(g==="high"){p=.4;cb=.35;f=.25;}else{p=.3;cb=.4;f=.3;} const c=V("c"); return `Protein: <b class="result-ok">${(c*p/4).toFixed(0)}g</b><br>Carbs: <b>${(c*cb/4).toFixed(0)}g</b><br>Fat: <b>${(c*f/9).toFixed(0)}g</b>`; });
  IMPL["body-fat"] = (m) => calc(m,[{l:"Sex",id:"s",opts:[{v:"m",t:"Male"},{v:"f",t:"Female"}]},{l:"Weight (kg)",id:"w",v:70},{l:"Height (cm)",id:"h",v:175},{l:"Age",id:"a",v:30}],(V)=>{ const bmi=V("w")/((V("h")/100)**2); const bf=1.2*bmi+0.23*V("a")-(V("s")==="m"?16.2:5.4); return `Est. body fat: <b class="result-ok">${bf.toFixed(1)}%</b> <span class="hint">(BMI-based estimate)</span>`; });
  IMPL["ideal-weight"] = (m) => calc(m,[{l:"Sex",id:"s",opts:[{v:"m",t:"Male"},{v:"f",t:"Female"}]},{l:"Height (cm)",id:"h",v:175}],(V)=>{ const inches=V("h")/2.54, over=Math.max(0,inches-60); const base=V("s")==="m"?50:45.5; const dev=base+2.3*over; return `Ideal weight (Devine): <b class="result-ok">${dev.toFixed(1)} kg</b><br>Healthy BMI range: <b>${(18.5*(V("h")/100)**2).toFixed(0)}–${(24.9*(V("h")/100)**2).toFixed(0)} kg</b>`; });
  IMPL["water-intake"] = (m) => calc(m,[{l:"Weight (kg)",id:"w",v:70}],(V)=>{ return `Daily water: <b class="result-ok">${(V("w")*0.033).toFixed(1)} L</b> (≈ ${(V("w")*0.033*4.2).toFixed(0)} cups)`; });
  IMPL["one-rep-max"] = (m) => calc(m,[{l:"Weight lifted",id:"w",v:80},{l:"Reps",id:"r",v:5}],(V)=>{ const orm=V("w")*(1+V("r")/30); return `Estimated 1RM: <b class="result-ok">${orm.toFixed(1)}</b><br>90%: <b>${(orm*.9).toFixed(1)}</b> • 80%: <b>${(orm*.8).toFixed(1)}</b> • 70%: <b>${(orm*.7).toFixed(1)}</b>`; });
  IMPL["pregnancy-due"] = (m) => { m.innerHTML=`<label>First day of last period</label><input type="date" id="d"><div class="output-box" id="out"></div>`;
    m.querySelector("#d").addEventListener("input",e=>{ const d=new Date(e.target.value); if(isNaN(d))return; const due=new Date(d.getTime()+280*864e5); m.querySelector("#out").innerHTML=`Estimated due date: <b class="result-ok">${due.toDateString()}</b>`; }); };
  IMPL["heart-rate-zone"] = (m) => calc(m,[{l:"Age",id:"a",v:30}],(V)=>{ const mx=220-V("a"); return `Max HR: <b>${mx}</b> bpm<br>Fat burn (60-70%): <b class="result-ok">${(mx*.6).toFixed(0)}–${(mx*.7).toFixed(0)}</b><br>Cardio (70-85%): <b>${(mx*.7).toFixed(0)}–${(mx*.85).toFixed(0)}</b>`; });
})();

/* ================= DATE/TIME + DEV + SEO + COLOR + SECURITY + MISC + IMAGE/PDF ================= */
(function () {
  const IMPL = window.TOOL_IMPL;
  const { esc, copyBtn, wireCopy, download, loadScript, loadImage, dz, textTool, calc } = window.__mtHelpers;

  /* -- Date/Time -- */
  IMPL["countdown-timer"] = (m) => {
    m.innerHTML=`<label>Target date & time</label><input type="datetime-local" id="d"><div class="output-box" id="out" style="font-size:22px;text-align:center">Set a date.</div>`;
    let iv; m.querySelector("#d").addEventListener("input",e=>{ clearInterval(iv); const t=new Date(e.target.value).getTime(); if(isNaN(t))return;
      const tick=()=>{ const diff=t-Date.now(); if(diff<=0){m.querySelector("#out").innerHTML='🎉 <b class="result-ok">Time reached!</b>';clearInterval(iv);return;}
        const d=Math.floor(diff/864e5),h=Math.floor(diff/36e5)%24,mi=Math.floor(diff/6e4)%60,s=Math.floor(diff/1e3)%60;
        m.querySelector("#out").innerHTML=`<b>${d}</b>d <b>${h}</b>h <b>${mi}</b>m <b>${s}</b>s`; }; tick(); iv=setInterval(tick,1000); });
  };
  IMPL["days-until"] = (m) => { m.innerHTML=`<label>Event date</label><input type="date" id="d"><div class="output-box" id="out"></div>`;
    m.querySelector("#d").addEventListener("input",e=>{ const t=new Date(e.target.value); if(isNaN(t))return; const days=Math.ceil((t-new Date().setHours(0,0,0,0))/864e5);
      m.querySelector("#out").innerHTML=days>=0?`<b class="result-ok">${days}</b> days until that date`:`That was <b>${-days}</b> days ago`; }); };
  IMPL["add-subtract-days"] = (m) => { m.innerHTML=`<div class="row"><div><label>Start date</label><input type="date" id="d"></div><div><label>Days (+/-)</label><input type="number" id="n" value="30"></div></div><div class="output-box" id="out"></div>`;
    const run=()=>{ const d=new Date(m.querySelector("#d").value); if(isNaN(d))return; d.setDate(d.getDate()+ +m.querySelector("#n").value); m.querySelector("#out").innerHTML=`Result: <b class="result-ok">${d.toDateString()}</b>`; };
    m.querySelectorAll("input").forEach(e=>e.addEventListener("input",run)); };
  IMPL["week-number"] = (m) => { const d=new Date(); const oneJan=new Date(d.getFullYear(),0,1); const week=Math.ceil(((d-oneJan)/864e5+oneJan.getDay()+1)/7);
    m.innerHTML=`<div class="stat-grid"><div class="stat-box"><b>${week}</b><span>Week number</span></div><div class="stat-box"><b>${d.getFullYear()}</b><span>Year</span></div><div class="stat-box"><b>${Math.ceil((d-oneJan)/864e5)}</b><span>Day of year</span></div></div>`; };
  IMPL["timezone-converter"] = (m) => {
    const zones=["UTC","America/New_York","America/Los_Angeles","Europe/London","Europe/Paris","Asia/Dubai","Asia/Kolkata","Asia/Shanghai","Asia/Tokyo","Australia/Sydney"];
    m.innerHTML=`<div class="row"><div><label>Time</label><input type="datetime-local" id="t"></div><div><label>Zone</label><select id="z">${zones.map(z=>`<option>${z}</option>`).join("")}</select></div></div>
      <div class="output-box" id="out"></div>`;
    const run=()=>{ const v=m.querySelector("#t").value; if(!v)return; const d=new Date(v);
      m.querySelector("#out").innerHTML=zones.map(z=>{ try{ return `${z}: <b>${d.toLocaleString("en-US",{timeZone:z,dateStyle:"medium",timeStyle:"short"})}</b>`; }catch{return z+": —";} }).join("<br>"); };
    m.querySelectorAll("input,select").forEach(e=>e.addEventListener("input",run)); };
  IMPL["pomodoro"] = (m) => {
    m.innerHTML=`<div style="text-align:center"><div id="d" style="font-size:52px;font-family:monospace">25:00</div>
      <button class="btn" id="s">Start</button><button class="btn secondary" id="r">Reset</button>
      <div class="row" style="justify-content:center;margin-top:10px"><button class="btn small secondary" data-t="25">Work 25</button><button class="btn small secondary" data-t="5">Break 5</button><button class="btn small secondary" data-t="15">Long 15</button></div></div>`;
    let total=25*60,left=total,iv,running=false; const disp=()=>m.querySelector("#d").textContent=`${String(Math.floor(left/60)).padStart(2,"0")}:${String(left%60).padStart(2,"0")}`;
    m.querySelector("#s").addEventListener("click",e=>{ if(running){clearInterval(iv);e.target.textContent="Start";}else{iv=setInterval(()=>{if(left>0){left--;disp();}else{clearInterval(iv);alert("⏰ Time's up!");running=false;m.querySelector("#s").textContent="Start";}},1000);e.target.textContent="Pause";}running=!running; });
    m.querySelector("#r").addEventListener("click",()=>{clearInterval(iv);left=total;running=false;disp();m.querySelector("#s").textContent="Start";});
    m.querySelectorAll("[data-t]").forEach(b=>b.addEventListener("click",()=>{clearInterval(iv);total=left=+b.dataset.t*60;running=false;disp();m.querySelector("#s").textContent="Start";})); disp();
  };
  IMPL["work-hours"] = (m) => { m.innerHTML=`<div class="row"><div><label>Start</label><input type="time" id="s" value="09:00"></div><div><label>End</label><input type="time" id="e" value="17:30"></div><div><label>Break (min)</label><input type="number" id="b" value="30"></div></div><div class="output-box" id="out"></div>`;
    const run=()=>{ const [sh,sm]=m.querySelector("#s").value.split(":").map(Number),[eh,em]=m.querySelector("#e").value.split(":").map(Number); let mins=(eh*60+em)-(sh*60+sm)-(+m.querySelector("#b").value); if(mins<0)mins+=1440; m.querySelector("#out").innerHTML=`Worked: <b class="result-ok">${Math.floor(mins/60)}h ${mins%60}m</b> (${(mins/60).toFixed(2)} hours)`; };
    m.querySelectorAll("input").forEach(e=>e.addEventListener("input",run)); run(); };
  IMPL["birthday-countdown"] = (m) => { m.innerHTML=`<label>Your birthday</label><input type="date" id="d"><div class="output-box" id="out"></div>`;
    m.querySelector("#d").addEventListener("input",e=>{ const b=new Date(e.target.value); if(isNaN(b))return; const now=new Date(); let next=new Date(now.getFullYear(),b.getMonth(),b.getDate()); if(next<now)next.setFullYear(now.getFullYear()+1); const days=Math.ceil((next-now)/864e5); m.querySelector("#out").innerHTML=`🎂 <b class="result-ok">${days}</b> days until your next birthday (turning <b>${next.getFullYear()-b.getFullYear()}</b>)`; }); };

  /* -- Dev -- */
  IMPL["css-minify"] = (m) => textTool(m,{inLabel:"CSS",btn:"Minify",live:false,fn:v=>v.replace(/\/\*[\s\S]*?\*\//g,"").replace(/\s*([{}:;,])\s*/g,"$1").replace(/;}/g,"}").replace(/\s+/g," ").trim()});
  IMPL["sql-formatter"] = (m) => textTool(m,{inLabel:"SQL",ph:"select * from users where id=1",btn:"Format",live:false,fn:v=>{ let s=v.replace(/\s+/g," ").trim();
    ["SELECT","FROM","WHERE","AND","OR","ORDER BY","GROUP BY","HAVING","LEFT JOIN","RIGHT JOIN","INNER JOIN","JOIN","LIMIT","INSERT INTO","VALUES","UPDATE","SET","DELETE FROM"].forEach(k=>{ s=s.replace(new RegExp("\\b"+k.replace(" ","\\s+")+"\\b","gi"),"\n"+k); }); return s.trim(); }});
  IMPL["escape-string"] = (m) => { m.innerHTML=`<label>Text</label><textarea id="in"></textarea>
    <div class="row"><button class="btn small" id="e">Escape</button><button class="btn small secondary" id="u">Unescape</button></div>
    <label style="margin-top:12px">Result ${copyBtn()}</label><div class="output-box" id="out"></div>`;
    m.querySelector("#e").addEventListener("click",()=>m.querySelector("#out").textContent=JSON.stringify(m.querySelector("#in").value).slice(1,-1));
    m.querySelector("#u").addEventListener("click",()=>{try{m.querySelector("#out").textContent=JSON.parse('"'+m.querySelector("#in").value+'"');}catch{m.querySelector("#out").textContent="Invalid";}});
    wireCopy(m, ()=>m.querySelector("#out").textContent); };
  IMPL["http-status"] = (m) => {
    const codes={200:"OK",201:"Created",204:"No Content",301:"Moved Permanently",302:"Found",304:"Not Modified",400:"Bad Request",401:"Unauthorized",403:"Forbidden",404:"Not Found",405:"Method Not Allowed",408:"Request Timeout",409:"Conflict",418:"I'm a teapot",422:"Unprocessable Entity",429:"Too Many Requests",500:"Internal Server Error",502:"Bad Gateway",503:"Service Unavailable",504:"Gateway Timeout"};
    m.innerHTML=`<label>Search code or name</label><input type="text" id="q" placeholder="404"><div class="output-box" id="out"></div>`;
    const run=()=>{ const q=m.querySelector("#q").value.toLowerCase(); m.querySelector("#out").innerHTML=Object.entries(codes).filter(([c,n])=>!q||c.includes(q)||n.toLowerCase().includes(q)).map(([c,n])=>`<b>${c}</b> — ${n}`).join("<br>"); };
    m.querySelector("#q").addEventListener("input",run); run(); };
  IMPL["user-agent"] = (m) => { const ua=navigator.userAgent; m.innerHTML=`<div class="output-box">${esc(ua)}</div>
    <div class="stat-grid" style="margin-top:12px">
      <div class="stat-box"><b style="font-size:14px">${navigator.platform||"—"}</b><span>Platform</span></div>
      <div class="stat-box"><b style="font-size:14px">${navigator.language}</b><span>Language</span></div>
      <div class="stat-box"><b style="font-size:14px">${navigator.hardwareConcurrency||"—"}</b><span>CPU cores</span></div>
      <div class="stat-box"><b style="font-size:14px">${navigator.onLine?"Online":"Offline"}</b><span>Status</span></div></div>`; };
  IMPL["color-code-dev"] = (m) => window.TOOL_IMPL["color-converter"](m);
  IMPL["diff-checker"] = (m) => window.TOOL_IMPL["text-diff"](m);

  /* -- SEO -- */
  function ogTool(m, prefix) {
    m.innerHTML=`<label>Title</label><input type="text" id="t" value="My Page">
      <label>Description</label><input type="text" id="d" value="A great page.">
      <label>Image URL</label><input type="text" id="i" value="https://example.com/img.jpg">
      <label>Page URL</label><input type="text" id="u" value="https://example.com">
      <label style="margin-top:12px">Tags ${copyBtn()}</label><div class="output-box" id="out"></div>`;
    const run=()=>{ const t=esc(m.querySelector("#t").value),d=esc(m.querySelector("#d").value),i=esc(m.querySelector("#i").value),u=esc(m.querySelector("#u").value);
      m.querySelector("#out").textContent = prefix==="og"
        ? `<meta property="og:title" content="${t}">\n<meta property="og:description" content="${d}">\n<meta property="og:image" content="${i}">\n<meta property="og:url" content="${u}">\n<meta property="og:type" content="website">`
        : `<meta name="twitter:card" content="summary_large_image">\n<meta name="twitter:title" content="${t}">\n<meta name="twitter:description" content="${d}">\n<meta name="twitter:image" content="${i}">`; };
    m.querySelectorAll("input").forEach(e=>e.addEventListener("input",run)); run();
    wireCopy(m, ()=>m.querySelector("#out").textContent);
  }
  IMPL["og-generator"] = (m) => ogTool(m,"og");
  IMPL["twitter-card"] = (m) => ogTool(m,"tw");
  IMPL["htaccess-redirect"] = (m) => { m.innerHTML=`<div class="row"><div><label>Old path</label><input type="text" id="o" value="/old-page"></div><div><label>New URL</label><input type="text" id="n" value="https://example.com/new"></div></div>
    <label style="margin-top:12px">.htaccess ${copyBtn()}</label><div class="output-box" id="out"></div>`;
    const run=()=>m.querySelector("#out").textContent=`Redirect 301 ${m.querySelector("#o").value} ${m.querySelector("#n").value}`;
    m.querySelectorAll("input").forEach(e=>e.addEventListener("input",run)); run(); wireCopy(m,()=>m.querySelector("#out").textContent); };

  /* -- Color/Design -- */
  IMPL["border-radius"] = (m) => { m.innerHTML=`<div class="row"><div><label>TL</label><input type="number" id="tl" value="20"></div><div><label>TR</label><input type="number" id="tr" value="20"></div><div><label>BR</label><input type="number" id="br" value="20"></div><div><label>BL</label><input type="number" id="bl" value="20"></div></div>
    <div style="text-align:center;padding:24px"><div id="box" style="width:150px;height:100px;background:linear-gradient(135deg,var(--accent),var(--accent-2));margin:0 auto"></div></div>
    <label>CSS ${copyBtn()}</label><div class="output-box" id="out"></div>`;
    const run=()=>{ const css=`${m.querySelector("#tl").value}px ${m.querySelector("#tr").value}px ${m.querySelector("#br").value}px ${m.querySelector("#bl").value}px`; m.querySelector("#box").style.borderRadius=css; m.querySelector("#out").textContent="border-radius: "+css+";"; };
    m.querySelectorAll("input").forEach(e=>e.addEventListener("input",run)); run(); wireCopy(m,()=>m.querySelector("#out").textContent); };
  IMPL["css-triangle"] = (m) => { m.innerHTML=`<div class="row"><div><label>Direction</label><select id="dir"><option>up</option><option>down</option><option>left</option><option>right</option></select></div><div><label>Size</label><input type="number" id="sz" value="40"></div><input type="color" id="col" value="#4f46e5"></div>
    <div style="text-align:center;padding:24px"><div id="box"></div></div><label>CSS ${copyBtn()}</label><div class="output-box" id="out"></div>`;
    const run=()=>{ const s=+m.querySelector("#sz").value,c=m.querySelector("#col").value,dir=m.querySelector("#dir").value;
      const map={up:`border-left:${s}px solid transparent;border-right:${s}px solid transparent;border-bottom:${s}px solid ${c}`,down:`border-left:${s}px solid transparent;border-right:${s}px solid transparent;border-top:${s}px solid ${c}`,left:`border-top:${s}px solid transparent;border-bottom:${s}px solid transparent;border-right:${s}px solid ${c}`,right:`border-top:${s}px solid transparent;border-bottom:${s}px solid transparent;border-left:${s}px solid ${c}`};
      m.querySelector("#box").style.cssText="width:0;height:0;margin:0 auto;"+map[dir]; m.querySelector("#out").textContent="width:0;height:0;\n"+map[dir].replace(/;/g,";\n")+";"; };
    m.querySelectorAll("input,select").forEach(e=>e.addEventListener("input",run)); run(); wireCopy(m,()=>m.querySelector("#out").textContent); };
  IMPL["color-blindness"] = (m) => {
    m.innerHTML=`<label>Pick a color</label><input type="color" id="c" value="#e11d48">
      <div id="out" class="cat-grid" style="margin-top:14px"></div>`;
    const sims={Normal:[1,0,0,0,1,0,0,0,1],Protanopia:[.567,.433,0,.558,.442,0,0,.242,.758],Deuteranopia:[.625,.375,0,.7,.3,0,0,.3,.7],Tritanopia:[.95,.05,0,0,.433,.567,0,.475,.525]};
    const run=()=>{ const h=m.querySelector("#c").value; const r=parseInt(h.substr(1,2),16),g=parseInt(h.substr(3,2),16),b=parseInt(h.substr(5,2),16);
      m.querySelector("#out").innerHTML=Object.entries(sims).map(([n,mtx])=>{ const nr=Math.round(mtx[0]*r+mtx[1]*g+mtx[2]*b),ng=Math.round(mtx[3]*r+mtx[4]*g+mtx[5]*b),nb=Math.round(mtx[6]*r+mtx[7]*g+mtx[8]*b);
        const col=`rgb(${nr},${ng},${nb})`; return `<div class="tool-card"><div style="height:50px;background:${col};border-radius:8px"></div><div class="tc-name">${n}</div><div class="tc-desc">${col}</div></div>`; }).join(""); };
    m.querySelector("#c").addEventListener("input",run); run(); };

  /* -- Security -- */
  IMPL["rot13"] = (m) => textTool(m,{fn:v=>v.replace(/[a-z]/gi,c=>String.fromCharCode((c<="Z"?90:122)>=(c.charCodeAt(0)+13)?c.charCodeAt(0)+13:c.charCodeAt(0)-13))});
  IMPL["caesar-cipher"] = (m) => textTool(m,{inLabel:"Text",controls:`<div class="row"><div><label>Shift</label><input type="number" id="shift" value="3"></div></div>`,fn:(v,m)=>{ const s=((+m.querySelector("#shift").value)%26+26)%26; return v.replace(/[a-z]/gi,c=>{ const base=c<="Z"?65:97; return String.fromCharCode((c.charCodeAt(0)-base+s)%26+base); }); }});
  IMPL["md5-generator"] = (m) => {
    // Compact MD5 implementation
    function md5(str){ function rl(n,c){return(n<<c)|(n>>>(32-c));} function au(x,y){var l=(x&0xFFFF)+(y&0xFFFF),msw=(x>>16)+(y>>16)+(l>>16);return(msw<<16)|(l&0xFFFF);}
      function ff(a,b,c,d,x,s,t){return au(rl(au(au(a,(b&c)|(~b&d)),au(x,t)),s),b);} function gg(a,b,c,d,x,s,t){return au(rl(au(au(a,(b&d)|(c&~d)),au(x,t)),s),b);}
      function hh(a,b,c,d,x,s,t){return au(rl(au(au(a,b^c^d),au(x,t)),s),b);} function ii(a,b,c,d,x,s,t){return au(rl(au(au(a,c^(b|~d)),au(x,t)),s),b);}
      function tb(s){var b=[],m=(1<<8)-1;for(var i=0;i<s.length*8;i+=8)b[i>>5]|=(s.charCodeAt(i/8)&m)<<(i%32);return b;}
      function bh(b){var h="0123456789abcdef",s="";for(var i=0;i<b.length*4;i++)s+=h.charAt((b[i>>2]>>((i%4)*8+4))&0xF)+h.charAt((b[i>>2]>>((i%4)*8))&0xF);return s;}
      var x=tb(unescape(encodeURIComponent(str))),len=str.length*8; x[len>>5]|=0x80<<(len%32); x[(((len+64)>>>9)<<4)+14]=len;
      var a=1732584193,b=-271733879,c=-1732584194,d=271733878;
      for(var i=0;i<x.length;i+=16){var oa=a,ob=b,oc=c,od=d;
        a=ff(a,b,c,d,x[i],7,-680876936);d=ff(d,a,b,c,x[i+1],12,-389564586);c=ff(c,d,a,b,x[i+2],17,606105819);b=ff(b,c,d,a,x[i+3],22,-1044525330);
        a=ff(a,b,c,d,x[i+4],7,-176418897);d=ff(d,a,b,c,x[i+5],12,1200080426);c=ff(c,d,a,b,x[i+6],17,-1473231341);b=ff(b,c,d,a,x[i+7],22,-45705983);
        a=ff(a,b,c,d,x[i+8],7,1770035416);d=ff(d,a,b,c,x[i+9],12,-1958414417);c=ff(c,d,a,b,x[i+10],17,-42063);b=ff(b,c,d,a,x[i+11],22,-1990404162);
        a=ff(a,b,c,d,x[i+12],7,1804603682);d=ff(d,a,b,c,x[i+13],12,-40341101);c=ff(c,d,a,b,x[i+14],17,-1502002290);b=ff(b,c,d,a,x[i+15],22,1236535329);
        a=gg(a,b,c,d,x[i+1],5,-165796510);d=gg(d,a,b,c,x[i+6],9,-1069501632);c=gg(c,d,a,b,x[i+11],14,643717713);b=gg(b,c,d,a,x[i],20,-373897302);
        a=gg(a,b,c,d,x[i+5],5,-701558691);d=gg(d,a,b,c,x[i+10],9,38016083);c=gg(c,d,a,b,x[i+15],14,-660478335);b=gg(b,c,d,a,x[i+4],20,-405537848);
        a=gg(a,b,c,d,x[i+9],5,568446438);d=gg(d,a,b,c,x[i+14],9,-1019803690);c=gg(c,d,a,b,x[i+3],14,-187363961);b=gg(b,c,d,a,x[i+8],20,1163531501);
        a=gg(a,b,c,d,x[i+13],5,-1444681467);d=gg(d,a,b,c,x[i+2],9,-51403784);c=gg(c,d,a,b,x[i+7],14,1735328473);b=gg(b,c,d,a,x[i+12],20,-1926607734);
        a=hh(a,b,c,d,x[i+5],4,-378558);d=hh(d,a,b,c,x[i+8],11,-2022574463);c=hh(c,d,a,b,x[i+11],16,1839030562);b=hh(b,c,d,a,x[i+14],23,-35309556);
        a=hh(a,b,c,d,x[i+1],4,-1530992060);d=hh(d,a,b,c,x[i+4],11,1272893353);c=hh(c,d,a,b,x[i+7],16,-155497632);b=hh(b,c,d,a,x[i+10],23,-1094730640);
        a=hh(a,b,c,d,x[i+13],4,681279174);d=hh(d,a,b,c,x[i],11,-358537222);c=hh(c,d,a,b,x[i+3],16,-722521979);b=hh(b,c,d,a,x[i+6],23,76029189);
        a=hh(a,b,c,d,x[i+9],4,-640364487);d=hh(d,a,b,c,x[i+12],11,-421815835);c=hh(c,d,a,b,x[i+15],16,530742520);b=hh(b,c,d,a,x[i+2],23,-995338651);
        a=ii(a,b,c,d,x[i],6,-198630844);d=ii(d,a,b,c,x[i+7],10,1126891415);c=ii(c,d,a,b,x[i+14],15,-1416354905);b=ii(b,c,d,a,x[i+5],21,-57434055);
        a=ii(a,b,c,d,x[i+12],6,1700485571);d=ii(d,a,b,c,x[i+3],10,-1894986606);c=ii(c,d,a,b,x[i+10],15,-1051523);b=ii(b,c,d,a,x[i+1],21,-2054922799);
        a=ii(a,b,c,d,x[i+8],6,1873313359);d=ii(d,a,b,c,x[i+15],10,-30611744);c=ii(c,d,a,b,x[i+6],15,-1560198380);b=ii(b,c,d,a,x[i+13],21,1309151649);
        a=ii(a,b,c,d,x[i+4],6,-145523070);d=ii(d,a,b,c,x[i+11],10,-1120210379);c=ii(c,d,a,b,x[i+2],15,718787259);b=ii(b,c,d,a,x[i+9],21,-343485551);
        a=au(a,oa);b=au(b,ob);c=au(c,oc);d=au(d,od);}
      return bh([a,b,c,d]); }
    textTool(m,{inLabel:"Text",btn:"Generate MD5",live:false,fn:v=>md5(v)});
  };
  IMPL["aes-encrypt"] = (m) => {
    m.innerHTML=`<label>Text</label><textarea id="in"></textarea>
      <label>Password</label><input type="text" id="pw" placeholder="secret passphrase">
      <div class="row"><button class="btn small" id="enc">🔒 Encrypt</button><button class="btn small secondary" id="dec">🔓 Decrypt</button></div>
      <label style="margin-top:12px">Result ${copyBtn()}</label><div class="output-box" id="out"></div>`;
    async function key(pw,salt){ const km=await crypto.subtle.importKey("raw",new TextEncoder().encode(pw),"PBKDF2",false,["deriveKey"]);
      return crypto.subtle.deriveKey({name:"PBKDF2",salt,iterations:100000,hash:"SHA-256"},km,{name:"AES-GCM",length:256},false,["encrypt","decrypt"]); }
    m.querySelector("#enc").addEventListener("click",async()=>{ try{ const salt=crypto.getRandomValues(new Uint8Array(16)),iv=crypto.getRandomValues(new Uint8Array(12));
      const k=await key(m.querySelector("#pw").value,salt); const ct=await crypto.subtle.encrypt({name:"AES-GCM",iv},k,new TextEncoder().encode(m.querySelector("#in").value));
      const buf=new Uint8Array([...salt,...iv,...new Uint8Array(ct)]); m.querySelector("#out").textContent=btoa(String.fromCharCode(...buf)); }catch(e){ m.querySelector("#out").textContent="Error: "+e.message; } });
    m.querySelector("#dec").addEventListener("click",async()=>{ try{ const buf=Uint8Array.from(atob(m.querySelector("#in").value.trim()),c=>c.charCodeAt(0));
      const salt=buf.slice(0,16),iv=buf.slice(16,28),data=buf.slice(28); const k=await key(m.querySelector("#pw").value,salt);
      const pt=await crypto.subtle.decrypt({name:"AES-GCM",iv},k,data); m.querySelector("#out").textContent=new TextDecoder().decode(pt); }catch{ m.querySelector("#out").textContent="❌ Wrong password or corrupt data"; } });
    wireCopy(m, ()=>m.querySelector("#out").textContent);
  };

  /* -- Misc -- */
  IMPL["todo-list"] = (m) => {
    m.innerHTML=`<div class="row"><input type="text" id="in" placeholder="Add a task..."><button class="btn" id="add">Add</button></div><div id="list" style="margin-top:12px"></div>`;
    let items=JSON.parse(localStorage.getItem("mt-todo")||"[]");
    const save=()=>localStorage.setItem("mt-todo",JSON.stringify(items));
    const render=()=>{ m.querySelector("#list").innerHTML=items.map((it,i)=>`<div class="checkbox-row" style="justify-content:space-between;background:var(--surface-2);padding:8px 12px;border-radius:8px;margin-bottom:6px">
      <label style="margin:0;${it.done?"text-decoration:line-through;opacity:.6":""}"><input type="checkbox" ${it.done?"checked":""} data-i="${i}"> ${esc(it.t)}</label>
      <button class="btn small secondary" data-del="${i}">✕</button></div>`).join("")||'<p class="hint">No tasks yet.</p>';
      m.querySelectorAll("[data-i]").forEach(c=>c.addEventListener("change",e=>{items[e.target.dataset.i].done=e.target.checked;save();render();}));
      m.querySelectorAll("[data-del]").forEach(b=>b.addEventListener("click",e=>{items.splice(+e.target.dataset.del,1);save();render();})); };
    const add=()=>{ const v=m.querySelector("#in").value.trim(); if(v){items.push({t:v,done:false});m.querySelector("#in").value="";save();render();} };
    m.querySelector("#add").addEventListener("click",add); m.querySelector("#in").addEventListener("keydown",e=>{if(e.key==="Enter")add();}); render();
  };
  IMPL["name-picker"] = (m) => window.TOOL_IMPL["wheel-picker"](m);
  IMPL["tally-counter"] = (m) => { m.innerHTML=`<div style="text-align:center"><div id="c" style="font-size:64px;font-weight:800">0</div>
    <button class="btn" id="plus" style="font-size:20px;padding:14px 28px">＋</button><button class="btn secondary" id="minus">－</button><button class="btn secondary" id="reset">Reset</button></div>`;
    let n=0; const d=m.querySelector("#c"); m.querySelector("#plus").addEventListener("click",()=>d.textContent=++n); m.querySelector("#minus").addEventListener("click",()=>d.textContent=n>0?--n:0); m.querySelector("#reset").addEventListener("click",()=>d.textContent=n=0); };
  IMPL["whats-my-ip"] = (m) => { m.innerHTML=`<div class="output-box" id="out">Fetching your IP…</div><p class="hint">This one calls a public IP API (ipify).</p>`;
    fetch("https://api.ipify.org?format=json").then(r=>r.json()).then(d=>m.querySelector("#out").innerHTML=`Your public IP: <b class="result-ok" style="font-size:20px">${esc(d.ip)}</b>`).catch(()=>m.querySelector("#out").textContent="Couldn't fetch IP (offline or blocked)."); };
  IMPL["browser-info"] = (m) => window.TOOL_IMPL["user-agent"](m);

  /* -- Image extras -- */
  IMPL["base64-to-image"] = (m) => { m.innerHTML=`<label>Paste Base64 or data URI</label><textarea id="in" placeholder="data:image/png;base64,..."></textarea><button class="btn" id="go">Show</button><div id="res"></div>`;
    m.querySelector("#go").addEventListener("click",()=>{ let v=m.querySelector("#in").value.trim(); if(!v.startsWith("data:"))v="data:image/png;base64,"+v; m.querySelector("#res").innerHTML=`<img class="preview" src="${v}"><br><a class="btn small secondary" href="${v}" download="image.png">⬇ Download</a>`; }); };
  IMPL["photo-filters"] = (m) => { m.innerHTML=`<div class="dropzone">📁 Drop an image<input type="file" accept="image/*" hidden></div>
    <div class="row" style="margin-top:10px">${["none","grayscale","sepia","invert","brightness","contrast","blur"].map(f=>`<button class="btn small secondary" data-f="${f}">${f}</button>`).join("")}</div>
    <canvas id="cv" style="max-width:100%;margin-top:12px;border-radius:10px;display:none"></canvas><br><button class="btn" id="dl" style="display:none">⬇ Download</button>`;
    let img; const cv=m.querySelector("#cv"),ctx=cv.getContext("2d"); const apply=f=>{ if(!img)return; cv.width=img.width;cv.height=img.height;
      const map={none:"none",grayscale:"grayscale(1)",sepia:"sepia(1)",invert:"invert(1)",brightness:"brightness(1.4)",contrast:"contrast(1.6)",blur:"blur(3px)"}; ctx.filter=map[f]; ctx.drawImage(img,0,0); ctx.filter="none"; };
    dz(m, async f=>{ img=await window.__mtHelpers.loadImage(f); cv.style.display="block"; m.querySelector("#dl").style.display="inline-flex"; apply("none"); });
    m.querySelectorAll("[data-f]").forEach(b=>b.addEventListener("click",()=>apply(b.dataset.f)));
    m.querySelector("#dl").addEventListener("click",()=>cv.toBlob(b=>download("filtered.png",b))); };
  IMPL["rotate-image"] = (m) => { m.innerHTML=`<div class="dropzone">📁 Drop an image<input type="file" accept="image/*" hidden></div>
    <div class="row" style="margin-top:10px"><button class="btn small" data-a="90">↻ 90°</button><button class="btn small" data-a="-90">↺ -90°</button><button class="btn small" data-a="180">180°</button><button class="btn small secondary" data-flip="h">Flip H</button><button class="btn small secondary" data-flip="v">Flip V</button></div>
    <canvas id="cv" style="max-width:100%;margin-top:12px;border-radius:10px;display:none"></canvas><br><button class="btn" id="dl" style="display:none">⬇ Download</button>`;
    let img,rot=0,fh=1,fv=1; const cv=m.querySelector("#cv"),ctx=cv.getContext("2d");
    const draw=()=>{ if(!img)return; const r=rot%180!==0; cv.width=r?img.height:img.width; cv.height=r?img.width:img.height; ctx.save(); ctx.translate(cv.width/2,cv.height/2); ctx.rotate(rot*Math.PI/180); ctx.scale(fh,fv); ctx.drawImage(img,-img.width/2,-img.height/2); ctx.restore(); };
    dz(m, async f=>{ img=await window.__mtHelpers.loadImage(f); rot=0;fh=fv=1; cv.style.display="block"; m.querySelector("#dl").style.display="inline-flex"; draw(); });
    m.querySelectorAll("[data-a]").forEach(b=>b.addEventListener("click",()=>{rot=(rot+ +b.dataset.a+360)%360;draw();}));
    m.querySelectorAll("[data-flip]").forEach(b=>b.addEventListener("click",()=>{if(b.dataset.flip==="h")fh*=-1;else fv*=-1;draw();}));
    m.querySelector("#dl").addEventListener("click",()=>cv.toBlob(b=>download("rotated.png",b))); };
  IMPL["circle-crop"] = (m) => { m.innerHTML=`<div class="dropzone">📁 Drop a photo<input type="file" accept="image/*" hidden></div><canvas id="cv" style="max-width:100%;margin-top:12px;display:none"></canvas><br><button class="btn" id="dl" style="display:none">⬇ Download PNG</button>`;
    let img; const cv=m.querySelector("#cv"),ctx=cv.getContext("2d");
    dz(m, async f=>{ img=await window.__mtHelpers.loadImage(f); const s=Math.min(img.width,img.height); cv.width=cv.height=s; ctx.clearRect(0,0,s,s); ctx.save(); ctx.beginPath(); ctx.arc(s/2,s/2,s/2,0,7); ctx.clip(); ctx.drawImage(img,(s-img.width)/2,(s-img.height)/2); ctx.restore(); cv.style.display="block"; m.querySelector("#dl").style.display="inline-flex"; });
    m.querySelector("#dl").addEventListener("click",()=>cv.toBlob(b=>download("circle.png",b))); };
  IMPL["pixelate-image"] = (m) => { m.innerHTML=`<div class="dropzone">📁 Drop an image<input type="file" accept="image/*" hidden></div>
    <label style="margin-top:10px">Pixel size: <span id="pv">12</span></label><input type="range" id="p" min="2" max="40" value="12"><br>
    <canvas id="cv" style="max-width:100%;margin-top:12px;border-radius:10px;display:none"></canvas><br><button class="btn" id="dl" style="display:none">⬇ Download</button>`;
    let img; const cv=m.querySelector("#cv"),ctx=cv.getContext("2d"); ctx.imageSmoothingEnabled=false;
    const draw=()=>{ if(!img)return; const px=+m.querySelector("#p").value; cv.width=img.width;cv.height=img.height; const w=Math.max(1,img.width/px),h=Math.max(1,img.height/px);
      ctx.drawImage(img,0,0,w,h); ctx.drawImage(cv,0,0,w,h,0,0,cv.width,cv.height); };
    dz(m, async f=>{ img=await window.__mtHelpers.loadImage(f); cv.style.display="block"; m.querySelector("#dl").style.display="inline-flex"; draw(); });
    m.querySelector("#p").addEventListener("input",e=>{m.querySelector("#pv").textContent=e.target.value;draw();});
    m.querySelector("#dl").addEventListener("click",()=>cv.toBlob(b=>download("pixelated.png",b))); };
  IMPL["image-crop"] = (m) => { m.innerHTML=`<div class="dropzone">📁 Drop an image<input type="file" accept="image/*" hidden></div>
    <div class="row" style="margin-top:10px"><div><label>X</label><input type="number" id="x" value="0"></div><div><label>Y</label><input type="number" id="y" value="0"></div><div><label>Width</label><input type="number" id="w" value="200"></div><div><label>Height</label><input type="number" id="h" value="200"></div></div>
    <button class="btn" id="go">Crop & Download</button><div id="res"></div>`;
    let img; dz(m, async f=>{ img=await window.__mtHelpers.loadImage(f); m.querySelector("#w").value=Math.min(200,img.width); m.querySelector("#h").value=Math.min(200,img.height); m.querySelector("#res").innerHTML=`<p class="hint">Loaded ${img.width}×${img.height}. Set crop box and download.</p>`; });
    m.querySelector("#go").addEventListener("click",()=>{ if(!img)return alert("Upload first."); const c=document.createElement("canvas"),w=+m.querySelector("#w").value,h=+m.querySelector("#h").value; c.width=w;c.height=h; c.getContext("2d").drawImage(img,+m.querySelector("#x").value,+m.querySelector("#y").value,w,h,0,0,w,h); c.toBlob(b=>download("cropped.png",b)); }); };
  IMPL["image-watermark"] = (m) => { m.innerHTML=`<div class="dropzone">📁 Drop an image<input type="file" accept="image/*" hidden></div>
    <label style="margin-top:10px">Watermark text</label><input type="text" id="wm" value="© MasterTools">
    <canvas id="cv" style="max-width:100%;margin-top:12px;border-radius:10px;display:none"></canvas><br><button class="btn" id="dl" style="display:none">⬇ Download</button>`;
    let img; const cv=m.querySelector("#cv"),ctx=cv.getContext("2d");
    const draw=()=>{ if(!img)return; cv.width=img.width;cv.height=img.height; ctx.drawImage(img,0,0); ctx.font=`${img.width/20}px sans-serif`; ctx.fillStyle="rgba(255,255,255,.5)"; ctx.textAlign="right"; ctx.fillText(m.querySelector("#wm").value,img.width-20,img.height-20); };
    dz(m, async f=>{ img=await window.__mtHelpers.loadImage(f); cv.style.display="block"; m.querySelector("#dl").style.display="inline-flex"; draw(); });
    m.querySelector("#wm").addEventListener("input",draw); m.querySelector("#dl").addEventListener("click",()=>cv.toBlob(b=>download("watermarked.png",b))); };
  IMPL["exif-viewer"] = (m) => { m.innerHTML=`<div class="dropzone">📁 Drop an image<input type="file" accept="image/*" hidden></div><div class="output-box" id="out">Upload to see file & image info.</div>`;
    dz(m, async f=>{ const img=await window.__mtHelpers.loadImage(f); m.querySelector("#out").innerHTML=`Name: <b>${esc(f.name)}</b><br>Type: <b>${f.type}</b><br>Size: <b>${(f.size/1024).toFixed(1)} KB</b><br>Dimensions: <b>${img.width} × ${img.height}</b><br>Modified: <b>${new Date(f.lastModified).toLocaleString()}</b><br><span class="hint">Full EXIF (camera, GPS) parsing = premium add-on.</span>`; }); };

  /* -- PDF extras -- */
  const PDFLIB="vendor/pdf-lib.min.js";
  IMPL["png-to-pdf"] = (m) => window.TOOL_IMPL["jpg-to-pdf"](m);
  IMPL["rotate-pdf"] = (m) => { m.innerHTML=`<div class="dropzone">📁 Drop a PDF<input type="file" accept="application/pdf" hidden></div>
    <div class="row" style="margin-top:10px"><div><label>Rotate all pages</label><select id="deg"><option>90</option><option>180</option><option>270</option></select></div></div>
    <button class="btn" id="go" disabled>Rotate & Download</button>`;
    let file; dz(m, f=>{file=f; m.querySelector("#go").disabled=false;});
    m.querySelector("#go").addEventListener("click",async()=>{ try{ await loadScript(PDFLIB); const doc=await PDFLib.PDFDocument.load(await file.arrayBuffer());
      doc.getPages().forEach(p=>p.setRotation(PDFLib.degrees(+m.querySelector("#deg").value))); const out=await doc.save(); download("rotated.pdf",new Blob([out],{type:"application/pdf"})); }catch(e){ alert("Error: "+e.message); } }); };

  /* -- Social extras -- */
  IMPL["twitter-char-counter"] = (m) => { m.innerHTML=`<label>Tweet</label><textarea id="in"></textarea><div class="output-box" id="out"></div>`;
    m.querySelector("#in").addEventListener("input",e=>{ const len=e.target.value.length,left=280-len; m.querySelector("#out").innerHTML=`<b class="${left<0?"result-err":"result-ok"}">${len}</b> / 280 &nbsp; (${left} left)${len>0?` • ~${Math.ceil(len/280)} tweet(s)`:""}`; });
    m.querySelector("#in").dispatchEvent(new Event("input")); };
  IMPL["engagement-rate"] = (m) => calc(m,[{l:"Followers",id:"f",v:10000},{l:"Avg likes",id:"l",v:400},{l:"Avg comments",id:"c",v:35}],(V)=>{ const er=V("f")?(V("l")+V("c"))/V("f")*100:0; const rating=er>6?"excellent":er>3?"good":er>1?"average":"low"; return `Engagement rate: <b class="result-ok">${er.toFixed(2)}%</b> (${rating})`; });
  IMPL["youtube-money-calc"] = (m) => calc(m,[{l:"Monthly views",id:"v",v:100000},{l:"CPM ($)",id:"c",v:4}],(V)=>{ const monetized=V("v")*0.6; const rev=monetized/1000*V("c"); return `Est. monthly: <b class="result-ok">$${rev.toFixed(0)}</b><br>Yearly: <b>$${(rev*12).toFixed(0)}</b><br><span class="hint">Assumes ~60% monetized views. Actual varies a lot.</span>`; });
  IMPL["hashtag-generator"] = (m) => { m.innerHTML=`<label>Keywords (comma separated)</label><input type="text" id="in" value="travel, sunset, beach">
    <button class="btn" id="go">Generate</button> ${copyBtn()}<div class="output-box" id="out"></div>`;
    const suf=["","photography","love","life","daily","gram","lover","ig","insta","vibes","2026","community","addict"];
    m.querySelector("#go").addEventListener("click",()=>{ const words=m.querySelector("#in").value.split(",").map(w=>w.trim().replace(/\s+/g,"")).filter(Boolean); const tags=new Set();
      words.forEach(w=>suf.forEach(s=>tags.add("#"+w.toLowerCase()+s))); m.querySelector("#out").textContent=[...tags].slice(0,30).join(" "); });
    m.querySelector("#go").click(); wireCopy(m,()=>m.querySelector("#out").textContent); };
})();
