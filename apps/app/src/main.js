import './style.css';
import lottie from 'lottie-web';
import { parseGIF, decompressFrames } from 'gifuct-js';

// App logo (gif)
import appLogoGif from './assets/animation/app_logo/22 - Magic Crystal Ball.gif?url';

// Optional static fallback for logo end-frame (if you add one later)
// import appLogoStill from './assets/animation/app_logo/app_logo_still.png?url';

// Start button Lottie
import startLottieUrl from './assets/animation/screen_control/start_screen/start_draw_button/Start_lottie.json?url';

// Loading gifs (random)
const LOADING_GIFS = import.meta.glob('./assets/animation/loading/*.gif', { eager: true, query: '?url', import: 'default' });
const CARD_TAKE_AWAY_DURATION_MS = 460;
const LOADING_SCREEN_DURATION_MS = 1800;

// Screen control Lotties
const ICONS = {
  start_screen: {
    next_arrow_deck_picker: new URL('./assets/animation/screen_control/start_screen/next_arrow_deck_picker/31-arrow-right-outline.json', import.meta.url).toString(),
    back_arrow_count_picker: new URL('./assets/animation/screen_control/start_screen/back_arrow_count_picker/32-arrow-left-outline.json', import.meta.url).toString(),
  },
  result_screen: {
    copy_spread: new URL('./assets/animation/screen_control/result_screen/copy_spread/60-documents-outline.json', import.meta.url).toString(),
    view_details: new URL('./assets/animation/screen_control/result_screen/view_details/19-magnifier-zoom-search-outline.json', import.meta.url).toString(),
    home: new URL('./assets/animation/screen_control/result_screen/home/242-copy-morph-outline.json', import.meta.url).toString(),
  },
  detail_screen: {
    previous: new URL('./assets/animation/screen_control/detail_screen/previous/32-arrow-left-outline.json', import.meta.url).toString(),
    next: new URL('./assets/animation/screen_control/detail_screen/next/31-arrow-right-outline.json', import.meta.url).toString(),
    back_to_spread: new URL('./assets/animation/screen_control/detail_screen/back_to_spread/12-layers-outline.json', import.meta.url).toString(),
    reshuffle: new URL('./assets/animation/screen_control/detail_screen/reshuffle/229-arrow-18.json', import.meta.url).toString(),
    copy_single_card: new URL('./assets/animation/screen_control/detail_screen/copy_single_card/56-document-outline.json', import.meta.url).toString(),
  }
};

async function fetchJson(url) {
  const res = await fetch(url);
  return await res.json();
}

// Optional recolor of Lottie strokes/fills to match theme glow.
// Works only if JSON uses standard color fields (common).
function recolorLottie(animationData, hex) {
  // hex -> 0..1 rgb
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0,2), 16) / 255;
  const g = parseInt(h.slice(2,4), 16) / 255;
  const b = parseInt(h.slice(4,6), 16) / 255;

  const walk = (obj) => {
    if (!obj || typeof obj !== 'object') return;
    for (const k of Object.keys(obj)) {
      const v = obj[k];
      // Lottie colors often at: c.k = [r,g,b,a] or c.k = {a:0,k:[...]}
      if (k === 'c' && v && typeof v === 'object' && v.k) {
        if (Array.isArray(v.k) && v.k.length >= 3) {
          v.k[0] = r; v.k[1] = g; v.k[2] = b;
        } else if (v.k && Array.isArray(v.k.k) && v.k.k.length >= 3) {
          v.k.k[0] = r; v.k.k[1] = g; v.k.k[2] = b;
        }
      }
      walk(v);
    }
  };
  walk(animationData);
  return animationData;
}

async function mountLottieLoop(container, jsonUrl, { sizePx = 24, colorHex = '#ffd36a', loop = true, autoplay = true } = {}) {
  container.innerHTML = '';
  container.style.width = `${sizePx}px`;
  container.style.height = `${sizePx}px`;

  const data = recolorLottie(await fetchJson(jsonUrl), colorHex);

  return lottie.loadAnimation({
    container,
    renderer: 'svg',
    loop,
    autoplay,
    animationData: data,
    rendererSettings: { progressiveLoad: true }
  });
}

async function mountLottieInteractive(container, jsonUrl, { sizePx = 24, colorHex = '#ffd36a' } = {}) {
  const anim = await mountLottieLoop(container, jsonUrl, {
    sizePx,
    colorHex,
    loop: false,
    autoplay: false
  });

  anim.goToAndStop(0, true);

  const host = container.closest('button') || container;
  let lastTriggerTs = 0;
  const trigger = () => {
    if (host instanceof HTMLButtonElement && host.disabled) return;
    const now = performance.now();
    if (now - lastTriggerTs < 100) return;
    lastTriggerTs = now;
    anim.stop();
    anim.play();
  };

  host.addEventListener('pointerenter', trigger, { passive: true });
  host.addEventListener('pointerdown', trigger, { passive: true });
  host.addEventListener('click', trigger, { passive: true });
  host.addEventListener('touchstart', trigger, { passive: true });
  host.addEventListener('focus', trigger, { passive: true });
  host.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') trigger();
  });

  return anim;
}

function randomLoadingGif() {
  const urls = Object.values(LOADING_GIFS);
  return urls[Math.floor(Math.random() * urls.length)];
}

let logoStillFrameDataUrl = null;
let logoFreezeTimer = null;
let logoDecodePromise = null;
let loadingTimer = null;

function buildLogoStillFrame(gifWidth, gifHeight, frames) {
  if (!frames || !frames.length) return null;

  try {
    const canvas = document.createElement('canvas');
    canvas.width = gifWidth;
    canvas.height = gifHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    let prev = null;
    for (const frame of frames) {
      if (prev) {
        if (prev.disposalType === 2) {
          ctx.clearRect(prev.dims.left, prev.dims.top, prev.dims.width, prev.dims.height);
        } else if (prev.disposalType === 3 && prev.restoreImageData) {
          ctx.putImageData(prev.restoreImageData, 0, 0);
        }
      }

      const restoreImageData = frame.disposalType === 3
        ? ctx.getImageData(0, 0, gifWidth, gifHeight)
        : null;

      const patchData = frame.patch instanceof Uint8ClampedArray
        ? frame.patch
        : new Uint8ClampedArray(frame.patch);
      const imageData = new ImageData(patchData, frame.dims.width, frame.dims.height);
      ctx.putImageData(imageData, frame.dims.left, frame.dims.top);

      prev = {
        disposalType: frame.disposalType,
        dims: frame.dims,
        restoreImageData
      };
    }

    return canvas.toDataURL('image/png');
  } catch {
    return null;
  }
}

function applyLogoStillFrame() {
  const logoEl = document.getElementById('appLogo');
  if (!logoEl) return false;
  if (!logoStillFrameDataUrl) return false;

  logoEl.src = logoStillFrameDataUrl;
  logoEl.classList.add('frozen');
  return true;
}

async function decodeLogoStillAndDuration() {
  if (logoDecodePromise) return logoDecodePromise;

  logoDecodePromise = (async () => {
    const res = await fetch(appLogoGif);
    const arrayBuffer = await res.arrayBuffer();
    const gif = parseGIF(arrayBuffer);
    const frames = decompressFrames(gif, true);

    const durationMs = Math.max(
      900,
      Math.round(frames.reduce((sum, f) => sum + (f.delay || 0), 0))
    );
    const stillDataUrl = buildLogoStillFrame(gif.lsd.width, gif.lsd.height, frames);
    return { durationMs, stillDataUrl };
  })().catch(() => ({ durationMs: 2600, stillDataUrl: null }));

  return logoDecodePromise;
}

function scheduleLogoFreeze(durationMs) {
  clearTimeout(logoFreezeTimer);
  const freezeAt = Math.max(650, Math.round(durationMs - 40));
  logoFreezeTimer = setTimeout(() => {
    logoFreezeTimer = null;
    applyLogoStillFrame();
  }, freezeAt);
}

function setupPickerLogo() {
  const logoEl = document.getElementById('appLogo');
  if (!logoEl) return;

  if (logoStillFrameDataUrl) {
    logoEl.src = logoStillFrameDataUrl;
    logoEl.classList.add('frozen');
    return;
  }

  if (logoFreezeTimer) return;

  decodeLogoStillAndDuration()
    .then(({ durationMs, stillDataUrl }) => {
      if (stillDataUrl) logoStillFrameDataUrl = stillDataUrl;
      scheduleLogoFreeze(durationMs);
    })
    .catch(() => {
      scheduleLogoFreeze(2200);
    });
}

function mountPickerControlLotties() {
  const next = document.getElementById('iconNextDeck');
  if (next) {
    mountLottieInteractive(next, ICONS.start_screen.next_arrow_deck_picker, { sizePx: 28, colorHex: '#ffd36a' })
      .catch(() => {});
  }

  const back = document.getElementById('iconBackCount');
  if (back) {
    mountLottieInteractive(back, ICONS.start_screen.back_arrow_count_picker, { sizePx: 28, colorHex: '#9b5cff' })
      .catch(() => {});
  }

  const start = document.getElementById('iconStartDraw');
  if (start) {
    mountLottieInteractive(start, startLottieUrl, { sizePx: 28, colorHex: '#1d1300' })
      .catch(() => {});
  }
}
// ------------------------------------------------------------
// ANIMATION ASSETS (GIF)
// ------------------------------------------------------------
const ANIM_ASSETS = import.meta.glob(
  './assets/animation/*.{gif,GIF}',
  { eager: true, query: '?url', import: 'default' }
);

function animAsset(name){
  return ANIM_ASSETS[`./assets/animation/${name}`] || null;
}

let activeWheelCtrl = null; // set by initWheel()



function stepActiveWheel(delta) {
  if (!activeWheelCtrl) return;
  activeWheelCtrl.step(delta);
}

const LOCAL_ASSETS = import.meta.glob(
  './assets/decks/**/{thumb.{jpg,jpeg,png,JPG,JPEG,PNG},back.{jpg,jpeg,png,JPG,JPEG,PNG},image/*.{jpg,jpeg,png,JPG,JPEG,PNG},images/*.{jpg,jpeg,png,JPG,JPEG,PNG}}',
  { eager: true, query: '?url', import: 'default' }
);

function localAsset(path) {
  const v = LOCAL_ASSETS[path];
  return (typeof v === 'string' && v.length > 0) ? v : null;
}

function deckThumb(deckId) {
  return (
    localAsset(`./assets/decks/${deckId}/thumb.jpg`) ||
    localAsset(`./assets/decks/${deckId}/thumb.png`)
  );
}

function deckBack(deckId) {
  return (
    localAsset(`./assets/decks/${deckId}/back.jpg`) ||
    localAsset(`./assets/decks/${deckId}/back.jpeg`) ||
    localAsset(`./assets/decks/${deckId}/back.png`)
  );
}

function deckCardImage(deckId, idx) {
  const n1 = String(idx);                 // "7"
  const n2 = String(idx).padStart(2, '0'); // "07"

  const bases = [
    `./assets/decks/${deckId}/image/${n1}`,
    `./assets/decks/${deckId}/image/${n2}`,
    `./assets/decks/${deckId}/images/${n1}`,
    `./assets/decks/${deckId}/images/${n2}`,
  ];

  const exts = ['.jpg', '.jpeg', '.png', '.JPG', '.JPEG', '.PNG'];

  for (const b of bases) {
    for (const e of exts) {
      const u = localAsset(b + e);
      if (u) return u;
    }
  }
  return null;
}

// ------------------------------------------------------------
// DECK DEFINITIONS
// ------------------------------------------------------------

// --- Primordial Tarot (Tarot of the Origins naming) ---
const PT_MAJOR_NAMES = [
  'The Fool', 'The Magician', 'The Great Mother', 'The Mother', 'The Father',
  'The Shaman', 'Union', 'The Chariot', 'Abundance', 'The Hermit',
  'Time', 'Creative Power', 'Sacrifice', 'Death', 'Source',
  'Demon', 'Menhir', 'The Star', 'The Moon', 'The Sun',
  'The Prey', 'The World'
];

const PT_SUITS = [
  { key: 'nature', display: 'Nature' },
  { key: 'soul', display: 'Soul' },
  { key: 'blood', display: 'Blood' },
  { key: 'jewels', display: 'Jewels' }
];

const PT_COURT = ['Child', 'Animal', 'Woman', 'Man'];

function buildPrimordialDeck() {
  const deck = [];
  PT_MAJOR_NAMES.forEach((name, i) => deck.push({ name, type: 'major', number: i, image: null }));
  PT_SUITS.forEach(suit => {
    for (let n = 1; n <= 10; n++) deck.push({ name: `${n} of ${suit.display}`, type: 'minor', suit: suit.display, image: null });
    PT_COURT.forEach(court => deck.push({ name: `${court} of ${suit.display}`, type: 'minor', suit: suit.display, image: null }));
  });
  return deck;
}

// --- Standard 78-card deck builder (RWS naming) ---
const STD_MAJOR = [
  'The Fool', 'The Magician', 'The High Priestess', 'The Empress', 'The Emperor',
  'The Hierophant', 'The Lovers', 'The Chariot', 'Strength', 'The Hermit',
  'Wheel of Fortune', 'Justice', 'The Hanged Man', 'Death', 'Temperance',
  'The Devil', 'The Tower', 'The Star', 'The Moon', 'The Sun',
  'Judgement', 'The World'
];

const STD_SUITS = ['Wands', 'Cups', 'Swords', 'Pentacles'];
const STD_RANKS = ['Ace','Two','Three','Four','Five','Six','Seven','Eight','Nine','Ten','Page','Knight','Queen','King'];

function buildStandardDeck() {
  const deck = [];
  STD_MAJOR.forEach((name, i) => deck.push({ name, type: 'major', number: i, image: null }));
  STD_SUITS.forEach(suit => {
    STD_RANKS.forEach(rank => deck.push({ name: `${rank} of ${suit}`, type: 'minor', suit, image: null }));
  });
  return deck;
}

// --- Builders that attach local numbered images (00..77) ---
function buildStandardDeckNumberedImages(deckId) {
  const deck = buildStandardDeck();
  return deck.map((card, idx) => ({ ...card, image: deckCardImage(deckId, idx) }));
}

function buildPrimordialDeckNumberedImages(deckId = 'primordial') {
  const deck = buildPrimordialDeck();
  return deck.map((card, idx) => ({ ...card, image: deckCardImage(deckId, idx) }));
}

// ------------------------------------------------------------
// DECK REGISTRY
// ------------------------------------------------------------
// NOTE: These IDs must match folder names under src/assets/decks/<id>/...
const DECK_LIST = [
  { id: 'lightseer', name: "Light Seer's", thumb: deckThumb('lightseer'), build: () => buildStandardDeckNumberedImages('lightseer'), hasImages: true },

  { id: 'hermetic', name: 'The Hermetic', thumb: deckThumb('hermetic'), build: () => buildStandardDeckNumberedImages('hermetic'), hasImages: true },
  { id: 'eightbit', name: '8-Bit', thumb: deckThumb('eightbit'), build: () => buildStandardDeckNumberedImages('eightbit'), hasImages: true },
  { id: 'crow', name: 'The Crow', thumb: deckThumb('crow'), build: () => buildStandardDeckNumberedImages('crow'), hasImages: true },
  { id: 'goldenthread', name: 'The Golden Thread', thumb: deckThumb('goldenthread'), build: () => buildStandardDeckNumberedImages('goldenthread'), hasImages: true },
  { id: 'darkexact', name: 'Dark Exact', thumb: deckThumb('darkexact'), build: () => buildStandardDeckNumberedImages('darkexact'), hasImages: true },
  { id: 'etherealvisions', name: 'Ethereal Visions', thumb: deckThumb('etherealvisions'), build: () => buildStandardDeckNumberedImages('etherealvisions'), hasImages: true },
  { id: 'fantasticalcreatures', name: 'Fantastical Creatures', thumb: deckThumb('fantasticalcreatures'), build: () => buildStandardDeckNumberedImages('fantasticalcreatures'), hasImages: true },
  { id: 'fengshui', name: 'Feng Shui', thumb: deckThumb('fengshui'), build: () => buildStandardDeckNumberedImages('fengshui'), hasImages: true },
  { id: 'loverspath', name: "Lovers' Path", thumb: deckThumb('loverspath'), build: () => buildStandardDeckNumberedImages('loverspath'), hasImages: true },
  { id: 'mysticalmoments', name: 'Mystical Moments', thumb: deckThumb('mysticalmoments'), build: () => buildStandardDeckNumberedImages('mysticalmoments'), hasImages: true },
  { id: 'tapestry', name: 'Tapestry', thumb: deckThumb('tapestry'), build: () => buildStandardDeckNumberedImages('tapestry'), hasImages: true },

  { id: 'primordial', name: 'Primordial', thumb: deckThumb('primordial'), build: () => buildPrimordialDeckNumberedImages('primordial'), hasImages: true }
];

const DECKS_MAP = {};
DECK_LIST.forEach(d => DECKS_MAP[d.id] = d);

// ------------------------------------------------------------
// SECURE RANDOM SHUFFLE (crypto)
// ------------------------------------------------------------
function secureRandom() {
  const arr = new Uint32Array(1);
  (window.crypto || window.msCrypto).getRandomValues(arr);
  return arr[0] / (0xFFFFFFFF + 1);
}

function shuffleDeck(deck) {
  const shuffled = deck.map(card => ({ ...card, reversed: secureRandom() < 0.5 }));
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(secureRandom() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// ------------------------------------------------------------
// SESSION STORAGE (Rabbit creationStorage)
// ------------------------------------------------------------
async function saveSession(data) {
  try {
    if (window.creationStorage) {
      await window.creationStorage.plain.setItem('tarot_session', btoa(JSON.stringify(data)));
    }
  } catch { /* silent */ }
}

async function loadSession() {
  try {
    if (window.creationStorage) {
      const s = await window.creationStorage.plain.getItem('tarot_session');
      if (s) return JSON.parse(atob(s));
    }
  } catch { /* silent */ }
  return null;
}

// ------------------------------------------------------------
// APP STATE
// ------------------------------------------------------------
let currentDeckIdx = 0;
let fullDeck = [];
let shuffledDeck = [];
let drawnCards = [];
let pullCount = 3;
let viewIndex = 0;
let screen = 'picker'; // picker | grid | loading | spread | card

const PULL_OPTIONS = Array.from({ length: 20 }, (_, i) => i + 1); // 1..20
const app = document.getElementById('app');

// ------------------------------------------------------------
// COPY HELPERS
// ------------------------------------------------------------
function formatSpreadForCopy() {
  return drawnCards
    .map((c, i) => `${i + 1}. ${c.name}${c.reversed ? ' (reversed)' : ''}`)
    .join('; ');
}

function formatSingleCardForCopy(idx) {
  const c = drawnCards[idx];
  if (!c) return '';
  return `${idx + 1}. ${c.name}${c.reversed ? ' (reversed)' : ''}`;
}

async function copyTextToClipboard(text) {
  // Preferred modern API
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch { /* fall through */ }

  // Fallback (older WebViews)
  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.left = '-9999px';
    ta.style.top = '0';
    document.body.appendChild(ta);
    ta.select();
    ta.setSelectionRange(0, ta.value.length);
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}

function showToast(msg) {
  const el = document.getElementById('toast');
  if (!el) return;

  el.textContent = msg;
  el.classList.add('show');

  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => el.classList.remove('show'), 1400);
}

// ------------------------------------------------------------
// FALLBACK SYMBOLS
// ------------------------------------------------------------
const PT_MAJOR_SYMBOLS = ['🥚','✨','🌍','🤱','👤','🔮','💞','☸️','🌾','🏔️','⏳','⚡','🗡️','💀','💧','👹','🪨','⭐','🌙','☀️','🦌','🌎'];
const STD_MAJOR_SYMBOLS = ['🃏','✨','🌙','👑','🏛️','📿','❤️','⚔️','🦁','🏔️','☸️','⚖️','🔄','💀','🏺','😈','🗼','⭐','🌙','☀️','📯','🌎'];

const SUIT_SYMBOLS = {
  Wands: '🪄', Cups: '🏆', Swords: '⚔️', Pentacles: '⭐',
  Nature: '🌿', Soul: '👁️', Blood: '🩸', Jewels: '💎'
};

function getCardSymbol(card, deckId) {
  if (card.type === 'major') {
    if (deckId === 'primordial') return PT_MAJOR_SYMBOLS[card.number] || '🔮';
    return STD_MAJOR_SYMBOLS[card.number] || '🔮';
  }
  return SUIT_SYMBOLS[card.suit] || '🃏';
}

// ------------------------------------------------------------
// INIT
// ------------------------------------------------------------
async function init() {
  const session = await loadSession();
  if (session && session.deckIdx !== undefined && DECK_LIST[session.deckIdx]) {
    currentDeckIdx = session.deckIdx;
    pullCount = session.pullCount || 3;
    if (session.drawnCards && session.drawnCards.length > 0) {
      drawnCards = session.drawnCards;
      viewIndex = session.viewIndex || 0;
      fullDeck = DECK_LIST[currentDeckIdx].build();
      renderCard(viewIndex);
      return;
    }
  }
  renderPicker();
}

// ------------------------------------------------------------
// TWO-STEP PICKER FLOW (Deck -> Count)
// ------------------------------------------------------------
let pickerStep = 0; // 0 = deck, 1 = count

function renderPicker() {
  screen = 'picker';
  pickerStep = 0;
  renderPickerDeck();
}

function renderPickerDeck() {
  screen = 'picker';
  pickerStep = 0;

  app.innerHTML = `
    <div class="picker-screen">
      <div class="logo-wrap">
        <img id="appLogo" class="picker-logo" src="${appLogoGif}" alt="Tarot" />
      </div>
    
      <h1 class="picker-heading">TAROT</h1>

      <div class="picker-single">
        <div class="picker-label">DECK</div>

        <div class="wheel-mask">
          <div class="wheel-highlight"></div>
          <div class="wheel-scroll" id="deckWheel">
            <div class="wheel-pad"></div>
            ${DECK_LIST.map((d, i) => `
              <div class="wheel-item" data-idx="${i}">
                <img class="wheel-thumb" src="${d.thumb}" alt="" onerror="this.style.display='none'"/>
                <span class="wheel-text">${d.name}</span>
              </div>
            `).join('')}
            <div class="wheel-pad"></div>
          </div>
        </div>
      </div>

      <div class="picker-footer">
        <button id="nextBtn" class="icon-btn gold" aria-label="Next">
          <span class="lottie" id="iconNextDeck"></span>
          <span class="btn-label">NEXT</span>
        </button>
      </div>
    </div>
  `;

  const deckWheel = document.getElementById('deckWheel');
  initWheel(deckWheel, currentDeckIdx, idx => { currentDeckIdx = idx; });

  document.getElementById('nextBtn').addEventListener('click', () => {
    renderPickerCount();
  });
  setupPickerLogo();
  mountPickerControlLotties();
}

function renderPickerCount() {
  screen = 'picker';
  pickerStep = 1;

  const defaultPullIdx = Math.max(0, PULL_OPTIONS.indexOf(pullCount));

  app.innerHTML = `
    <div class="picker-screen">
      <div class="logo-wrap">
        <img id="appLogo" class="picker-logo" src="${appLogoGif}" alt="Tarot" />
      </div>

      <h1 class="picker-heading">TAROT</h1>

      <div class="picker-single">
        <div class="picker-label">CARDS</div>

        <div class="wheel-mask wheel-mask-count">
          <div class="wheel-highlight"></div>
          <div class="wheel-scroll" id="countWheel">
            <div class="wheel-pad"></div>
            ${PULL_OPTIONS.map((n, i) => `
              <div class="wheel-item wheel-item-count" data-idx="${i}">
                <span class="wheel-num">${n}</span>
              </div>
            `).join('')}
            <div class="wheel-pad"></div>
          </div>
        </div>
      </div>

      <div class="picker-footer">
        <button id="backBtn" class="link-btn" aria-label="Back">
          <span class="lottie" id="iconBackCount"></span>
          <span class="btn-label">BACK</span>
        </button>
        <button id="startBtn" class="btn-start">
          <span class="lottie" id="iconStartDraw"></span>
          <span class="btn-label">START DRAW</span>
        </button>
      </div>
    </div>
  `;

  const countWheel = document.getElementById('countWheel');
  initWheel(countWheel, defaultPullIdx, idx => { pullCount = PULL_OPTIONS[idx]; });

  document.getElementById('backBtn').addEventListener('click', renderPickerDeck);
  document.getElementById('startBtn').addEventListener('click', () => {
    fullDeck = DECK_LIST[currentDeckIdx].build();
    doShuffle();
  });
  setupPickerLogo();
  mountPickerControlLotties();
}

// ============================================================
// WHEEL (dynamic row height, no hard-coded px)
// ============================================================
function getRowHeightPx(el) {
  const firstItem = el.querySelector('.wheel-item');
  if (!firstItem) return 48;
  const h = firstItem.getBoundingClientRect().height;
  return Math.max(32, Math.round(h));
}

function computeVisibleRows(el, itemH) {
  // Available height: use the parent box height if possible, else fall back
  const mask = el.closest('.wheel-mask') || el.parentElement;
  const maskH = (mask?.getBoundingClientRect().height) || (itemH * 3);

  // How many item rows can fit
  let rows = Math.floor(maskH / itemH);

  // Force odd number (3,5,7...) so highlight stays centered
  if (rows % 2 === 0) rows -= 1;
  rows = Math.max(3, Math.min(rows, 11)); // cap to prevent ridiculous tall wheels

  return rows;
}

function applyWheelRows(el, itemH) {
  const mask = el.closest('.wheel-mask') || el.parentElement;
  if (!mask) return;
  const maskH = (mask.getBoundingClientRect().height || (itemH * 3));
  const visibleRowsExact = Math.max(1, maskH / itemH);
  const padRows = Math.max(0, (visibleRowsExact - 1) / 2);

  // ✅ set per-wheel CSS vars (so each wheel can size itself)
  mask.style.setProperty('--visibleRows', String(visibleRowsExact));
  mask.style.setProperty('--padRows', padRows);
  mask.style.setProperty('--rowH', `${Math.round(itemH)}px`);
} 

function setActiveWheelController(ctrl) {
  activeWheelCtrl = ctrl;
}

function initWheel(el, defaultIdx, onChange) {
  const items = Array.from(el.querySelectorAll('.wheel-item'));
  const totalItems = items.length;

  let ITEM_H = getRowHeightPx(el);

  // ✅ set visible rows dynamically based on current space
  function refreshWheelSizing() {
    ITEM_H = getRowHeightPx(el);
    applyWheelRows(el, ITEM_H);

    // ensure scroll snaps to correct pixel increments after resize
    el.scrollTop = currentIdx * ITEM_H;
    updateStyles(currentIdx);
  }

  let currentIdx = Math.max(0, Math.min(defaultIdx, totalItems - 1));
  let scrollTimer = null;

  function updateStyles(activeIdx) {
    items.forEach((item, i) => {
      const dist = Math.abs(i - activeIdx);
      item.classList.toggle('active', dist === 0);
      item.style.opacity = dist === 0 ? '1' : dist === 1 ? '0.45' : '0.2';
      const scale = dist === 0 ? 1 : dist === 1 ? 0.9 : 0.78;
      item.style.transform = `scale(${scale})`;
    });
  }

  function scrollToIdx(idx, smooth = true) {
    const clamped = Math.max(0, Math.min(idx, totalItems - 1));
    currentIdx = clamped;
    el.scrollTo({ top: clamped * ITEM_H, behavior: smooth ? 'smooth' : 'auto' });
    updateStyles(clamped);
    onChange(clamped);
  }

  function snapToNearest() {
    const idx = Math.round(el.scrollTop / ITEM_H);
    scrollToIdx(idx, true);
  }

  // ✅ initial sizing + position
  refreshWheelSizing();
  onChange(currentIdx);

  // ✅ auto-update on resize/orientation
  const onResize = () => refreshWheelSizing();
  window.addEventListener('resize', onResize);

  // If you ever destroy/unmount this wheel, you can remove the listener.
  // (Not strictly necessary in your app since you rebuild screens, but OK.)
  setActiveWheelController({
    step(delta) { scrollToIdx(currentIdx + delta, true); },
    getIndex() { return currentIdx; },
    setIndex(i) { scrollToIdx(i, true); },
    destroy() {
      window.removeEventListener('resize', onResize);
      if (activeWheelCtrl && activeWheelCtrl.getIndex === this.getIndex) activeWheelCtrl = null;
    }
  });

  el.addEventListener('scroll', () => {
    clearTimeout(scrollTimer);
    const approxIdx = Math.round(el.scrollTop / ITEM_H);
    const clamped = Math.max(0, Math.min(approxIdx, totalItems - 1));
    currentIdx = clamped;
    updateStyles(clamped);
    scrollTimer = setTimeout(snapToNearest, 110);
  }, { passive: true });

  items.forEach((item, i) => item.addEventListener('click', () => scrollToIdx(i, true)));
}

// ------------------------------------------------------------
// SHUFFLE ANIMATION
// ------------------------------------------------------------
function doShuffle() {
  clearTimeout(loadingTimer);
  const deckInfo = DECK_LIST[currentDeckIdx];
  const backUrl = deckBack(deckInfo.id);

  shuffledDeck = shuffleDeck(fullDeck);
  drawnCards = [];
  viewIndex = 0;

  const style = backUrl
    ? `style="background-image:url('${backUrl}'); background-size:cover; background-position:center; background-repeat:no-repeat;"`
    : '';

  app.innerHTML = `
    <div class="shuffling">
      <div class="shuffle-cards">
        <div class="scard s1" ${style}></div>
        <div class="scard s2" ${style}></div>
        <div class="scard s3" ${style}></div>
        <div class="scard s4" ${style}></div>
        <div class="scard s5" ${style}></div>
      </div>
    </div>
  `;
  setTimeout(() => renderGrid(), 1400);
}

// ------------------------------------------------------------
// FACE-DOWN GRID
// ------------------------------------------------------------
function renderGrid() {
  screen = 'grid';
  const picked = drawnCards.length;
  const remaining = pullCount - picked;
  const deckInfo = DECK_LIST[currentDeckIdx];
  const backUrl = deckBack(deckInfo.id);

  app.innerHTML = `
    <div class="grid-screen">
      <div class="grid-header">
        <span class="grid-status">Pick ${remaining} card${remaining !== 1 ? 's' : ''}</span>
        <span class="grid-count">${picked}/${pullCount}</span>
      </div>

      <div class="grid-wrap">
        <div class="grid">
          ${shuffledDeck.map((_, i) => {
            const isDrawn = drawnCards.some(dc => dc._gridIdx === i);
            const style = backUrl ? `style="background-image:url('${backUrl}');"` : '';
            return `
              <div class="grid-card ${isDrawn ? 'picked' : ''}" data-idx="${i}" ${style}>
                ${isDrawn ? '' : ''}
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <p class="grid-hint">${picked < pullCount ? 'Tap cards to select' : ''}</p>
    </div>
  `;

  // already done (edge case when returning to grid)
  if (picked >= pullCount) {
    setTimeout(renderSpread, 120);
    return;
  }

  let locked = false;

  document.querySelectorAll('.grid-card:not(.picked)').forEach(el => {
    el.addEventListener('click', () => {
      if (locked) return;

      const idx = parseInt(el.dataset.idx, 10);

      // prevent double-pick on the same tile
      el.style.pointerEvents = 'none';

      // animate card as being taken away from the deck
      el.classList.add('taking-away');

      // commit selection immediately to state
      drawnCards.push({ ...shuffledDeck[idx], _gridIdx: idx });

      // update header immediately
      const nowPicked = drawnCards.length;
      const rem = pullCount - nowPicked;
      const statusEl = document.querySelector('.grid-status');
      const countEl = document.querySelector('.grid-count');
      if (statusEl) statusEl.textContent = `Pick ${rem} card${rem !== 1 ? 's' : ''}`;
      if (countEl) countEl.textContent = `${nowPicked}/${pullCount}`;

      persistSession();

      // after take-away animation, mark as picked & maybe proceed
      setTimeout(() => {
        el.classList.remove('taking-away');
        el.classList.add('picked');

        if (nowPicked >= pullCount) {
          locked = true;
          // auto-proceed after a short beat
          setTimeout(renderLoading, 220);
        }
      }, CARD_TAKE_AWAY_DURATION_MS);
    });
  });
}

function renderLoading() {
  screen = 'loading';
  clearTimeout(loadingTimer);

  const loadingGif = randomLoadingGif();
  app.innerHTML = `
    <div class="loading-screen">
      <div class="loading-wrap">
        <img class="loading-gif" src="${loadingGif}" alt="Loading animation" />
      </div>
      <p class="loading-label">Revealing your spread...</p>
    </div>
  `;

  loadingTimer = setTimeout(() => {
    if (screen === 'loading') renderSpread();
  }, LOADING_SCREEN_DURATION_MS);
}
// ------------------------------------------------------------
// SPREAD VIEW
// ------------------------------------------------------------
function chunkIntoRows(cards) {
  const n = cards.length;
  if (n <= 4) return [{ cols: n, cards }];
  // 5+ => rows of 4, last row can be 1/2/3 and should be centered
  const rows = [];
  let i = 0;
  while (i < n) {
    const remaining = n - i;
    const take = remaining >= 4 ? 4 : remaining; // last row: 1-3
    rows.push({ cols: take, cards: cards.slice(i, i + take) });
    i += take;
  }
  // force first row to be 4 columns when n>=5
  rows[0].cols = 4;
  return rows;
}

function syncSpreadCardAspectRatios() {
  document.querySelectorAll('.spread-card').forEach((cardEl) => {
    const img = cardEl.querySelector('.spread-img');
    if (!img) return;

    const applyAspect = () => {
      const w = img.naturalWidth || 0;
      const h = img.naturalHeight || 0;
      if (!w || !h) return;
      cardEl.style.aspectRatio = `${w} / ${h}`;
    };

    if (img.complete && img.naturalWidth > 0) applyAspect();
    else img.addEventListener('load', applyAspect, { once: true });
  });
}

function renderSpread() {
  clearTimeout(loadingTimer);
  screen = 'spread';
  const deckInfo = DECK_LIST[currentDeckIdx];
  const n = drawnCards.length;
  const rows = chunkIntoRows(drawnCards);

  const areaClass = n <= 4 ? 'spread-area single' : 'spread-area scrolling';

  app.innerHTML = `
    <div class="spread-screen">
      <div class="spread-header">
        <span class="spread-title">${deckInfo.name} · ${n}-Card Spread</span>
      </div>

      <div class="${areaClass}">
        ${rows.map((row) => `
          <div class="spread-row cols-${row.cols}">
            ${row.cards.map((card) => {
              const cardIdx = drawnCards.indexOf(card);
              const hasImg = !!(deckInfo.hasImages && card.image);
              return `
                <div class="spread-card ${card.reversed ? 'reversed' : ''}" data-idx="${cardIdx}">
                  ${hasImg
                    ? `<img class="spread-img" src="${card.image}" alt="${card.name}"
                         onerror="this.outerHTML='<div class=\\'spread-symbol\\'>${getCardSymbol(card, deckInfo.id)}</div>'" />`
                    : `<div class="spread-symbol">${getCardSymbol(card, deckInfo.id)}</div>`
                  }
                  <div class="spread-label">${card.reversed ? '↓' : ''}</div>
                </div>
              `;
            }).join('')}
          </div>
        `).join('')}
      </div>

      <div class="spread-actions">
        <button id="copySpreadBtn" class="nav-btn up" title="Copy spread" aria-label="Copy spread">
          <span class="lottie nav-lottie" id="iconCopySpread"></span>
        </button>
        <button id="spreadDetailBtn" class="nav-btn up" title="View details" aria-label="View details">
          <span class="lottie nav-lottie" id="iconSpreadDetail"></span>
        </button>
        <button id="spreadHomeBtn" class="nav-btn up" title="Retry" aria-label="Retry">
          <span class="lottie nav-lottie" id="iconSpreadHome"></span>
        </button>
      </div>
      <div id="toast" class="toast" aria-live="polite"></div>
  `;

  document.querySelectorAll('.spread-card').forEach(el => {
    el.addEventListener('click', () => renderCard(parseInt(el.dataset.idx, 10)));
  });

  document.getElementById('copySpreadBtn').addEventListener('click', async () => {
  const ok = await copyTextToClipboard(formatSpreadForCopy());
  showToast(ok ? 'Copied ✅' : 'Copy failed');
  });
  document.getElementById('spreadDetailBtn').addEventListener('click', () => renderCard(0));
  document.getElementById('spreadHomeBtn').addEventListener('click', renderPicker);

  mountLottieInteractive(document.getElementById('iconCopySpread'), ICONS.result_screen.copy_spread, { sizePx: 34, colorHex: '#ffd36a' }).catch(() => {});
  mountLottieInteractive(document.getElementById('iconSpreadDetail'), ICONS.result_screen.view_details, { sizePx: 34, colorHex: '#ffd36a' }).catch(() => {});
  mountLottieInteractive(document.getElementById('iconSpreadHome'), ICONS.result_screen.home, { sizePx: 34, colorHex: '#ffd36a' }).catch(() => {});
  syncSpreadCardAspectRatios();
  persistSession();
}

// ------------------------------------------------------------
// CARD DETAIL VIEW
// ------------------------------------------------------------
function renderReveal(lastPickedCard) {
  screen = 'reveal';

  const deckInfo = DECK_LIST[currentDeckIdx];
  const backUrl = deckBack(deckInfo.id);

  // show up to 3 most recently picked cards (or fewer if pullCount < 3)
  const slice = drawnCards.slice(Math.max(0, drawnCards.length - 3));
  const pad = 3 - slice.length;
  const revealCards = [...Array(pad)].map(() => null).concat(slice);

  app.innerHTML = `
    <div class="reveal-screen">
      <div class="reveal-wrap">
        ${revealCards.map((card, i) => {
          if (!card) {
            return `<div class="reveal-card ghost"></div>`;
          }

          const hasImg = !!(deckInfo.hasImages && card.image);
          const revClass = card.reversed ? 'reversed' : '';
          const delay = i * 120;

          return `
            <div class="reveal-card ${revClass}" style="animation-delay:${delay}ms">
              ${hasImg
                ? `<img class="reveal-img ${revClass}" src="${card.image}" alt="${card.name}" />`
                : `<div class="reveal-symbol ${revClass}">${getCardSymbol(card, deckInfo.id)}</div>`
              }
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;

  // proceed automatically to spread after the reveal animation
  setTimeout(() => renderSpread(), 1050);
}

function renderCard(index) {
  if (index < 0 || index >= drawnCards.length) return;

  viewIndex = index;
  screen = 'card';

  const card = drawnCards[index];
  const deckInfo = DECK_LIST[currentDeckIdx];
  const reversedLabel = card.reversed ? 'Reversed' : 'Upright';
  const typeLabel = card.type === 'major' ? `Major · ${card.number}` : `Minor · ${card.suit || ''}`;
  const hasImg = !!(deckInfo.hasImages && card.image);

  app.innerHTML = `
    <div class="card-view">
      <div class="card-header">
        <span class="card-count">${index + 1} / ${drawnCards.length}</span>
        <span class="card-type">${typeLabel}</span>
      </div>

      <div class="card-frame tap-back ${card.reversed ? 'rev' : 'up'}" id="cardFrame" role="button" tabindex="0" aria-label="Back to spread">
        ${hasImg
          ? `<div class="card-img-wrap ${card.reversed ? 'reversed' : ''}">
               <img class="card-img" id="cardImg" src="${card.image}" alt="${card.name}"
                 onerror="this.parentElement.innerHTML='<div class=\\'card-fallback\\'>${getCardSymbol(card, deckInfo.id)}<br>${card.name}</div>'" />
             </div>`
          : `<div class="card-symbol-wrap ${card.reversed ? 'reversed' : ''}">
               <div class="card-big-symbol">${getCardSymbol(card, deckInfo.id)}</div>
             </div>`
        }
      </div>

      <div class="card-info">
        <span class="card-name">${card.name}</span>
        <span class="card-orientation ${card.reversed ? 'rev' : 'up'}">${reversedLabel}</span>

      </div>

      <div class="card-nav ${card.reversed ? 'rev' : 'up'}">
        <button id="prevBtn" class="nav-btn ${card.reversed ? 'rev' : 'up'}" ${index === 0 ? 'disabled' : ''} aria-label="Previous card">
          <span class="lottie nav-lottie" id="iconCardPrev"></span>
        </button>
        <button id="spreadBtn" class="nav-btn home-btn ${card.reversed ? 'rev' : 'up'}" aria-label="Back to spread">
          <span class="lottie nav-lottie" id="iconCardSpread"></span>
        </button>
        <button id="copyCardBtn" class="nav-btn copy-btn ${card.reversed ? 'rev' : 'up'}" title="Copy card" aria-label="Copy card">
          <span class="lottie nav-lottie" id="iconCardCopy"></span>
        </button>
        <button id="reshuffleBtn" class="nav-btn reshuffle ${card.reversed ? 'rev' : 'up'}" aria-label="Reshuffle">
          <span class="lottie nav-lottie" id="iconCardReshuffle"></span>
        </button>
        <button id="nextBtn" class="nav-btn ${card.reversed ? 'rev' : 'up'}" ${index === drawnCards.length - 1 ? 'disabled' : ''} aria-label="Next card">
          <span class="lottie nav-lottie" id="iconCardNext"></span>
        </button>
      </div>
      <div id="toast" class="toast" aria-live="polite"></div>
    </div>
  `;

  // Dynamic aspect ratio (per-deck image shape)
  if (hasImg) {
    const img = document.getElementById('cardImg');
    const frame = document.getElementById('cardFrame');
    if (img && frame) {
      const applyAspect = () => {
        const w = img.naturalWidth || 2;
        const h = img.naturalHeight || 3;
        frame.style.aspectRatio = `${w} / ${h}`; // ✅ auto-fit deck ratio
      };

      if (img.complete && img.naturalWidth > 0) applyAspect();
      else img.addEventListener('load', applyAspect, { once: true });
    }
  }

  document.getElementById('prevBtn').addEventListener('click', () => renderCard(index - 1));
  document.getElementById('nextBtn').addEventListener('click', () => renderCard(index + 1));
  document.getElementById('reshuffleBtn').addEventListener('click', doShuffle);
  document.getElementById('spreadBtn').addEventListener('click', renderSpread);
  const cardFrameEl = document.getElementById('cardFrame');
  if (cardFrameEl) {
    cardFrameEl.addEventListener('click', renderSpread);
    cardFrameEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        renderSpread();
      }
    });
  }

  // Copy spread button
const copyBtn = document.getElementById('copyCardBtn');
if (copyBtn) {
  copyBtn.addEventListener('click', async () => {
    const text = formatSingleCardForCopy(viewIndex);
    const ok = await copyTextToClipboard(text);
    showToast(ok ? 'Copied ✅' : 'Copy failed');
    copyBtn.classList.remove('copy-feedback');
    // restart pulse feedback animation on each click
    void copyBtn.offsetWidth;
    copyBtn.classList.add('copy-feedback');
    setTimeout(() => copyBtn.classList.remove('copy-feedback'), 420);
  });
}

  const controlColor = card.reversed ? '#9b5cff' : '#ffd36a';
  mountLottieInteractive(document.getElementById('iconCardPrev'), ICONS.detail_screen.previous, { sizePx: 30, colorHex: controlColor }).catch(() => {});
  mountLottieInteractive(document.getElementById('iconCardSpread'), ICONS.detail_screen.back_to_spread, { sizePx: 30, colorHex: controlColor }).catch(() => {});
  mountLottieInteractive(document.getElementById('iconCardCopy'), ICONS.detail_screen.copy_single_card, { sizePx: 30, colorHex: controlColor }).catch(() => {});
  mountLottieInteractive(document.getElementById('iconCardReshuffle'), ICONS.detail_screen.reshuffle, { sizePx: 30, colorHex: controlColor }).catch(() => {});
  mountLottieInteractive(document.getElementById('iconCardNext'), ICONS.detail_screen.next, { sizePx: 30, colorHex: controlColor }).catch(() => {});

  persistSession();
}

// ------------------------------------------------------------
// PERSIST SESSION
// ------------------------------------------------------------
function persistSession() {
  saveSession({
    deckIdx: currentDeckIdx,
    pullCount,
    drawnCards: drawnCards.map(c => ({
      name: c.name, type: c.type, number: c.number, suit: c.suit,
      image: c.image, reversed: c.reversed, _gridIdx: c._gridIdx
    })),
    viewIndex,
    timestamp: Date.now()
  });
}

// ------------------------------------------------------------
// HARDWARE INPUT (Rabbit R1) - SINGLE SOURCE OF TRUTH
// ------------------------------------------------------------

// (Optional) helper to click a visible button safely
function clickIfExists(id) {
  const el = document.getElementById(id);
  if (el && typeof el.click === 'function') el.click();
  return !!el;
}

window.addEventListener('sideClick', () => {
  if (screen === 'picker') {
    if (clickIfExists('nextBtn')) return;
    if (clickIfExists('startBtn')) return;
    return;
  }
  if (screen === 'spread') {
    renderCard(0);
    return;
  }
  if (screen === 'card') {
    doShuffle();
    return;
  }
  if (screen === 'grid') return;
});

window.addEventListener('scrollDown', () => {
  if (screen === 'picker') {
    stepActiveWheel(+1);
    return;
  }
  if (screen === 'card' && viewIndex < drawnCards.length - 1) {
    renderCard(viewIndex + 1);
    return;
  }
});

window.addEventListener('scrollUp', () => {
  if (screen === 'picker') {
    stepActiveWheel(-1);
    return;
  }
  if (screen === 'card' && viewIndex > 0) {
    renderCard(viewIndex - 1);
    return;
  }
});

if (typeof PluginMessageHandler === 'undefined') {
  window.addEventListener('keydown', (e) => {
    if (e.code === 'Space') { e.preventDefault(); window.dispatchEvent(new CustomEvent('sideClick')); }
    else if (e.code === 'ArrowDown' || e.code === 'ArrowRight') { e.preventDefault(); window.dispatchEvent(new CustomEvent('scrollDown')); }
    else if (e.code === 'ArrowUp' || e.code === 'ArrowLeft') { e.preventDefault(); window.dispatchEvent(new CustomEvent('scrollUp')); }
  });
}

// ------------------------------------------------------------
// BOOT
// ------------------------------------------------------------
document.addEventListener('DOMContentLoaded', init);
