/* =========================
   Gem Catalog – Static + Google Sheet CSV
   (higher-contrast active filters + outlined inputs/selects)
   ========================= */

/* ----- CONFIG ----- */
const SHEET_SOURCES = [
  { name: "Sheet 1",
    url: "https://docs.google.com/spreadsheets/d/e/2PACX-1vSrskicOCBNl6ntgcdNHGwTRaTQLrhMYsjHoYwiPAPyc72-awi5MQ9Rl5-jccvqI34RCNvDqJw2dz-T/pub?gid=1810937305&single=true&output=csv" },
];
const ALWAYS_FRESH = true;

/* Column aliases */
const COLS = {
  originalId: ["Original Stock ID","Original ID","Orig ID","Item No."],
  stockId: ["Stock ID","SKU","ID","Stock","Product Number"],
  stone: ["Stone","Gem","Gemstone","Species","Variety","Gemstone Type"],
  origin: ["Origin","Country of Origin","Origin/Country","Gemstone Origin"],
  shade: ["Shade","Tone","Gemstone Color Intensity"],
  color: ["Color","Colour","Hue","Body Color"],
  clarity: ["Clarity","Clarity Grade","Gemstone Clarity"],
  shape: ["Shape","Cut","Shape/Cut","Gemstone Shape"],
  sizeMm: ["Size (MM)","Size","Measurements (mm)","Dimensions","Dims (mm)","LxWxH (mm)","Length (mm)","Width (mm)","Height (mm)","Gemstone Dimensions"],
  sizeRange: ["Mix Size Range","Size Range"],
  caratTotal: ["Stone Weight - Carat Total","Carat","Weight","Carat Weight","Weight (ct)","Total Carat Weight","TCW","Gemstone Carat / Weight"],
  pieces: ["Pieces","Qty","Quantity","Gemstone Pcs"],
  purchasePerCt: ["Purchase Price per Carat","Purchase $/ct"],
  b2bPerCt: ["B2B Price/Ct","B2B - Price/Ct","B2B $/ct"],
  retailPerCt: ["Retail Price/Ct","Retail - Price/Ct","Retail $/ct","Price per ct","Price/Ct","Sale Price"],
  totalPrice: ["Total USD Amount","Total Amount (USD)","Total Price"],
  status: ["Status","Availability","In Stock","Available"],
  imageUrl: ["Image URL","Image","Img","Image Link","Photo URL","Picture"],
  certificate: ["Certificates","Certificate"],
  certificateNumber: ["Certificate Number","Cert #"],
  treatment: ["Gemstone Treatment","Treatment"],
  source: ["Gemstone Source","Source"],
  media: ["Media","Media URLs","Gallery","Images","Photos","Videos","Media Links"],
};

/* Colors */
const COLOR_MAP = {
  red:"#DC2626", ruby:"#E11D48", pink:"#EC4899", fuchsia:"#C026D3",
  purple:"#7C3AED", violet:"#8B5CF6", blue:"#2563EB", teal:"#0D9488",
  green:"#16A34A", yellow:"#F59E0B", orange:"#EA580C", brown:"#92400E",
  champagne:"#E8D6B0", peach:"#F4A38C", black:"#111827", white:"#F3F4F6",
  colorless:"#F3F4F6", gray:"#9CA3AF",
};
const STONE_DEFAULT = {
  sapphire:"#2563EB", ruby:"#E11D48", emerald:"#16A34A", diamond:"#F3F4F6",
  spinel:"#7C3AED", tourmaline:"#10B981", garnet:"#B91C1C", topaz:"#60A5FA",
};

/* ----- UTIL (regex-free) ----- */
const Q = (id) => document.getElementById(id);
const normKey = (s) => String(s || "").trim().toLowerCase();
const byAliases = (row, aliases) => {
  for (const a of aliases) {
    const key = Object.keys(row).find((k) => normKey(k) === normKey(a)) || null;
    if (key && row[key] != null && row[key] !== "") return row[key];
  }
  return "";
};

// number parsing without regex
const stripNonNumeric = (v) => {
  const s = String(v ?? ""); let out = "";
  for (let i=0;i<s.length;i++){ const ch=s[i]; if((ch>="0"&&ch<="9")||ch==="."||ch==="-" ) out+=ch; }
  return out;
};
const parseCurrency = (v) => { if (v==null) return null; const f=parseFloat(stripNonNumeric(v)); return Number.isFinite(f)?f:null; };
const parseNumber = parseCurrency;

// media split without regex
function safeSplitMedia(raw){
  const s=String(raw||""); const out=[]; let t="";
  for(let i=0;i<s.length;i++){ const c=s[i];
    if(c===','||c===';'||c==='|'||c==='\n'||c==='\r'){ if(t.trim()) out.push(t.trim()); t=""; }
    else t+=c;
  }
  if(t.trim()) out.push(t.trim());
  return out;
}
function isVideo(u){ const s=(u||"").toLowerCase().split("?")[0]; return [".mp4",".webm",".ogg",".mov"].some(ext=>s.endsWith(ext)); }

const fmtMoney = (n) => (n == null ? "-" : `$${n.toLocaleString(undefined,{maximumFractionDigits:0})}`);
const fmtCarat = (n) => (n == null ? "-" : `${n.toFixed(2)} ct`);
const colorHex = (stone,color)=>{ const c=normKey(color); if(COLOR_MAP[c]) return COLOR_MAP[c]; const s=normKey(stone); return STONE_DEFAULT[s] || "#CBD5E1"; };

/* Quality scoring */
function gradeLabel(score){ if(score>=4.75) return "AAAAA"; if(score>=3.75) return "AAAA"; if(score>=2.75) return "AAA"; if(score>=1.75) return "AA"; return "A"; }
function clarityScore(c){ const m={IF:5,VVS:4.5,VVVS:4.5,VS:4,SI:3,I1:2,OPAQUE:1.5,TRANSLUCENT:2.5,TRANSPARENT:3}; return m[(c||"").toUpperCase()]||3; }
function treatmentPenalty(t){ const s=(t||"").toLowerCase(); const has=(k)=>s.indexOf(k)!==-1; if(!s||has("none")||has("unheated")||has("no oil")||has("untreated")) return +0.5; if(has("minor oil")) return -0.2; if(has("moderate")||has("irradiated")||has("glass")||has("stabilized")) return -0.6; return -0.3; }
function calcQuality(x){ let base=clarityScore(x.clarity); base+=treatmentPenalty(x.treatment); return Math.max(1,Math.min(5,base)); }

/* ----- STATE ----- */
let ALL=[], VIEW=[], FACETS={};
const state = {
  q:"", stone:new Set(), color:new Set(), shape:new Set(), clarity:new Set(),
  origin:new Set(), shade:new Set(), status:new Set(), certificate:new Set(),
  treatment:new Set(), pair:new Set(),
  minCt:null, maxCt:null, minTotal:null, maxTotal:null,
  qualityMin:1, qualityMax:5, sort:"featured", page:1, perPage:24,
};

/* ----- LOAD CSV ----- */
function showSkeletons(n=12){ const grid=Q("grid"); if(!grid) return; grid.innerHTML=""; const tpl=Q("skeletonTpl")?.content; if(!tpl) return; for(let i=0;i<n;i++) grid.appendChild(tpl.cloneNode(true)); }
function loadCSV(url){ return new Promise((resolve,reject)=>{ if(!window.Papa){ reject(new Error("PapaParse not loaded")); return; } Papa.parse(url,{download:true,header:true,skipEmptyLines:true,complete:(r)=>resolve(r.data),error:reject}); }); }
function mapRow(row){
  const o = {
    originalId: byAliases(row,COLS.originalId),
    stockId: byAliases(row,COLS.stockId),
    stone: byAliases(row,COLS.stone),
    origin: byAliases(row,COLS.origin),
    shade: byAliases(row,COLS.shade),
    color: byAliases(row,COLS.color),
    clarity: byAliases(row,COLS.clarity),
    shape: byAliases(row,COLS.shape),
    sizeMm: byAliases(row,COLS.sizeMm),
    sizeRange: byAliases(row,COLS.sizeRange),
    caratTotal: parseNumber(byAliases(row,COLS.caratTotal)),
    pieces: parseNumber(byAliases(row,COLS.pieces)),
    purchasePerCt: parseCurrency(byAliases(row,COLS.purchasePerCt)),
    b2bPerCt: parseCurrency(byAliases(row,COLS.b2bPerCt)),
    retailPerCt: parseCurrency(byAliases(row,COLS.retailPerCt)),
    totalPrice: parseCurrency(byAliases(row,COLS.totalPrice)),
    status: byAliases(row,COLS.status) || "On-Site",
    imageUrl: byAliases(row,COLS.imageUrl),
    certificate: byAliases(row,COLS.certificate),
    certificateNumber: byAliases(row,COLS.certificateNumber),
    treatment: byAliases(row,COLS.treatment),
    source: byAliases(row,COLS.source),
    media: (() => {
      const raw = byAliases(row, COLS.media);
      const list = safeSplitMedia(raw ? raw : byAliases(row, COLS.imageUrl));
      return list.length ? list : [];
    })(),
  };
  if (o.totalPrice == null && o.caratTotal && o.retailPerCt) o.totalPrice = +(o.caratTotal * o.retailPerCt).toFixed(2);
  if (!o.media.length && o.imageUrl) o.media = [o.imageUrl];
  o.isPair = (o.pieces || 1) >= 2 ? "Pair" : "Single";
  o.qualityScore = calcQuality(o);
  o.qualityLabel = gradeLabel(o.qualityScore);
  return o;
}
async function loadData(){
  showSkeletons();
  try{
    const firstURL=SHEET_SOURCES[0]?.url||"#"; const csvLink=Q("csvLink"); if(csvLink) csvLink.href=firstURL;
    const parts=await Promise.all(SHEET_SOURCES.map(async src=>{ const url=ALWAYS_FRESH&&src.url ? src.url+(src.url.includes("?")?"&":"?")+"cb="+Date.now() : src.url; const rows=await loadCSV(url); return rows.map(r=>({...r,__tab:src.name||"Sheet"})); }));
    const rows=parts.flat();
    ALL = rows.map(r=>{ const m=mapRow(r); m.tab=r.__tab||"Sheet"; return m; });

    buildFacets();
    renderToolbar();
    readURL();
    applyFilters();
  }catch(err){
    console.error("CSV load failed:", err);
    const grid=Q("grid"); if(grid) grid.innerHTML="<div class='col-span-full text-center text-sm text-red-600'>Failed to load data. Check your published CSV URL.</div>";
  }
}

/* ----- FACETS ----- */
const uniq=(list)=>[...new Set(list.filter(Boolean).map(v=>String(v).trim()))].sort((a,b)=>a.localeCompare(b));

function facetSection(id,title,items,renderLabel){
  const wrap=document.createElement("div"); wrap.className="border-t border-gray-200 pt-3";
  const details=document.createElement("details"); details.open=true; details.className="group";
  const summary=document.createElement("summary"); summary.className="cursor-pointer list-none flex items-center justify-between text-sm font-medium text-gray-900 select-none";
  summary.innerHTML=`<span>${title}</span><span class="text-gray-400 group-open:rotate-180 transition"><i data-feather="chevron-down"></i></span>`;
  const box=document.createElement("div"); box.className="mt-2 flex flex-wrap gap-2";
  items.forEach(val=>{
    const btn=document.createElement("button");
    btn.className="filter-btn";
    btn.dataset.facet=id;
    btn.dataset.value=val;
    btn.addEventListener("click",()=>{ toggleSet(state[id],val); state.page=1; applyFilters(); });
    if(renderLabel){ btn.appendChild(renderLabel(val)); } else { btn.textContent=val; }
    box.appendChild(btn);
  });
  details.appendChild(summary); details.appendChild(box); wrap.appendChild(details);
  return wrap;
}

function renderFacetsInto(containerId, suffix="", { includeStone=true } = {}){
  const facetsEl=Q(containerId); if(!facetsEl) return; facetsEl.innerHTML="";
  if(includeStone) facetsEl.appendChild(facetSection("stone","Stone",FACETS.stone));
  facetsEl.appendChild(facetSection("color","Color",FACETS.color,(val)=>{ const span=document.createElement("span"); const dot=document.createElement("span"); dot.className="swatch"; dot.style.background=colorHex(null,val); const txt=document.createElement("span"); txt.textContent=val; span.append(dot,txt); return span; }));
  facetsEl.appendChild(facetSection("shape","Shape",FACETS.shape));
  facetsEl.appendChild(facetSection("clarity","Clarity",FACETS.clarity));
  facetsEl.appendChild(facetSection("origin","Origin",FACETS.origin));
  facetsEl.appendChild(facetSection("shade","Shade",FACETS.shade));
  facetsEl.appendChild(facetSection("status","Status",FACETS.status));
  facetsEl.appendChild(facetSection("certificate","Certificate",FACETS.certificate));
  facetsEl.appendChild(facetSection("treatment","Enhancement",FACETS.treatment));
  facetsEl.appendChild(facetSection("pair","Single/Pair",FACETS.pair));

  // Ranges (outlined fields)
  const rangeWrap=document.createElement("div");
  rangeWrap.className="border-t border-gray-200 pt-3 space-y-3";
  rangeWrap.innerHTML=`
    <div>
      <div class="text-sm font-medium">Carat</div>
      <div class="mt-2 grid grid-cols-2 gap-2">
        <input id="minCt${suffix}" type="number" step="0.01" placeholder="Min" class="form-field rounded-lg" />
        <input id="maxCt${suffix}" type="number" step="0.01" placeholder="Max" class="form-field rounded-lg" />
      </div>
    </div>
    <div>
      <div class="text-sm font-medium">Total Price ($)</div>
      <div class="mt-2 grid grid-cols-2 gap-2">
        <input id="minTotal${suffix}" type="number" step="1" placeholder="Min" class="form-field rounded-lg" />
        <input id="maxTotal${suffix}" type="number" step="1" placeholder="Max" class="form-field rounded-lg" />
      </div>
    </div>`;
  facetsEl.appendChild(rangeWrap);

  ["minCt","maxCt","minTotal","maxTotal"].forEach((k)=>{ const el=Q(k+suffix); if(el) el.addEventListener("change",()=>{ state[k]=parseNumber(el.value); state.page=1; applyFilters(); }); });

  try{ window.feather && window.feather.replace(); }catch(_){}
}

function buildFacets(){
  FACETS = {
    stone: uniq(ALL.map(x=>x.stone)),
    color: uniq(ALL.map(x=>x.color)),
    shape: uniq(ALL.map(x=>x.shape)),
    clarity: uniq(ALL.map(x=>x.clarity)),
    origin: uniq(ALL.map(x=>x.origin)),
    shade: uniq(ALL.map(x=>x.shade)),
    status: uniq(ALL.map(x=>x.status)),
    certificate: uniq(ALL.map(x=>x.certificate)),
    treatment: uniq(ALL.map(x=>x.treatment)),
    pair: uniq(ALL.map(x=>x.isPair)),
  };
  // Desktop (no Gem Type)
  renderFacetsInto("facets","",{includeStone:false});
  // Mobile (Gem Type included)
  renderFacetsInto("facetsMobile","M",{includeStone:true});
}

/* ----- Toolbar chips (with active style) ----- */
function renderToolbar(){
  const fill=(id,label,items)=>{ const el=Q(id); if(!el) return; el.innerHTML=`<option value="">${label}</option>` + items.map(o=>`<option>${o}</option>`).join(""); };
  fill("selOrigin","Origin",FACETS.origin);
  fill("selClarity","Clarity",FACETS.clarity);
  fill("selCert","Certificate",FACETS.certificate);
  fill("selTreatment","Enhancement",FACETS.treatment);

  renderChips("chipStones", FACETS.stone, "stone");
  renderChips("chipShapes", FACETS.shape, "shape");

  syncSelectionsUI(); // initial highlight
}

function renderChips(id, items, facet){
  const box=Q(id); if(!box) return; box.innerHTML="";
  items.forEach(val=>{
    const btn=document.createElement("button");
    btn.className="filter-chip";
    btn.dataset.facet=facet;
    btn.dataset.value=val;
    btn.innerHTML = facet==="stone"
      ? `<span class="swatch mr-1" style="background:${colorHex(val,val)}"></span>${val}`
      : val;
    btn.addEventListener("click",()=>{ toggleSet(state[facet],val); state.page=1; applyFilters(); });
    box.appendChild(btn);
  });
}

/* Toggle active classes everywhere */
function syncSelectionsUI(){
  document.querySelectorAll("[data-facet]").forEach(el=>{
    const set = state[el.dataset.facet];
    const isOn = set && set.has(el.dataset.value);
    el.classList.toggle("active", !!isOn);
  });
}

/* ----- DETAILS (expand + media) ----- */
function buildDetails(cardEl,x){
  const mediaBox=cardEl.querySelector("[data-media]");
  const specsBox=cardEl.querySelector("[data-specs]");
  if(mediaBox && !mediaBox.childElementCount){
    x.media.forEach(url=>{
      const wrap=document.createElement("div"); wrap.className="media-item aspect-square";
      if(isVideo(url)){ const v=document.createElement("video"); v.src=url; v.controls=true; v.playsInline=true; v.preload="metadata"; wrap.appendChild(v); }
      else{ const img=document.createElement("img"); img.src=url; img.alt=x.stone||"Media"; wrap.appendChild(img); }
      mediaBox.appendChild(wrap);
    });
  }
  if(specsBox && !specsBox.childElementCount){
    const rows=[["Item No",x.originalId],["Product #",x.stockId],["Type",x.stone],["Source",x.source],["Color",x.color],["Intensity",x.shade],["Clarity",x.clarity],["Shape",x.shape],["Carat",fmtCarat(x.caratTotal)],["Pieces",x.pieces||1],["Origin",x.origin],["Treatment",x.treatment],["Certificate",x.certificate],["Cert #",x.certificateNumber],["Size",[x.sizeMm,x.sizeRange].filter(Boolean).join(" | ")],["$/ct",fmtMoney(x.retailPerCt)],["Total",fmtMoney(x.totalPrice)],["Status",x.status]];
    rows.forEach(([k,v])=>{ const d=document.createElement("div"); d.innerHTML=`<div class="text-gray-400">${k}</div><div class="font-medium">${v||"—"}</div>`; specsBox.appendChild(d); });
  }
}
function toggleDetails(cardEl,data){ const box=cardEl.querySelector("[data-details]"); if(!box) return; const isOpen=!box.classList.contains("hidden"); if(isOpen){ box.classList.add("hidden"); } else { buildDetails(cardEl,data); box.classList.remove("hidden"); } }

/* ----- FILTER, SORT, URL ----- */
const toggleSet=(set,val)=>{ set.has(val) ? set.delete(val) : set.add(val); };
const matchesText=(x,q)=>{ if(!q) return true; const hay=`${x.stockId} ${x.originalId} ${x.stone} ${x.color} ${x.shape} ${x.clarity} ${x.origin} ${x.shade}`.toLowerCase(); return hay.indexOf(q.toLowerCase()) !== -1; };
const inSetOrAny=(set,val)=> set.size===0 || set.has(val);
function passesRanges(x){
  if(state.minCt!=null && !(x.caratTotal!=null && x.caratTotal>=state.minCt)) return false;
  if(state.maxCt!=null && !(x.caratTotal!=null && x.caratTotal<=state.maxCt)) return false;
  if(state.minTotal!=null && !(x.totalPrice!=null && x.totalPrice>=state.minTotal)) return false;
  if(state.maxTotal!=null && !(x.totalPrice!=null && x.totalPrice<=state.maxTotal)) return false;
  if(state.qualityMin!=null && !(x.qualityScore>=state.qualityMin)) return false;
  if(state.qualityMax!=null && !(x.qualityScore<=state.qualityMax)) return false;
  return true;
}
function sortView(list){
  const s=state.sort, copy=[...list];
  switch(s){
    case "priceAsc": return copy.sort((a,b)=>(a.retailPerCt ?? Infinity)-(b.retailPerCt ?? Infinity));
    case "priceDesc":return copy.sort((a,b)=>(b.retailPerCt ?? -Infinity)-(a.retailPerCt ?? -Infinity));
    case "caratAsc": return copy.sort((a,b)=>(a.caratTotal ?? Infinity)-(b.caratTotal ?? Infinity));
    case "caratDesc":return copy.sort((a,b)=>(b.caratTotal ?? -Infinity)-(a.caratTotal ?? -Infinity));
    case "newest":  return copy.sort((a,b)=>(b.stockId||"").localeCompare(a.stockId||""));
    default: return copy;
  }
}
function applyFilters(){
  VIEW = ALL.filter(x =>
    matchesText(x,state.q) &&
    inSetOrAny(state.stone,x.stone) &&
    inSetOrAny(state.color,x.color) &&
    inSetOrAny(state.shape,x.shape) &&
    inSetOrAny(state.clarity,x.clarity) &&
    inSetOrAny(state.origin,x.origin) &&
    inSetOrAny(state.shade,x.shade) &&
    inSetOrAny(state.status,x.status) &&
    inSetOrAny(state.certificate,x.certificate) &&
    inSetOrAny(state.treatment,x.treatment) &&
    inSetOrAny(state.pair,x.isPair) &&
    passesRanges(x)
  );
  VIEW = sortView(VIEW);
  syncSelectionsUI();   // <— update button/chip styles
  renderPills();
  writeURL();
  renderGrid();
}

function writeURL(){
  const p=new URLSearchParams();
  if(state.q) p.set("q",state.q);
  for(const k of ["stone","color","shape","clarity","origin","shade","status","certificate","treatment","pair"]){ if(state[k].size) p.set(k,[...state[k]].join(",")); }
  if(state.minCt!=null) p.set("minCt",state.minCt);
  if(state.maxCt!=null) p.set("maxCt",state.maxCt);
  if(state.minTotal!=null) p.set("minTotal",state.minTotal);
  if(state.maxTotal!=null) p.set("maxTotal",state.maxTotal);
  if(state.qualityMin!=null) p.set("qmin",state.qualityMin);
  if(state.qualityMax!=null) p.set("qmax",state.qualityMax);
  if(state.sort && state.sort!=="featured") p.set("sort",state.sort);
  if(state.page>1) p.set("page",state.page);
  if(state.perPage!==24) p.set("pp",state.perPage);
  const q=p.toString(); history.replaceState(null,"", q ? `?${q}` : location.pathname);
}
function readURL(){
  const p=new URLSearchParams(location.search);
  state.q=p.get("q")||""; Q("q") && (Q("q").value=state.q);
  for(const k of ["stone","color","shape","clarity","origin","shade","status","certificate","treatment","pair"]){ const v=p.get(k); state[k]=new Set(v ? v.split(",") : []); }
  state.minCt=parseNumber(p.get("minCt")); state.maxCt=parseNumber(p.get("maxCt"));
  state.minTotal=parseNumber(p.get("minTotal")); state.maxTotal=parseNumber(p.get("maxTotal"));
  state.qualityMin=parseNumber(p.get("qmin"))||1; state.qualityMax=parseNumber(p.get("qmax"))||5;
  state.sort=p.get("sort")||"featured"; state.page=parseInt(p.get("page")||"1",10); state.perPage=parseInt(p.get("pp")||"24",10);
  Q("sort") && (Q("sort").value=state.sort); Q("perPage") && (Q("perPage").value=String(state.perPage));
  Q("qualityMin") && (Q("qualityMin").value=String(state.qualityMin)); Q("qualityMax") && (Q("qualityMax").value=String(state.qualityMax));
}

/* ----- RENDER ----- */
function renderPills(){
  const box=Q("activePills"); if(!box) return; box.innerHTML="";
  const add=(label,val,unset)=>{ const span=document.createElement("span"); span.className="pill inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs border border-gray-300 bg-white"; span.innerHTML=`<span>${label}: <b>${val}</b></span> <button class="text-gray-400 hover:text-gray-600" aria-label="Remove">×</button>`; span.querySelector("button").addEventListener("click",unset); box.appendChild(span); };
  if(state.q) add("Search",state.q,()=>{ state.q=""; Q("q")&&(Q("q").value=""); applyFilters(); });
  for(const k of ["stone","color","shape","clarity","origin","shade","status","certificate","treatment","pair"]){ for(const val of state[k]) add(k[0].toUpperCase()+k.slice(1),val,()=>{ state[k].delete(val); applyFilters(); }); }
  if(state.minCt!=null) add("Min ct",state.minCt,()=>{ state.minCt=null; ["minCt","caratMin","minCtM"].forEach(id=>Q(id)&&(Q(id).value="")); applyFilters(); });
  if(state.maxCt!=null) add("Max ct",state.maxCt,()=>{ state.maxCt=null; ["maxCt","caratMax","maxCtM"].forEach(id=>Q(id)&&(Q(id).value="")); applyFilters(); });
  if(state.minTotal!=null) add("Min $",state.minTotal,()=>{ state.minTotal=null; ["minTotal","priceMin","minTotalM"].forEach(id=>Q(id)&&(Q(id).value="")); applyFilters(); });
  if(state.maxTotal!=null) add("Max $",state.maxTotal,()=>{ state.maxTotal=null; ["maxTotal","priceMax","maxTotalM"].forEach(id=>Q(id)&&(Q(id).value="")); applyFilters(); });
}
function renderGrid(){
  const grid=Q("grid"); if(!grid) return; grid.innerHTML="";
  const total=VIEW.length; Q("resultCount") && (Q("resultCount").textContent=total);
  const pages=Math.max(1,Math.ceil(total/state.perPage)); state.page=Math.min(state.page,pages);
  Q("page") && (Q("page").textContent=state.page); Q("pages") && (Q("pages").textContent=pages);
  Q("prevPage") && (Q("prevPage").disabled=state.page<=1); Q("nextPage") && (Q("nextPage").disabled=state.page>=pages);
  const start=(state.page-1)*state.perPage, end=start+state.perPage, slice=VIEW.slice(start,end);
  const tpl=document.getElementById("cardTpl")?.content;
  for(const x of slice){
    const frag=tpl.cloneNode(true);
    const card=frag.querySelector("[data-card]");
    const img=frag.querySelector("img");
    const firstMedia=(x.media && x.media[0]) || x.imageUrl;
    img.src= firstMedia || `https://placehold.co/600x600?text=${encodeURIComponent(x.stone || "Gem")}`;
    img.alt= `${x.stone || ""} ${x.color || ""} ${x.shape || ""}`.trim();
    frag.querySelector('[data-badge="stone"]').textContent=x.stone||"";
    const bc=frag.querySelector('[data-badge="color"]'); bc.querySelector('.swatch').style.background=colorHex(x.stone,x.color); bc.querySelector('[data-badge-label]').textContent=x.color||"—";
    const a=frag.querySelector('[data-stock]'); a.textContent=x.stockId||x.originalId||"—"; a.href=firstMedia||"#";
    frag.querySelector('[data-retail]').textContent=fmtMoney(x.retailPerCt)+" / ct";
    frag.querySelector('[data-carat]').textContent=fmtCarat(x.caratTotal);
    frag.querySelector('[data-shape]').textContent=x.shape||"—";
    frag.querySelector('[data-clarity]').textContent=x.clarity||"—";
    frag.querySelector('[data-origin]').textContent=[x.origin,x.shade].filter(Boolean).join(' · ');
    frag.querySelector('[data-size]').textContent=[x.sizeMm,x.sizeRange].filter(Boolean).join(' | ');
    card.addEventListener("click",(e)=>{ if(e.target.closest("a")) return; toggleDetails(card,x); });
    frag.querySelector("[data-toggle]").addEventListener("click",(e)=>{ e.stopPropagation(); toggleDetails(card,x); });
    grid.appendChild(frag);
  }
  if(!slice.length){
    const empty=document.createElement("div"); empty.className="col-span-full text-center py-12 text-gray-500"; empty.innerHTML='<div class="text-lg font-medium">No matches</div><div class="text-sm">Try removing a filter or broadening your ranges.</div>'; grid.appendChild(empty);
  }
}

/* ----- EVENTS ----- */
Q("q")?.addEventListener("input",(e)=>{ state.q=e.target.value; state.page=1; applyFilters(); });
Q("sort")?.addEventListener("change",(e)=>{ state.sort=e.target.value; applyFilters(); });
Q("perPage")?.addEventListener("change",(e)=>{ state.perPage=parseInt(e.target.value,10); state.page=1; applyFilters(); });
Q("prevPage")?.addEventListener("click",()=>{ state.page=Math.max(1,state.page-1); applyFilters(); });
Q("nextPage")?.addEventListener("click",()=>{ state.page=state.page+1; applyFilters(); });
Q("clearAll")?.addEventListener("click",()=>{ state.q=""; Q("q")&&(Q("q").value=""); for(const k of ["stone","color","shape","clarity","origin","shade","status","certificate","treatment","pair"]) state[k].clear(); ["minCt","maxCt","minTotal","maxTotal","caratMin","caratMax","priceMin","priceMax","minCtM","maxCtM","minTotalM","maxTotalM"].forEach(id=>Q(id)&&(Q(id).value="")); state.minCt=state.maxCt=state.minTotal=state.maxTotal=null; state.qualityMin=1; state.qualityMax=5; state.sort="featured"; Q("sort") && (Q("sort").value="featured"); state.page=1; applyFilters(); });
Q("refreshBtn")?.addEventListener("click",()=>loadData());

const bind=(id,fn)=>{ const el=Q(id); if(el) el.addEventListener("change",fn); };
bind("priceMin",()=>{ state.minTotal=parseNumber(Q("priceMin").value); state.page=1; applyFilters(); });
bind("priceMax",()=>{ state.maxTotal=parseNumber(Q("priceMax").value); state.page=1; applyFilters(); });
bind("caratMin",()=>{ state.minCt=parseNumber(Q("caratMin").value); state.page=1; applyFilters(); });
bind("caratMax",()=>{ state.maxCt=parseNumber(Q("caratMax").value); state.page=1; applyFilters(); });
bind("qualityMin",()=>{ state.qualityMin=parseNumber(Q("qualityMin").value)||1; state.page=1; applyFilters(); });
bind("qualityMax",()=>{ state.qualityMax=parseNumber(Q("qualityMax").value)||5; state.page=1; applyFilters(); });
bind("selOrigin",()=>{ const v=Q("selOrigin").value; state.origin=new Set(v?[v]:[]); state.page=1; applyFilters(); });
bind("selClarity",()=>{ const v=Q("selClarity").value; state.clarity=new Set(v?[v]:[]); state.page=1; applyFilters(); });
bind("selTreatment",()=>{ const v=Q("selTreatment").value; state.treatment=new Set(v?[v]:[]); state.page=1; applyFilters(); });
bind("selCert",()=>{ const v=Q("selCert").value; state.certificate=new Set(v?[v]:[]); state.page=1; applyFilters(); });
bind("selPair",()=>{ const v=Q("selPair").value; state.pair=new Set(v?[v]:[]); state.page=1; applyFilters(); });

/* Mobile bottom sheet */
function openSheet(){ const sh=Q("mobileSheet"); if(!sh) return; sh.classList.remove("hidden"); document.body.classList.add("overflow-hidden"); }
function closeSheet(){ const sh=Q("mobileSheet"); if(!sh) return; sh.classList.add("hidden"); document.body.classList.remove("overflow-hidden"); }
Q("mobileFiltersBtn")?.addEventListener("click",openSheet);
Q("mobileClose")?.addEventListener("click",closeSheet);
Q("mobileSheet")?.querySelector("[data-close]")?.addEventListener("click",closeSheet);
Q("mobileApply")?.addEventListener("click",()=>{ closeSheet(); });
Q("mobileClear")?.addEventListener("click",()=>{ Q("clearAll")?.click(); });

/* ----- BOOT ----- */
(function boot(){ try{ window.feather && window.feather.replace(); }catch(_){} loadData(); })();
