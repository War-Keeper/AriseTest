/* Arise Precious Gems Luxury Inventory Application */

const CSV_PATH = 'Arha_Stones_Inventory.csv';

const STONE_TYPES = [
  'Diamond',
  'Ruby',
  'Sapphire',
  'Emerald',
  'Tanzanite',
  'Topaz',
  'Garnet',
  'Aquamarine',
  'Peridot',
  'Spinel',
];

const SHAPE_OPTIONS = [
  { value: 'Round', icon: '●' },
  { value: 'Cushion', icon: '◇' },
  { value: 'Emerald', icon: '▭' },
  { value: 'Princess', icon: '◆' },
  { value: 'Oval', icon: '⬭' },
  { value: 'Radiant', icon: '⬢' },
  { value: 'Asscher', icon: '◻' },
  { value: 'Heart', icon: '♥' },
  { value: 'Marquise', icon: '⬥' },
  { value: 'Pear', icon: '💧' },
];

const CARAT_PRESETS = [
  { id: 'under1', label: 'Under 1ct', range: [0, 1] },
  { id: '1to3', label: '1-3ct', range: [1, 3] },
  { id: '3to5', label: '3-5ct', range: [3, 5] },
  { id: '5to7', label: '5-7ct', range: [5, 7] },
  { id: 'over7', label: 'Over 7ct', range: [7, 10] },
];

const PRICE_PRESETS = [
  { id: 'under1k', label: 'Under $1,000', range: [0, 1000] },
  { id: '1to5k', label: '$1,000 - $5,000', range: [1000, 5000] },
  { id: '5to10k', label: '$5,000 - $10,000', range: [5000, 10000] },
  { id: '10to15k', label: '$10,000 - $15,000', range: [10000, 15000] },
  { id: 'over15k', label: '$15,000+', range: [15000, 25000] },
];

const DIAMOND_COLORS = ['D', 'E', 'F', 'G', 'H', 'I', 'J'];
const GEMSTONE_COLORS = [
  'Deep Green',
  'Vivid Pink',
  'Royal Blue',
  'Purple',
  'Orange',
  'Teal',
  'Violet',
  'Padparadscha',
  'Yellow',
];

const CLARITY_OPTIONS = [
  { value: 'IF', label: 'IF (Internally Flawless)' },
  { value: 'VVS1', label: 'VVS1 (Very Very Slightly Included 1)' },
  { value: 'VVS2', label: 'VVS2 (Very Very Slightly Included 2)' },
  { value: 'VS1', label: 'VS1 (Very Slightly Included 1)' },
  { value: 'VS2', label: 'VS2 (Very Slightly Included 2)' },
  { value: 'SI1', label: 'SI1 (Slightly Included 1)' },
  { value: 'SI2', label: 'SI2 (Slightly Included 2)' },
];

const CUT_OPTIONS = ['Excellent', 'Very Good', 'Good'];

const LAB_OPTIONS = ['GIA', 'IGI', 'AGL', 'HRD', 'None'];

const TREATMENT_OPTIONS = ['None', 'Heat', 'No Heat', 'Minor Oil', 'Diffusion', 'Fracture Filled'];

const ORIGIN_OPTIONS = ['Myanmar', 'Colombia', 'Brazil', 'Sri Lanka', 'Madagascar', 'Mozambique', 'Tanzania', 'Thailand'];

const LAB_LINKS = {
  GIA: 'https://www.gia.edu/report-check?reportno=',
  IGI: 'https://www.igi.org/verify-your-report/?r=',
  AGL: 'https://www.aglgemlab.com/verify-report.php?report=',
  HRD: 'https://my.hrdantwerp.com/en/services/verify-your-report/',
};

const PLACEHOLDER_META = {
  Diamond: { icon: '💎', gradient: 'linear-gradient(135deg, #e0e7ff, #c7d2fe)' },
  Ruby: { icon: '❤️', gradient: 'linear-gradient(135deg, #fee2e2, #fecaca)' },
  Sapphire: { icon: '💠', gradient: 'linear-gradient(135deg, #dbeafe, #bfdbfe)' },
  Emerald: { icon: '💚', gradient: 'linear-gradient(135deg, #d1fae5, #a7f3d0)' },
  Tanzanite: { icon: '🔷', gradient: 'linear-gradient(135deg, #dbeafe, #d1d5ff)' },
  Topaz: { icon: '🔹', gradient: 'linear-gradient(135deg, #bae6fd, #7dd3fc)' },
  Garnet: { icon: '♦️', gradient: 'linear-gradient(135deg, #fde7f3, #fbcfe8)' },
  Aquamarine: { icon: '🌊', gradient: 'linear-gradient(135deg, #cffafe, #a5f3fc)' },
  Peridot: { icon: '💚', gradient: 'linear-gradient(135deg, #bef264, #a3e635)' },
  Spinel: { icon: '🔺', gradient: 'linear-gradient(135deg, #ede9fe, #ddd6fe)' },
  Default: { icon: '💎', gradient: 'linear-gradient(135deg, #f3e8ff, #e9d5ff)' },
};

const state = {
  inventory: [],
  filteredInventory: [],
  totalCount: 0,
  expandedId: null,
  viewMode: 'grid',
  searchTerm: '',
  headerSearchTerm: '',
  sortBy: 'recent',
  filters: {
    status: 'all',
    types: new Set(),
    shapes: new Set(),
    carat: { min: 0.5, max: 10 },
    colors: new Set(),
    clarities: new Set(),
    cuts: new Set(),
    labs: new Set(),
    price: { min: 0, max: 20000, includeCall: true },
    treatments: new Set(),
    growth: 'all',
    origins: new Set(),
  },
};

const elements = {};

document.addEventListener('DOMContentLoaded', initApp);

function initApp() {
  cacheDom();
  setupAccordions();
  setupEventListeners();
  populateStaticFilters();
  loadInventory();
}

function cacheDom() {
  elements.filterPanel = document.querySelector('.filter-panel');
  elements.filterPanelInner = document.querySelector('.filter-panel-inner');
  elements.filterResultCount = document.getElementById('filterResultCount');
  elements.totalCount = document.getElementById('totalCount');
  elements.visibleCount = document.getElementById('visibleCount');
  elements.activeFilterCount = document.getElementById('activeFilterCount');
  elements.activeFilterChips = document.getElementById('activeFilterChips');
  elements.quickSearch = document.getElementById('quickSearch');
  elements.quickSearchClear = elements.quickSearch?.nextElementSibling;
  elements.headerSearch = document.getElementById('headerSearch');
  elements.headerSearchClear = document.querySelector('.header-center .clear-search');
  elements.productGrid = document.getElementById('productGrid');
  elements.resultsVisible = document.getElementById('resultsVisible');
  elements.resultsTotal = document.getElementById('resultsTotal');
  elements.sortBy = document.getElementById('sortBy');
  elements.viewToggle = document.querySelector('.view-toggle');
  elements.clearAllFilters = document.getElementById('clearAllFilters');
  elements.menuToggle = document.querySelector('.menu-toggle');
  elements.closeFilters = document.getElementById('closeFilters');
  elements.uploadCsvBtn = document.getElementById('uploadCsvBtn');
  elements.priceCallOption = document.getElementById('priceCallOption');
  elements.treatmentLearnMore = document.getElementById('learnTreatments');
  elements.lightboxModal = document.getElementById('lightboxModal');
  elements.lightboxImage = document.getElementById('lightboxImage');
  elements.comingSoonModal = document.getElementById('comingSoonModal');
  elements.treatmentModal = document.getElementById('treatmentModal');
  elements.colorFilterOptions = document.getElementById('colorFilterOptions');
  elements.typeFilterOptions = document.getElementById('typeFilterOptions');
  elements.shapeFilterOptions = document.getElementById('shapeFilterOptions');
  elements.caratRangeMin = document.getElementById('caratRangeMin');
  elements.caratRangeMax = document.getElementById('caratRangeMax');
  elements.caratMin = document.getElementById('caratMin');
  elements.caratMax = document.getElementById('caratMax');
  elements.caratPresets = document.getElementById('caratPresets');
  elements.priceRangeMin = document.getElementById('priceRangeMin');
  elements.priceRangeMax = document.getElementById('priceRangeMax');
  elements.priceMin = document.getElementById('priceMin');
  elements.priceMax = document.getElementById('priceMax');
  elements.pricePresets = document.getElementById('pricePresets');
  elements.clarityFilterOptions = document.getElementById('clarityFilterOptions');
  elements.cutFilterOptions = document.getElementById('cutFilterOptions');
  elements.labFilterOptions = document.getElementById('labFilterOptions');
  elements.treatmentFilterOptions = document.getElementById('treatmentFilterOptions');
  elements.originFilterOptions = document.getElementById('originFilterOptions');
  elements.growthFilterOptions = document.getElementById('growthFilterOptions');
  elements.statusCounts = {
    all: document.querySelector('[data-count="status-all"]'),
    available: document.querySelector('[data-count="status-available"]'),
    hold: document.querySelector('[data-count="status-hold"]'),
    sold: document.querySelector('[data-count="status-sold"]'),
  };
  elements.filterSections = {
    color: document.querySelector('[data-filter="color"]'),
    clarity: document.querySelector('[data-filter="clarity"]'),
    growth: document.querySelector('[data-filter="growth"]'),
    origin: document.querySelector('[data-filter="origin"]'),
  };
}

function setupAccordions() {
  elements.filterPanel?.addEventListener('click', (event) => {
    const button = event.target.closest('.filter-toggle');
    if (!button) return;

    const section = button.closest('.filter-section');
    const content = section?.querySelector('.filter-content');
    if (!section || !content) return;

    const isExpanded = section.classList.toggle('expanded');
    button.setAttribute('aria-expanded', String(isExpanded));
    if (isExpanded) {
      content.removeAttribute('hidden');
    } else {
      content.setAttribute('hidden', '');
    }
  });
}

function setupEventListeners() {
  if (elements.quickSearch) {
    const debouncedSearch = debounce((value) => {
      state.searchTerm = value;
      syncHeaderSearch(value);
      applyFilters();
    }, 300);

    elements.quickSearch.addEventListener('input', (event) => {
      const value = event.target.value.trim().toLowerCase();
      toggleClearButton(elements.quickSearchClear, value);
      debouncedSearch(value);
    });

    elements.quickSearchClear?.addEventListener('click', () => {
      elements.quickSearch.value = '';
      toggleClearButton(elements.quickSearchClear, '');
      state.searchTerm = '';
      syncHeaderSearch('');
      applyFilters();
    });
  }

  if (elements.headerSearch) {
    const debouncedHeaderSearch = debounce((value) => {
      state.searchTerm = value;
      syncQuickSearch(value);
      applyFilters();
    }, 300);

    elements.headerSearch.addEventListener('input', (event) => {
      const value = event.target.value.trim().toLowerCase();
      toggleClearButton(elements.headerSearchClear, value);
      debouncedHeaderSearch(value);
    });

    elements.headerSearchClear?.addEventListener('click', () => {
      elements.headerSearch.value = '';
      toggleClearButton(elements.headerSearchClear, '');
      state.searchTerm = '';
      syncQuickSearch('');
      applyFilters();
    });
  }

  elements.sortBy?.addEventListener('change', (event) => {
    state.sortBy = event.target.value;
    renderProducts();
  });

  elements.viewToggle?.addEventListener('click', (event) => {
    const button = event.target.closest('.toggle-btn');
    if (!button) return;
    const view = button.dataset.view;
    state.viewMode = view;
    elements.viewToggle.querySelectorAll('.toggle-btn').forEach((btn) => {
      btn.classList.toggle('active', btn === button);
      btn.setAttribute('aria-pressed', String(btn === button));
    });
    elements.productGrid?.classList.toggle('list-view', view === 'list');
  });

  elements.clearAllFilters?.addEventListener('click', clearAllFilters);

  elements.menuToggle?.addEventListener('click', () => {
    elements.filterPanel?.classList.toggle('open');
  });

  elements.closeFilters?.addEventListener('click', () => {
    elements.filterPanel?.classList.remove('open');
  });

  elements.uploadCsvBtn?.addEventListener('click', () => {
    showComingSoon('CSV Upload support is coming soon. Currently displaying curated inventory.');
  });

  elements.priceCallOption?.addEventListener('change', (event) => {
    state.filters.price.includeCall = event.target.checked;
    applyFilters();
  });

  elements.treatmentLearnMore?.addEventListener('click', () => {
    openModal(elements.treatmentModal);
  });

  document.body.addEventListener('click', (event) => {
    if (event.target.matches('[data-close-modal]')) {
      closeModal(event.target.closest('.modal'));
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeModal(elements.lightboxModal);
      closeModal(elements.comingSoonModal);
      closeModal(elements.treatmentModal);
    }
  });

  setupFilterOptionListeners();
  setupRangeControls();
}

function setupFilterOptionListeners() {
  // Status radio buttons
  document.querySelectorAll('input[name="status"]').forEach((input) => {
    input.addEventListener('change', (event) => {
      state.filters.status = event.target.value;
      applyFilters();
    });
  });

  // Stone type select/deselect buttons
  const typeSection = document.querySelector('[data-filter="type"]');
  const selectAllBtn = typeSection?.querySelector('[data-action="select-all"]');
  const deselectAllBtn = typeSection?.querySelector('[data-action="deselect-all"]');

  selectAllBtn?.addEventListener('click', () => {
    state.filters.types = new Set(STONE_TYPES);
    typeSection.querySelectorAll('input[type="checkbox"]').forEach((input) => {
      input.checked = true;
    });
    applyFilters();
    updateColorFilterOptions();
    updateConditionalFilters();
  });

  deselectAllBtn?.addEventListener('click', () => {
    state.filters.types = new Set();
    typeSection.querySelectorAll('input[type="checkbox"]').forEach((input) => {
      input.checked = false;
    });
    applyFilters();
    updateColorFilterOptions();
    updateConditionalFilters();
  });

  elements.growthFilterOptions?.querySelectorAll('input').forEach((input) => {
    input.addEventListener('change', () => {
      state.filters.growth = input.value;
      applyFilters();
    });
  });
}

function setupRangeControls() {
  if (elements.caratRangeMin && elements.caratRangeMax) {
    const syncCaratRange = () => {
      let min = parseFloat(elements.caratRangeMin.value);
      let max = parseFloat(elements.caratRangeMax.value);
      if (min > max) [min, max] = [max, min];
      min = Math.max(0, min);
      max = Math.max(min, max);
      elements.caratRangeMin.value = min.toString();
      elements.caratRangeMax.value = max.toString();
      elements.caratMin.value = min.toFixed(2);
      elements.caratMax.value = max.toFixed(2);
      state.filters.carat = { min, max };
      applyFilters();
    };

    elements.caratRangeMin.addEventListener('input', syncCaratRange);
    elements.caratRangeMax.addEventListener('input', syncCaratRange);
    elements.caratMin?.addEventListener('change', () => {
      const min = parseFloat(elements.caratMin.value) || 0;
      elements.caratRangeMin.value = min;
      syncCaratRange();
    });
    elements.caratMax?.addEventListener('change', () => {
      const max = parseFloat(elements.caratMax.value) || 10;
      elements.caratRangeMax.value = max;
      syncCaratRange();
    });
  }

  if (elements.priceRangeMin && elements.priceRangeMax) {
    const syncPriceRange = () => {
      let min = parseFloat(elements.priceRangeMin.value);
      let max = parseFloat(elements.priceRangeMax.value);
      if (min > max) [min, max] = [max, min];
      min = Math.max(0, min);
      max = Math.max(min, max);
      elements.priceRangeMin.value = min.toString();
      elements.priceRangeMax.value = max.toString();
      elements.priceMin.value = Math.round(min);
      elements.priceMax.value = Math.round(max);
      state.filters.price.min = min;
      state.filters.price.max = max;
      applyFilters();
    };

    elements.priceRangeMin.addEventListener('input', syncPriceRange);
    elements.priceRangeMax.addEventListener('input', syncPriceRange);
    elements.priceMin?.addEventListener('change', () => {
      const min = parseFloat(elements.priceMin.value) || 0;
      elements.priceRangeMin.value = min;
      syncPriceRange();
    });
    elements.priceMax?.addEventListener('change', () => {
      const max = parseFloat(elements.priceMax.value) || 20000;
      elements.priceRangeMax.value = max;
      syncPriceRange();
    });
  }
}

function loadInventory() {
  if (typeof Papa === 'undefined') {
    console.error('PapaParse failed to load. Please check your network connection.');
    return;
  }
  Papa.parse(CSV_PATH, {
    header: true,
    download: true,
    skipEmptyLines: true,
    dynamicTyping: false,
    complete: (results) => {
      processInventory(results.data || []);
    },
    error: (error) => {
      console.error('Failed to load CSV', error);
    },
  });
}

function processInventory(rawRows) {
  const processed = rawRows
    .map((row) => transformRow(row))
    .filter(Boolean);

  state.inventory = processed;
  state.totalCount = processed.length;

  elements.totalCount.textContent = state.totalCount;
  elements.resultsTotal.textContent = state.totalCount;

  applyFilters();
  updateColorFilterOptions();
  updateConditionalFilters();
  updateFilterCounts();
}

function transformRow(row) {
  if (!row || !row['Stock #']) return null;

  const cleanString = (value) => {
    if (value === undefined || value === null) return '';
    const trimmed = String(value).trim();
    return trimmed === '-' ? '' : trimmed;
  };

  const parseNumber = (value) => {
    if (!value || value === '-' || value === 'Call For Price') return null;
    const number = parseFloat(String(value).replace(/[^0-9.]/g, ''));
    return Number.isFinite(number) ? number : null;
  };

  const parsePrice = (value) => {
    if (!value || value === 'Call For Price') return null;
    const parsed = parseFloat(String(value).replace(/[^0-9.]/g, ''));
    return Number.isFinite(parsed) ? parsed : null;
  };

  const otherImagesRaw = cleanString(row['Other Images Links (comma Separated)']);
  const otherImages = otherImagesRaw
    ? otherImagesRaw
        .split(',')
        .map((image) => image.trim())
        .filter(Boolean)
    : [];

  const primaryImage = cleanString(row['Primary Image Link']);
  const images = primaryImage ? [primaryImage, ...otherImages] : otherImages;

  const totalPriceRaw = cleanString(row['Total Price (Total)']);
  const perCaratPriceRaw = cleanString(row['Price per Carat (P/ct)']);

  const totalPrice = parsePrice(totalPriceRaw);
  const perCaratPrice = parsePrice(perCaratPriceRaw);
  const isCallForPrice = totalPriceRaw === 'Call For Price';

  const type = cleanString(row.Type);
  const status = cleanString(row.Status) || 'Available';
  const clarity = cleanString(row.Clarity);
  const cut = cleanString(row.Cut);
  const lab = cleanString(row.Lab) || 'None';
  const treatment = cleanString(row['Treatment / Treat']);
  const treatmentNotes = cleanString(row['Treatment Notes']);
  const growthType = cleanString(row['Growth Type']);
  const origin = cleanString(row.Origin);

  const searchValues = [
    row['Stock #'],
    status,
    type,
    row.Shape,
    row.Color,
    clarity,
    cut,
    lab,
    treatment,
    treatmentNotes,
    growthType,
    origin,
    row['Item Location'],
  ]
    .map((value) => cleanString(value).toLowerCase())
    .join(' ');

  return {
    id: cleanString(row['Stock #']),
    status,
    itemLocation: cleanString(row['Item Location']),
    type,
    lab,
    reportNumber: cleanString(row['Report #']),
    shape: cleanString(row.Shape),
    carat: parseNumber(row.Carat) ?? 0,
    color: cleanString(row.Color),
    clarity,
    cut,
    treatment,
    treatmentNotes,
    growthType,
    origin,
    measurements: cleanString(row['Measurements (Meas)']),
    ratio: parseNumber(row.Ratio),
    totalPrice,
    perCaratPrice,
    isCallForPrice,
    locationNotes: cleanString(row['Location Notes / Availability Notes']),
    primaryImage,
    otherImages,
    images,
    videoLink: cleanString(row['Video Link']),
    searchBlob: searchValues,
  };
}

function populateStaticFilters() {
  renderCheckboxGroup(elements.typeFilterOptions, STONE_TYPES, 'type');
  renderShapeOptions();
  renderPresetOptions(elements.caratPresets, CARAT_PRESETS, 'carat');
  renderPresetOptions(elements.pricePresets, PRICE_PRESETS, 'price');
  renderClarityOptions();
  renderCheckboxGroup(elements.cutFilterOptions, CUT_OPTIONS, 'cut');
  renderCheckboxGroup(elements.labFilterOptions, LAB_OPTIONS, 'lab', true);
  renderCheckboxGroup(elements.treatmentFilterOptions, TREATMENT_OPTIONS, 'treatment');
  renderCheckboxGroup(elements.originFilterOptions, ORIGIN_OPTIONS, 'origin');
  updateColorFilterOptions();
}

function renderCheckboxGroup(container, options, filterKey, includeLogo = false) {
  if (!container) return;
  container.innerHTML = '';

  options.forEach((option) => {
    const value = typeof option === 'string' ? option : option.value;
    const label = typeof option === 'string' ? option : option.label;
    const wrapper = document.createElement('label');
    wrapper.innerHTML = `
      <span class="label-text">
        ${includeLogo ? `<span class="lab-icon" data-lab="${value}"></span>` : ''}
        ${label}
      </span>
      <span class="count" data-count="${filterKey}-${value.replace(/\s+/g, '').toLowerCase()}">0</span>
    `;

    const input = document.createElement('input');
    input.type = 'checkbox';
    input.value = value;

    input.addEventListener('change', () => {
      const targetSet = state.filters[`${filterKey}s`] || state.filters[filterKey];
      if (targetSet instanceof Set) {
        if (input.checked) targetSet.add(value);
        else targetSet.delete(value);
      }
      applyFilters();
      if (filterKey === 'type') {
        updateColorFilterOptions();
        updateConditionalFilters();
      }
    });

    wrapper.prepend(input);
    container.appendChild(wrapper);
  });
}

function renderShapeOptions() {
  if (!elements.shapeFilterOptions) return;
  elements.shapeFilterOptions.innerHTML = '';

  SHAPE_OPTIONS.forEach(({ value, icon }) => {
    const label = document.createElement('label');
    label.innerHTML = `
      <span class="shape-icon" aria-hidden="true">${icon}</span>
      <span>${value}</span>
      <span class="count" data-count="shape-${value.toLowerCase()}">0</span>
    `;

    const input = document.createElement('input');
    input.type = 'checkbox';
    input.value = value;

    input.addEventListener('change', () => {
      if (input.checked) state.filters.shapes.add(value);
      else state.filters.shapes.delete(value);
      applyFilters();
    });

    label.prepend(input);
    elements.shapeFilterOptions.appendChild(label);
  });
}

function renderPresetOptions(container, presets, key) {
  if (!container) return;
  container.innerHTML = '';

  presets.forEach((preset) => {
    const label = document.createElement('label');
    label.dataset.preset = preset.id;
    label.innerHTML = `
      <span>${preset.label}</span>
    `;

    const input = document.createElement('input');
    input.type = 'checkbox';
    input.value = preset.id;

    input.addEventListener('change', () => {
      if (input.checked) {
        applyPresetRange(key, preset.id);
      } else {
        clearPresetRange(key, preset.id);
      }
      applyFilters();
    });

    label.prepend(input);
    container.appendChild(label);
  });
}

function renderClarityOptions() {
  if (!elements.clarityFilterOptions) return;
  elements.clarityFilterOptions.innerHTML = '';

  CLARITY_OPTIONS.forEach(({ value, label, description }) => {
    const wrapper = document.createElement('label');
    wrapper.innerHTML = `
      <span>${label || value}</span>
      <span class="count" data-count="clarity-${value.toLowerCase()}">0</span>
    `;

    const input = document.createElement('input');
    input.type = 'checkbox';
    input.value = value;
    input.title = description || label || value;

    input.addEventListener('change', () => {
      if (input.checked) state.filters.clarities.add(value);
      else state.filters.clarities.delete(value);
      applyFilters();
    });

    wrapper.prepend(input);
    elements.clarityFilterOptions.appendChild(wrapper);
  });
}

function updateColorFilterOptions() {
  if (!elements.colorFilterOptions) return;
  const selectedTypes = state.filters.types;
  const includesDiamond = selectedTypes.size === 0 || selectedTypes.has('Diamond');
  const includesGemstones =
    selectedTypes.size === 0 || Array.from(selectedTypes).some((type) => type !== 'Diamond');

  elements.colorFilterOptions.innerHTML = '';

  if (includesDiamond) {
    const section = document.createElement('div');
    section.className = 'color-section';
    section.innerHTML = '<p class="color-heading">Diamond Color Scale</p>';
    DIAMOND_COLORS.forEach((color) => {
      const label = document.createElement('label');
      label.innerHTML = `
        <span class="color-chip" data-color="${color}">${color}</span>
        <span class="count" data-count="color-${color.toLowerCase()}">0</span>
      `;
      const input = document.createElement('input');
      input.type = 'checkbox';
      input.value = color;
      input.checked = state.filters.colors.has(color);
      input.addEventListener('change', () => {
        if (input.checked) state.filters.colors.add(color);
        else state.filters.colors.delete(color);
        applyFilters();
      });
      label.prepend(input);
      section.appendChild(label);
    });
    elements.colorFilterOptions.appendChild(section);
  }

  if (includesGemstones) {
    const section = document.createElement('div');
    section.className = 'color-section';
    section.innerHTML = '<p class="color-heading">Gemstone Color Palette</p>';
    GEMSTONE_COLORS.forEach((color) => {
      const label = document.createElement('label');
      label.innerHTML = `
        <span class="color-chip" data-color="${color}">${color}</span>
        <span class="count" data-count="color-${color.toLowerCase().replace(/\s+/g, '')}">0</span>
      `;
      const input = document.createElement('input');
      input.type = 'checkbox';
      input.value = color;
      input.checked = state.filters.colors.has(color);
      input.addEventListener('change', () => {
        if (input.checked) state.filters.colors.add(color);
        else state.filters.colors.delete(color);
        applyFilters();
      });
      label.prepend(input);
      section.appendChild(label);
    });
    elements.colorFilterOptions.appendChild(section);
  }
}

function applyPresetRange(type, presetId) {
  const presets = type === 'carat' ? CARAT_PRESETS : PRICE_PRESETS;
  const inputs = (type === 'carat' ? elements.caratPresets : elements.pricePresets)?.querySelectorAll('input');
  if (!inputs) return;

  const selectedValues = new Set();
  inputs.forEach((input) => {
    if (input.checked) selectedValues.add(input.value);
  });

  if (!selectedValues.size) {
    resetRangeToDefaults(type);
    return;
  }

  let min = Infinity;
  let max = -Infinity;

  selectedValues.forEach((id) => {
    const preset = presets.find((p) => p.id === id);
    if (!preset) return;
    const [presetMin, presetMax] = preset.range;
    min = Math.min(min, presetMin);
    max = Math.max(max, presetMax);
  });

  if (!Number.isFinite(min) || !Number.isFinite(max)) {
    resetRangeToDefaults(type);
    return;
  }

  if (type === 'carat') {
    elements.caratRangeMin.value = min;
    elements.caratRangeMax.value = max;
    elements.caratMin.value = min.toFixed(2);
    elements.caratMax.value = max.toFixed(2);
    state.filters.carat = { min, max };
  } else {
    const clampedMax = Math.min(25000, max);
    elements.priceRangeMin.value = min;
    elements.priceRangeMax.value = clampedMax;
    elements.priceMin.value = Math.round(min);
    elements.priceMax.value = Math.round(clampedMax);
    state.filters.price.min = min;
    state.filters.price.max = clampedMax;
  }
}

function clearPresetRange(type, presetId) {
  const presets = type === 'carat' ? CARAT_PRESETS : PRICE_PRESETS;
  const inputs = (type === 'carat' ? elements.caratPresets : elements.pricePresets)?.querySelectorAll('input');
  if (!inputs) return;

  const selectedValues = new Set();
  inputs.forEach((input) => {
    if (input.checked) selectedValues.add(input.value);
  });

  if (!selectedValues.size) {
    resetRangeToDefaults(type);
    return;
  }

  applyPresetRange(type, presetId);
}

function resetRangeToDefaults(type) {
  if (type === 'carat') {
    elements.caratRangeMin.value = 0.5;
    elements.caratRangeMax.value = 10;
    elements.caratMin.value = '0.50';
    elements.caratMax.value = '10.00';
    state.filters.carat = { min: 0.5, max: 10 };
  } else {
    elements.priceRangeMin.value = 0;
    elements.priceRangeMax.value = 20000;
    elements.priceMin.value = '0';
    elements.priceMax.value = '20000';
    state.filters.price.min = 0;
    state.filters.price.max = 20000;
  }
}

function updateConditionalFilters() {
  const selectedTypes = state.filters.types;
  const isDiamondOnly = selectedTypes.size === 0 || (selectedTypes.size === 1 && selectedTypes.has('Diamond'));
  const includesDiamonds = selectedTypes.size === 0 || selectedTypes.has('Diamond');
  const includesGemstones =
    selectedTypes.size === 0 || Array.from(selectedTypes).some((type) => type !== 'Diamond');

  if (elements.filterSections.clarity) {
    elements.filterSections.clarity.classList.toggle('hidden', !includesDiamonds);
  }

  if (elements.filterSections.growth) {
    elements.filterSections.growth.classList.toggle('hidden', !includesDiamonds);
  }

  if (elements.filterSections.origin) {
    elements.filterSections.origin.classList.toggle('hidden', !includesGemstones);
  }

  if (!includesDiamonds) {
    state.filters.clarities.clear();
    elements.clarityFilterOptions?.querySelectorAll('input').forEach((input) => {
      input.checked = false;
    });
    if (state.filters.growth !== 'all') {
      state.filters.growth = 'all';
      elements.growthFilterOptions?.querySelectorAll('input').forEach((input) => {
        input.checked = input.value === 'all';
      });
    }
  }

  if (!includesGemstones) {
    state.filters.origins.clear();
    elements.originFilterOptions?.querySelectorAll('input').forEach((input) => {
      input.checked = false;
    });
  }
}

function applyFilters() {
  const searchTerm = state.searchTerm;
  const { filters } = state;

  const filtered = state.inventory.filter((item) => {
    if (filters.status !== 'all' && item.status !== filters.status) return false;

    if (filters.types.size && !filters.types.has(item.type)) return false;

    if (filters.shapes.size && !filters.shapes.has(item.shape)) return false;

    if (item.carat < filters.carat.min || item.carat > filters.carat.max) return false;

    if (filters.colors.size && !filters.colors.has(item.color)) return false;

    if (filters.clarities.size && (!item.clarity || !filters.clarities.has(item.clarity))) return false;

    if (filters.cuts.size && (!item.cut || !filters.cuts.has(item.cut))) return false;

    const itemLab = item.lab || 'None';
    if (filters.labs.size && !filters.labs.has(itemLab)) return false;

    if (!item.isCallForPrice) {
      const price = item.totalPrice ?? Infinity;
      if (price < filters.price.min || price > filters.price.max) return false;
    } else if (!filters.price.includeCall) {
      return false;
    }

    if (filters.treatments.size && (!item.treatment || !filters.treatments.has(item.treatment))) return false;

    if (filters.growth === 'natural' && (item.type !== 'Diamond' || item.growthType)) return false;
    if (filters.growth === 'lab' && (item.type !== 'Diamond' || !item.growthType)) return false;

    if (filters.origins.size && (!item.origin || !filters.origins.has(item.origin))) return false;

    if (searchTerm && !item.searchBlob.includes(searchTerm)) return false;

    return true;
  });

  state.filteredInventory = sortInventory(filtered);

  updateResultsCounts();
  renderProducts();
  renderActiveFilterChips();
  updateFilterCounts();
}

function sortInventory(list) {
  const sorted = [...list];
  switch (state.sortBy) {
    case 'price-asc':
      sorted.sort((a, b) => priceValue(a) - priceValue(b));
      break;
    case 'price-desc':
      sorted.sort((a, b) => priceValue(b) - priceValue(a));
      break;
    case 'carat-asc':
      sorted.sort((a, b) => a.carat - b.carat);
      break;
    case 'carat-desc':
      sorted.sort((a, b) => b.carat - a.carat);
      break;
    case 'stock-asc':
      sorted.sort((a, b) => a.id.localeCompare(b.id));
      break;
    case 'recent':
    default:
      // Keep original order (assuming CSV order is newest first)
      sorted.sort((a, b) => state.inventory.indexOf(a) - state.inventory.indexOf(b));
      break;
  }
  return sorted;
}

function priceValue(item) {
  if (item.isCallForPrice || item.totalPrice === null) {
    return Infinity;
  }
  return item.totalPrice;
}

function updateResultsCounts() {
  const visible = state.filteredInventory.length;
  elements.visibleCount.textContent = visible;
  elements.resultsVisible.textContent = visible;
  elements.filterResultCount.textContent = visible;
}

function renderProducts() {
  if (!elements.productGrid) return;
  elements.productGrid.innerHTML = '';

  const fragment = document.createDocumentFragment();

  state.filteredInventory.forEach((item) => {
    const isExpanded = item.id === state.expandedId;
    const card = isExpanded ? buildExpandedCard(item) : buildCompactCard(item);
    fragment.appendChild(card);
  });

  elements.productGrid.appendChild(fragment);

  if (state.expandedId) {
    const expandedCard = elements.productGrid.querySelector('.expanded-card');
    if (expandedCard) {
      scrollIntoView(expandedCard);
    }
  }
}

function buildCompactCard(item) {
  const card = document.createElement('article');
  card.className = 'product-card';
  if (item.status === 'Sold') card.classList.add('sold');
  card.dataset.productId = item.id;

  const badgeKey = statusKey(item.status);
  const statusBadge = document.createElement('div');
  statusBadge.className = 'status-badge';
  statusBadge.classList.add(`status-${badgeKey}`);
  statusBadge.textContent = item.status;
  card.appendChild(statusBadge);

  const media = document.createElement('div');
  media.className = 'product-media';
  if (item.images.length) {
    const img = document.createElement('img');
    img.src = item.images[0];
    img.alt = `${item.type} ${item.shape} ${item.carat.toFixed(2)}ct`;
    img.loading = 'lazy';
    media.appendChild(img);

    if (item.images.length > 1) {
      const indicator = document.createElement('div');
      indicator.className = 'gallery-indicator';
      indicator.textContent = '●'.repeat( Math.min(item.images.length, 5) );
      media.appendChild(indicator);
    }
  } else {
    const placeholder = document.createElement('div');
    const meta = PLACEHOLDER_META[item.type] || PLACEHOLDER_META.Default;
    placeholder.className = 'media-placeholder';
    placeholder.style.background = meta.gradient;
    placeholder.innerHTML = `
      <span class="icon">${meta.icon}</span>
      <span>${item.type || 'Gemstone'}</span>
    `;
    media.appendChild(placeholder);
  }

  if (item.videoLink) {
    const badge = document.createElement('div');
    badge.className = 'video-badge';
    badge.innerHTML = '<span aria-hidden="true">🎥</span> Video';
    media.appendChild(badge);
  }

  card.appendChild(media);

  const body = document.createElement('div');
  body.className = 'product-body';
  body.innerHTML = `
    <div class="stock-number">Stock # ${item.id}</div>
    <h3 class="product-title">${item.carat.toFixed(2)}ct ${item.shape || ''} ${item.type}</h3>
    <div class="product-specs">
      ${item.color ? `<span>Color: ${item.color}</span>` : ''}
      ${item.clarity ? `<span>Clarity: ${item.clarity}</span>` : ''}
      ${item.cut ? `<span>Cut: ${item.cut}</span>` : ''}
    </div>
    ${item.lab ? `<span class="certification-tag">⭐ ${item.lab} Certified</span>` : ''}
    <div class="price-section">
      ${renderPriceSnippet(item)}
    </div>
    <div class="location-info">📍 ${item.itemLocation || 'Global'}</div>
  `;

  const actions = document.createElement('div');
  actions.className = 'card-actions';
  const button = document.createElement('button');
  button.className = 'btn-view-details';
  button.type = 'button';
  button.innerHTML = '<span>View Details</span>';
  button.addEventListener('click', () => {
    toggleExpandedCard(item.id);
  });
  actions.appendChild(button);

  body.appendChild(actions);
  card.appendChild(body);

  return card;
}

function buildExpandedCard(item) {
  const container = document.createElement('article');
  container.className = 'expanded-card';
  container.dataset.productId = item.id;

  const left = document.createElement('div');
  left.className = 'expanded-left';
  left.appendChild(buildMediaGallery(item));
  if (item.videoLink) {
    left.appendChild(buildVideoPlayer(item.videoLink));
  } else {
    left.appendChild(buildVideoPlaceholder());
  }
  left.appendChild(build360Button());

  const right = document.createElement('div');
  right.className = 'expanded-right';
  right.appendChild(buildExpandedHeader(item));
  right.appendChild(buildCertificationSection(item));
  right.appendChild(buildSpecificationTable(item));
  right.appendChild(buildTreatmentSection(item));
  right.appendChild(buildPricingSection(item));
  right.appendChild(buildLocationSection(item));
  right.appendChild(buildActionButtons());

  container.appendChild(left);
  container.appendChild(right);

  return container;
}

function buildExpandedHeader(item) {
  const header = document.createElement('div');
  header.className = 'expanded-header';

  const closeBtn = document.createElement('button');
  closeBtn.className = 'close-btn';
  closeBtn.type = 'button';
  closeBtn.setAttribute('aria-label', 'Collapse details');
  closeBtn.innerHTML = '&times;';
  closeBtn.addEventListener('click', () => toggleExpandedCard(null));
  header.appendChild(closeBtn);

  const stockInfo = document.createElement('div');
  stockInfo.className = 'stock-info';
  stockInfo.textContent = `Stock # ${item.id}`;
  header.appendChild(stockInfo);

  const title = document.createElement('h2');
  title.className = 'product-title';
  title.textContent = `${item.carat.toFixed(2)} Carat ${item.shape} ${item.type}`;
  header.appendChild(title);

  const specs = document.createElement('div');
  specs.className = 'quick-specs';
  specs.innerHTML = `
    ${item.color ? `<span class="spec">Color: ${item.color}</span>` : ''}
    ${item.clarity ? `<span class="separator">•</span><span class="spec">Clarity: ${item.clarity}</span>` : ''}
    ${item.cut ? `<span class="separator">•</span><span class="spec">Cut: ${item.cut}</span>` : ''}
  `;
  header.appendChild(specs);

  const status = document.createElement('div');
  status.className = 'status-large';
  status.classList.add(statusKey(item.status));
  status.textContent = statusDescription(item.status);
  header.appendChild(status);

  return header;
}

function buildMediaGallery(item) {
  const gallery = document.createElement('div');
  gallery.className = 'image-gallery';

  const main = document.createElement('div');
  main.className = 'main-image';

  let imageIndex = 0;
  const mainImage = document.createElement('img');
  if (item.images.length) {
    mainImage.src = item.images[0];
    mainImage.alt = `${item.type} ${item.shape}`;
  } else {
    const meta = PLACEHOLDER_META[item.type] || PLACEHOLDER_META.Default;
    main.style.background = meta.gradient;
  }
  main.appendChild(mainImage);

  if (item.images.length) {
    const zoomOverlay = document.createElement('div');
    zoomOverlay.className = 'zoom-overlay';
    zoomOverlay.textContent = '🔍 Click to zoom';
    main.appendChild(zoomOverlay);
    main.addEventListener('click', () => {
      openLightbox(item.images[imageIndex], `${item.type} ${item.shape}`);
    });
  }

  const nav = document.createElement('div');
  nav.className = 'gallery-nav';
  const prev = document.createElement('button');
  prev.type = 'button';
  prev.textContent = '◄';
  prev.addEventListener('click', () => {
    imageIndex = (imageIndex - 1 + item.images.length) % item.images.length;
    mainImage.src = item.images[imageIndex];
    updateActiveThumb();
    counter.textContent = `${imageIndex + 1} / ${item.images.length}`;
  });
  const next = document.createElement('button');
  next.type = 'button';
  next.textContent = '►';
  next.addEventListener('click', () => {
    imageIndex = (imageIndex + 1) % item.images.length;
    mainImage.src = item.images[imageIndex];
    updateActiveThumb();
    counter.textContent = `${imageIndex + 1} / ${item.images.length}`;
  });
  nav.appendChild(prev);
  nav.appendChild(next);
  if (item.images.length > 1) main.appendChild(nav);

  const counter = document.createElement('span');
  counter.className = 'image-counter';
  counter.textContent = item.images.length ? `1 / ${item.images.length}` : '1 / 1';
  if (item.images.length > 1) main.appendChild(counter);

  gallery.appendChild(main);

  const thumbs = document.createElement('div');
  thumbs.className = 'thumbnail-strip';
  if (item.images.length) {
    item.images.forEach((imgSrc, index) => {
      const thumb = document.createElement('img');
      thumb.src = imgSrc;
      thumb.alt = `${item.type} thumbnail ${index + 1}`;
      if (index === 0) thumb.classList.add('active');
      thumb.addEventListener('click', () => {
        imageIndex = index;
        mainImage.src = imgSrc;
        updateActiveThumb();
        counter.textContent = `${index + 1} / ${item.images.length}`;
      });
      thumbs.appendChild(thumb);
    });
  } else {
    const placeholder = document.createElement('div');
    placeholder.className = 'media-placeholder';
    const meta = PLACEHOLDER_META[item.type] || PLACEHOLDER_META.Default;
    placeholder.style.background = meta.gradient;
    placeholder.innerHTML = `
      <span class="icon">${meta.icon}</span>
      <span>${item.type}</span>
    `;
    thumbs.appendChild(placeholder);
  }

  const updateActiveThumb = () => {
    thumbs.querySelectorAll('img').forEach((thumb, idx) => {
      thumb.classList.toggle('active', idx === imageIndex);
    });
  };

  gallery.appendChild(thumbs);
  return gallery;
}

function buildVideoPlayer(url) {
  const wrapper = document.createElement('div');
  wrapper.className = 'video-player';
  wrapper.innerHTML = '<h4>Product Video</h4>';

  const embedUrl = getEmbedUrl(url);

  if (embedUrl.type === 'iframe') {
    const iframe = document.createElement('iframe');
    iframe.src = embedUrl.url;
    iframe.width = '100%';
    iframe.height = '315';
    iframe.frameBorder = '0';
    iframe.allowFullscreen = true;
    iframe.setAttribute('loading', 'lazy');
    wrapper.appendChild(iframe);
  } else {
    const video = document.createElement('video');
    video.controls = true;
    video.width = '100%';
    const source = document.createElement('source');
    source.src = url;
    source.type = embedUrl.mime || 'video/mp4';
    video.appendChild(source);
    video.textContent = "Your browser doesn't support video playback.";
    wrapper.appendChild(video);
  }

  return wrapper;
}

function buildVideoPlaceholder() {
  const wrapper = document.createElement('div');
  wrapper.className = 'video-player';
  wrapper.innerHTML = `
    <h4>Product Video</h4>
    <div class="media-placeholder" style="padding: 24px; background: rgba(26,31,54,0.05); border-radius: 16px;">
      <span class="icon">🎥</span>
      <span>Video not available yet</span>
    </div>
  `;
  return wrapper;
}

function build360Button() {
  const wrapper = document.createElement('div');
  wrapper.className = 'view-360';
  wrapper.innerHTML = `
    <button class="btn-360" type="button" disabled>
      🔄 360° View
      <span class="coming-soon">Coming Soon</span>
    </button>
  `;
  return wrapper;
}

function buildCertificationSection(item) {
  const section = document.createElement('section');
  section.className = 'certification-section';

  const header = document.createElement('div');
  header.className = 'cert-header';

  const logo = document.createElement('div');
  logo.className = 'lab-logo';
  logo.textContent = item.lab ? item.lab.slice(0, 3).toUpperCase() : '—';
  header.appendChild(logo);

  const info = document.createElement('div');
  info.className = 'cert-info';
  info.innerHTML = `
    <strong>${item.lab || 'Uncertified'}</strong>
    ${item.reportNumber ? `<span class="cert-number">Report #: ${item.reportNumber}</span>` : ''}
  `;
  header.appendChild(info);

  section.appendChild(header);

  if (item.lab && LAB_LINKS[item.lab] && item.reportNumber) {
    const button = document.createElement('button');
    button.className = 'btn-view-cert';
    button.type = 'button';
    button.textContent = '📄 View Certificate';
    button.addEventListener('click', () => {
      const url = `${LAB_LINKS[item.lab]}${encodeURIComponent(item.reportNumber)}`;
      window.open(url, '_blank', 'noopener');
    });
    section.appendChild(button);
  } else {
    const note = document.createElement('div');
    note.className = 'cert-note';
    note.textContent = item.lab ? 'Certificate available on request.' : 'No certification on file.';
    section.appendChild(note);
  }

  return section;
}

function buildSpecificationTable(item) {
  const section = document.createElement('section');
  section.className = 'specifications';
  section.innerHTML = '<h3>Detailed Specifications</h3>';

  const table = document.createElement('table');
  table.className = 'spec-table';

  const rows = [
    ['Type', item.type],
    ['Shape', item.shape],
    ['Carat Weight', `${item.carat.toFixed(2)} ct`],
    ['Color Grade', withOptionalSwatch(item.color)],
    ['Clarity Grade', item.clarity || '—'],
    ['Cut Quality', item.cut || '—'],
    ['Measurements', item.measurements || '—'],
    ['Length/Width Ratio', item.ratio ? item.ratio.toFixed(2) : '—'],
    ['Growth Method', item.growthType || (item.type === 'Diamond' ? 'Natural' : '—')],
    ['Origin', item.origin || '—'],
  ];

  rows.forEach(([label, value]) => {
    if (!value || value === '—') {
      if (label === 'Growth Method' && item.type !== 'Diamond') return;
      if (label === 'Origin' && (!item.origin || item.type === 'Diamond')) return;
    }
    const row = document.createElement('tr');
    const labelCell = document.createElement('td');
    labelCell.className = 'spec-label';
    labelCell.textContent = label;
    const valueCell = document.createElement('td');
    valueCell.className = 'spec-value';
    valueCell.innerHTML = value || '—';
    row.appendChild(labelCell);
    row.appendChild(valueCell);
    table.appendChild(row);
  });

  section.appendChild(table);
  return section;
}

function buildTreatmentSection(item) {
  const section = document.createElement('section');
  section.className = 'treatment-section';
  section.innerHTML = '<h3>Treatment Details</h3>';

  const detail = document.createElement('p');
  const treatment = item.treatment || 'None';
  const notes = item.treatmentNotes || (treatment === 'None' ? 'No treatments detected.' : 'Documentation on file.');
  detail.innerHTML = `<strong>${treatment}</strong> &mdash; ${notes}`;
  section.appendChild(detail);

  return section;
}

function buildPricingSection(item) {
  const section = document.createElement('section');
  section.className = 'pricing-section';
  section.innerHTML = `
    <h3>Pricing</h3>
    <div class="pricing-main">${item.isCallForPrice ? 'Call For Price' : formatPrice(item.totalPrice)}</div>
    <div class="pricing-note">Per Carat: ${item.perCaratPrice ? formatPrice(item.perCaratPrice) : 'Contact us for per-carat pricing'}</div>
  `;

  return section;
}

function buildLocationSection(item) {
  const section = document.createElement('section');
  section.className = 'location-section';
  section.innerHTML = `
    <h3>Location & Availability</h3>
    <p>📍 ${item.itemLocation || 'Global availability'}</p>
    ${item.locationNotes ? `<p>🔒 ${item.locationNotes}</p>` : ''}
    <p>✓ ${availabilityMessage(item.status)}</p>
  `;

  return section;
}

function buildActionButtons() {
  const section = document.createElement('div');
  section.className = 'action-buttons';

  const buttons = [
    { label: '📞 Request Quote', type: 'primary' },
    { label: '📧 Contact Us', type: 'outline' },
    { label: '♡ Add to Wishlist', type: 'outline' },
    { label: '📤 Share', type: 'outline' },
  ];

  buttons.forEach((btn) => {
    const button = document.createElement('button');
    button.className = btn.type === 'primary' ? 'btn' : 'btn-outline';
    button.type = 'button';
    button.textContent = btn.label;
    button.addEventListener('click', () => showComingSoon('This feature is coming soon!'));
    section.appendChild(button);
  });

  return section;
}

function renderPriceSnippet(item) {
  if (item.isCallForPrice) {
    return `
      <div class="price-total">Call For Price</div>
      <div class="price-per-carat">Contact us for pricing details.</div>
    `;
  }
  const perCaratDisplay = item.perCaratPrice ? `${formatPrice(item.perCaratPrice)} per carat` : 'Contact for per-carat pricing';
  return `
    <div class="price-total">${formatPrice(item.totalPrice)}</div>
    <div class="price-per-carat">${perCaratDisplay}</div>
  `;
}

function renderActiveFilterChips() {
  if (!elements.activeFilterChips) return;
  elements.activeFilterChips.innerHTML = '';

  const chips = [];

  if (state.searchTerm) {
    chips.push(createChip('Search', state.searchTerm, () => {
      state.searchTerm = '';
      syncHeaderSearch('');
      syncQuickSearch('');
      applyFilters();
    }));
  }

  if (state.filters.status !== 'all') {
    chips.push(createChip('Status', state.filters.status, () => {
      state.filters.status = 'all';
      document.querySelector('input[name="status"][value="all"]').checked = true;
      applyFilters();
    }));
  }

  if (state.filters.types.size) {
    state.filters.types.forEach((type) => {
      chips.push(createChip('Type', type, () => {
        state.filters.types.delete(type);
        elements.typeFilterOptions?.querySelectorAll('input').forEach((input) => {
          if (input.value === type) input.checked = false;
        });
        applyFilters();
        updateColorFilterOptions();
        updateConditionalFilters();
      }));
    });
  }

  if (state.filters.shapes.size) {
    state.filters.shapes.forEach((shape) => {
      chips.push(createChip('Shape', shape, () => {
        state.filters.shapes.delete(shape);
        elements.shapeFilterOptions?.querySelectorAll('input').forEach((input) => {
          if (input.value === shape) input.checked = false;
        });
        applyFilters();
      }));
    });
  }

  if (state.filters.colors.size) {
    state.filters.colors.forEach((color) => {
      chips.push(createChip('Color', color, () => {
        state.filters.colors.delete(color);
        elements.colorFilterOptions?.querySelectorAll('input').forEach((input) => {
          if (input.value === color) input.checked = false;
        });
        applyFilters();
      }));
    });
  }

  if (state.filters.clarities.size) {
    state.filters.clarities.forEach((clarity) => {
      chips.push(createChip('Clarity', clarity, () => {
        state.filters.clarities.delete(clarity);
        elements.clarityFilterOptions?.querySelectorAll('input').forEach((input) => {
          if (input.value === clarity) input.checked = false;
        });
        applyFilters();
      }));
    });
  }

  if (state.filters.cuts.size) {
    state.filters.cuts.forEach((cut) => {
      chips.push(createChip('Cut', cut, () => {
        state.filters.cuts.delete(cut);
        elements.cutFilterOptions?.querySelectorAll('input').forEach((input) => {
          if (input.value === cut) input.checked = false;
        });
        applyFilters();
      }));
    });
  }

  if (state.filters.labs.size) {
    state.filters.labs.forEach((lab) => {
      chips.push(createChip('Lab', lab, () => {
        state.filters.labs.delete(lab);
        elements.labFilterOptions?.querySelectorAll('input').forEach((input) => {
          if (input.value === lab) input.checked = false;
        });
        applyFilters();
      }));
    });
  }

  if (state.filters.treatments.size) {
    state.filters.treatments.forEach((treatment) => {
      chips.push(createChip('Treatment', treatment, () => {
        state.filters.treatments.delete(treatment);
        elements.treatmentFilterOptions?.querySelectorAll('input').forEach((input) => {
          if (input.value === treatment) input.checked = false;
        });
        applyFilters();
      }));
    });
  }

  if (state.filters.origins.size) {
    state.filters.origins.forEach((origin) => {
      chips.push(createChip('Origin', origin, () => {
        state.filters.origins.delete(origin);
        elements.originFilterOptions?.querySelectorAll('input').forEach((input) => {
          if (input.value === origin) input.checked = false;
        });
        applyFilters();
      }));
    });
  }

  if (state.filters.growth !== 'all') {
    const label = state.filters.growth === 'natural' ? 'Natural Diamonds' : 'Lab-Grown Diamonds';
    chips.push(createChip('Growth', label, () => {
      state.filters.growth = 'all';
      elements.growthFilterOptions?.querySelectorAll('input').forEach((input) => {
        input.checked = input.value === 'all';
      });
      applyFilters();
    }));
  }

  if (state.filters.carat.min !== 0.5 || state.filters.carat.max !== 10) {
    chips.push(createChip('Carat', `${state.filters.carat.min.toFixed(2)} - ${state.filters.carat.max.toFixed(2)}ct`, () => {
      resetRangeToDefaults('carat');
      elements.caratPresets?.querySelectorAll('input').forEach((input) => {
        input.checked = false;
      });
      applyFilters();
    }));
  }

  const defaultPriceRange = state.filters.price.min === 0 && state.filters.price.max === 20000;
  if (!defaultPriceRange) {
    const priceText = `${formatPrice(state.filters.price.min)} - ${formatPrice(state.filters.price.max)}`;
    chips.push(createChip('Price', priceText, () => {
      resetRangeToDefaults('price');
      elements.pricePresets?.querySelectorAll('input').forEach((input) => {
        input.checked = false;
      });
      applyFilters();
    }));
  }

  if (!state.filters.price.includeCall) {
    chips.push(createChip('Price', 'Hide “Call For Price”', () => {
      state.filters.price.includeCall = true;
      if (elements.priceCallOption) elements.priceCallOption.checked = true;
      applyFilters();
    }));
  }

  chips.forEach((chip) => elements.activeFilterChips.appendChild(chip));
  elements.activeFilterCount.textContent = chips.length;
}

function createChip(label, value, onRemove) {
  const chip = document.createElement('span');
  chip.className = 'filter-chip';
  chip.innerHTML = `<span>${label}: ${value}</span>`;

  const button = document.createElement('button');
  button.type = 'button';
  button.setAttribute('aria-label', `Remove ${label} filter`);
  button.innerHTML = '&times;';
  button.addEventListener('click', onRemove);

  chip.appendChild(button);
  return chip;
}

function updateFilterCounts() {
  const counts = {
    status: { all: state.inventory.length, Available: 0, 'On Hold': 0, Sold: 0 },
    type: {},
    shape: {},
    color: {},
    clarity: {},
    cut: {},
    lab: {},
    treatment: {},
    origin: {},
  };

  state.inventory.forEach((item) => {
    counts.status[item.status] = (counts.status[item.status] || 0) + 1;
    counts.type[item.type] = (counts.type[item.type] || 0) + 1;
    counts.shape[item.shape] = (counts.shape[item.shape] || 0) + 1;
    if (item.color) counts.color[item.color] = (counts.color[item.color] || 0) + 1;
    if (item.clarity) counts.clarity[item.clarity] = (counts.clarity[item.clarity] || 0) + 1;
    if (item.cut) counts.cut[item.cut] = (counts.cut[item.cut] || 0) + 1;
    const lab = item.lab || 'None';
    counts.lab[lab] = (counts.lab[lab] || 0) + 1;
    if (item.treatment) counts.treatment[item.treatment] = (counts.treatment[item.treatment] || 0) + 1;
    if (item.origin) counts.origin[item.origin] = (counts.origin[item.origin] || 0) + 1;
  });

  if (elements.statusCounts) {
    elements.statusCounts.all.textContent = counts.status.all;
    elements.statusCounts.available.textContent = counts.status.Available || 0;
    elements.statusCounts.hold.textContent = counts.status['On Hold'] || 0;
    elements.statusCounts.sold.textContent = counts.status.Sold || 0;
  }

  updateCountElements('type', counts.type);
  updateCountElements('shape', counts.shape);
  updateCountElements('color', counts.color, true);
  updateCountElements('clarity', counts.clarity);
  updateCountElements('cut', counts.cut);
  updateCountElements('lab', counts.lab);
  updateCountElements('treatment', counts.treatment);
  updateCountElements('origin', counts.origin, true);
}

function updateCountElements(prefix, data, sanitize = false) {
  Object.entries(data).forEach(([key, value]) => {
    const baseKey = key.toLowerCase();
    const attrKey = sanitize ? baseKey.replace(/\s+/g, '') : baseKey;
    const selector = `[data-count="${prefix}-${attrKey}"]`;
    const element = document.querySelector(selector);
    if (element) element.textContent = value;
  });
}

function clearAllFilters() {
  state.filters.status = 'all';
  state.filters.types.clear();
  state.filters.shapes.clear();
  state.filters.colors.clear();
  state.filters.clarities.clear();
  state.filters.cuts.clear();
  state.filters.labs.clear();
  state.filters.treatments.clear();
  state.filters.origins.clear();
  state.filters.growth = 'all';
  state.filters.carat = { min: 0.5, max: 10 };
  state.filters.price = { min: 0, max: 20000, includeCall: true };
  state.searchTerm = '';
  state.expandedId = null;

  document.querySelectorAll('.filter-section input').forEach((input) => {
    if (input.type === 'checkbox') input.checked = false;
    if (input.type === 'radio') input.checked = input.value === 'all';
  });

  resetRangeToDefaults('carat');
  resetRangeToDefaults('price');
  if (elements.priceCallOption) elements.priceCallOption.checked = true;
  updateColorFilterOptions();
  updateConditionalFilters();
  syncQuickSearch('');
  syncHeaderSearch('');
  applyFilters();
}

function toggleExpandedCard(id) {
  state.expandedId = state.expandedId === id ? null : id;
  renderProducts();
}

function openLightbox(src, alt) {
  if (!elements.lightboxModal || !elements.lightboxImage) return;
  elements.lightboxImage.src = src;
  elements.lightboxImage.alt = alt;
  openModal(elements.lightboxModal);
}

function openModal(modal) {
  if (!modal) return;
  modal.classList.remove('hidden');
}

function closeModal(modal) {
  if (!modal) return;
  modal.classList.add('hidden');
}

function showComingSoon(message) {
  if (!elements.comingSoonModal) return;
  const text = elements.comingSoonModal.querySelector('p');
  if (text) text.textContent = message;
  openModal(elements.comingSoonModal);
}

function withOptionalSwatch(color) {
  if (!color) return '—';
  const swatchColor = colorToHex(color);
  if (!swatchColor) return color;
  return `${color} <span class="color-swatch" style="background:${swatchColor}"></span>`;
}

function colorToHex(color) {
  const map = {
    D: '#f8f9fa',
    E: '#f1f5f9',
    F: '#e2e8f0',
    G: '#e0f2fe',
    H: '#fef3c7',
    I: '#fde68a',
    J: '#fcd34d',
    'Deep Green': '#065f46',
    'Vivid Pink': '#be123c',
    'Royal Blue': '#1d4ed8',
    Purple: '#6d28d9',
    Orange: '#ea580c',
    Teal: '#0f766e',
    Violet: '#7c3aed',
    Padparadscha: '#fb7185',
    Yellow: '#facc15',
  };
  return map[color] || null;
}

function statusKey(status) {
  switch (status) {
    case 'Available':
      return 'available';
    case 'On Hold':
      return 'hold';
    case 'Sold':
      return 'sold';
    default:
      return 'available';
  }
}

function statusDescription(status) {
  switch (status) {
    case 'Available':
      return '✓ Available for Purchase';
    case 'On Hold':
      return '⏳ Currently On Hold';
    case 'Sold':
      return '✕ Sold - Archive';
    default:
      return status;
  }
}

function availabilityMessage(status) {
  switch (status) {
    case 'Available':
      return 'Available for private viewing';
    case 'On Hold':
      return 'Reserved - join priority list';
    case 'Sold':
      return 'Archived for provenance';
    default:
      return 'By appointment only';
  }
}

function formatPrice(value) {
  if (value === null || value === undefined || value === Infinity) return 'Call For Price';
  return value.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  });
}

function getEmbedUrl(url) {
  const youtubeMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]+)/);
  if (youtubeMatch) {
    return { type: 'iframe', url: `https://www.youtube.com/embed/${youtubeMatch[1]}` };
  }
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) {
    return { type: 'iframe', url: `https://player.vimeo.com/video/${vimeoMatch[1]}` };
  }
  const extension = url.split('.').pop().toLowerCase();
  const mime = extension === 'webm' ? 'video/webm' : 'video/mp4';
  return { type: 'video', url, mime };
}

function scrollIntoView(element) {
  const rect = element.getBoundingClientRect();
  const absoluteElementTop = rect.top + window.scrollY;
  const offset = 120;
  window.scrollTo({ top: absoluteElementTop - offset, behavior: 'smooth' });
}

function toggleClearButton(button, value) {
  if (!button) return;
  if (value) button.classList.add('active');
  else button.classList.remove('active');
}

function syncQuickSearch(value) {
  if (elements.quickSearch) {
    elements.quickSearch.value = value;
    toggleClearButton(elements.quickSearchClear, value);
  }
}

function syncHeaderSearch(value) {
  if (elements.headerSearch) {
    elements.headerSearch.value = value;
    toggleClearButton(elements.headerSearchClear, value);
  }
}

function debounce(fn, delay) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), delay);
  };
}

