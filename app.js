/* =========================
   Gem Catalog – Static + Google Sheet CSV
   Works on GitHub Pages
   ========================= */

/* ----- CONFIG ----- */
// Publish each Google Sheet tab to the web (CSV) and list them here.
const SHEET_SOURCES = [
  {
    name: "Sheet 1",
    url:
      "https://docs.google.com/spreadsheets/d/e/2PACX-1vSrskicOCBNl6ntgcdNHGwTRaTQLrhMYsjHoYwiPAPyc72-awi5MQ9Rl5-jccvqI34RCNvDqJw2dz-T/pub?gid=0&single=true&output=csv",
  },
  // { name: "Rubies", url: "https://docs.google.com/...&gid=12345&output=csv" }
];

// Cache-bust CSV fetches on each load (recommended for GitHub Pages)
const ALWAYS_FRESH = true;

/* Column aliases (case/space-insensitive) */
const COLS = {
  originalId: ["Original Stock ID", "Original ID", "Orig ID", "Item No."],
  stockId: ["Stock ID", "SKU", "ID", "Stock", "Product Number"],
  stone: [
    "Stone",
    "Gem",
    "Gemstone",
    "Species",
    "Variety",
    "Gemstone Type",
  ],
  origin: ["Origin", "Country of Origin", "Origin/Country", "Gemstone Origin"],
  shade: ["Shade", "Tone", "Gemstone Color Intensity"],
  color: ["Color", "Colour", "Hue", "Body Color"],
  clarity: ["Clarity", "Clarity Grade", "Gemstone Clarity"],
  shape: ["Shape", "Cut", "Shape/Cut", "Gemstone Shape"],
  sizeMm: [
    "Size (MM)",
    "Size",
    "Measurements (mm)",
    "Dimensions",
    "Dims (mm)",
    "LxWxH (mm)",
    "Length (mm)",
    "Width (mm)",
    "Height (mm)",
    "Gemstone Dimensions",
  ],
  sizeRange: ["Mix Size Range", "Size Range"],
  caratTotal: [
    "Stone Weight - Carat Total",
    "Carat",
    "Weight",
    "Carat Weight",
    "Weight (ct)",
    "Total Carat Weight",
    "TCW",
    "Gemstone Carat / Weight",
  ],
  pieces: ["Pieces", "Qty", "Quantity", "Gemstone Pcs"],
  purchasePerCt: ["Purchase Price per Carat", "Purchase $/ct"],
  b2bPerCt: ["B2B Price/Ct", "B2B - Price/Ct", "B2B $/ct"],
  retailPerCt: [
    "Retail Price/Ct",
    "Retail - Price/Ct",
    "Retail $/ct",
    "Price per ct",
    "Price/Ct",
    "Sale Price",
  ],
  totalPrice: ["Total USD Amount", "Total Amount (USD)", "Total Price"],
  status: ["Status", "Availability", "In Stock", "Available"],
  imageUrl: ["Image URL", "Image", "Img", "Image Link", "Photo URL", "Picture"],
  certificate: ["Certificates", "Certificate"],
  certificateNumber: ["Certificate Number", "Cert #"],
  treatment: ["Gemstone Treatment", "Treatment"],
  source: ["Gemstone Source", "Source"],
};

/* Color swatches */
const COLOR_MAP = {
  red: "#DC2626",
  ruby: "#E11D48",
  pink: "#EC4899",
  fuchsia: "#C026D3",
  purple: "#7C3AED",
  violet: "#8B5CF6",
  blue: "#2563EB",
  teal: "#0D9488",
  green: "#16A34A",
  yellow: "#F59E0B",
  orange: "#EA580C",
  brown: "#92400E",
  champagne: "#E8D6B0",
  peach: "#F4A38C",
  black: "#111827",
  white: "#F3F4F6",
  colorless: "#F3F4F6",
  gray: "#9CA3AF",
};
const STONE_DEFAULT = {
  sapphire: "#2563EB",
  ruby: "#E11D48",
  emerald: "#16A34A",
  diamond: "#F3F4F6",
  spinel: "#7C3AED",
  tourmaline: "#10B981",
  garnet: "#B91C1C",
  topaz: "#60A5FA",
};

/* ----- UTIL ----- */
const Q = (id) => document.getElementById(id);
const normKey = (s) => String(s || "").trim().toLowerCase();
const byAliases = (row, aliases) => {
  for (const a of aliases) {
    const key =
      Object.keys(row).find((k) => normKey(k) === normKey(a)) || null;
    if (key && row[key] != null && row[key] !== "") return row[key];
  }
  return "";
};
const parseCurrency = (v) => {
  if (v == null) return null;
  const n = String(v).replace(/[^0-9.\-]/g, "");
  const f = parseFloat(n);
  return Number.isFinite(f) ? f : null;
};
const parseNumber = (v) => {
  if (v == null) return null;
  const n = String(v).replace(/[^0-9.\-]/g, "");
  const f = parseFloat(n);
  return Number.isFinite(f) ? f : null;
};
const fmtMoney = (n) =>
  n == null ? "-" : `$${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
const fmtCarat = (n) => (n == null ? "-" : `${n.toFixed(2)} ct`);
const colorHex = (stone, color) => {
  const c = normKey(color);
  if (COLOR_MAP[c]) return COLOR_MAP[c];
  const s = normKey(stone);
  return STONE_DEFAULT[s] || "#CBD5E1";
};

/* Quality grade helpers (A..AAAAA) */
function gradeLabel(score) {
  if (score >= 4.75) return "AAAAA";
  if (score >= 3.75) return "AAAA";
  if (score >= 2.75) return "AAA";
  if (score >= 1.75) return "AA";
  return "A";
}
function clarityScore(c) {
  const map = {
    IF: 5,
    VVS: 4.5,
    VVVS: 4.5,
    VS: 4,
    SI: 3,
    I1: 2,
    OPAQUE: 1.5,
    TRANSLUCENT: 2.5,
    TRANSPARENT: 3,
  };
  return map[(c || "").toUpperCase()] || 3;
}
function treatmentPenalty(t) {
  const s = (t || "").toLowerCase();
  if (!s || /none|unheated|no oil|untreated/.test(s)) return +0.5; // bonus
  if (/minor oil/.test(s)) return -0.2;
  if (/moderate|irradiated|glass|stabilized/.test(s)) return -0.6;
  return -0.3;
}
function calcQuality(x) {
  let base = clarityScore(x.clarity);
  base += treatmentPenalty(x.treatment);
  base = Math.max(1, Math.min(5, base));
  return base;
}

/* ----- STATE ----- */
let ALL = [];
let VIEW = [];
let FACETS = {};

const state = {
  q: "",
  stone: new Set(),
  color: new Set(),
  shape: new Set(),
  clarity: new Set(),
  origin: new Set(),
  shade: new Set(),
  status: new Set(),
  certificate: new Set(),
  treatment: new Set(),
  pair: new Set(),
  minCt: null,
  maxCt: null,
  minTotal: null,
  maxTotal: null,
  qualityMin: 1,
  qualityMax: 5,
  sort: "featured",
  page: 1,
  perPage: 24,
};

/* ----- CSV LOADING ----- */
function showSkeletons(count = 12) {
  const grid = Q("grid");
  if (!grid) return;
  grid.innerHTML = "";
  const tpl = Q("skeletonTpl")?.content;
  if (!tpl) return;
  for (let i = 0; i < count; i++) grid.appendChild(tpl.cloneNode(true));
}

function loadCSV(url) {
  return new Promise((resolve, reject) => {
    if (!window.Papa) {
      reject(new Error("PapaParse not loaded"));
      return;
    }
    Papa.parse(url, {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: (res) => resolve(res.data),
      error: reject,
    });
  });
}

function mapRow(row) {
  const o = {
    originalId: byAliases(row, COLS.originalId),
