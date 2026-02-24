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
const LOADING_GIFS = import.meta.glob('./assets/animation/loading/*.{gif,GIF}', { eager: true, query: '?url', import: 'default' });
const LOADING_GIF_URLS = Object.values(LOADING_GIFS).filter(
  (url) => typeof url === 'string' && url.length > 0
);
const CARD_TAKE_AWAY_DURATION_MS = 460;
const LOADING_SCREEN_DURATION_MS = 2400;
const LOADING_SPREAD_TIMEOUT_MIN_MS = 5200;
const LOADING_SPREAD_TIMEOUT_MAX_MS = 26000;
const LOADING_SPREAD_BASE_TIMEOUT_MS = 5200;
const LOADING_SPREAD_PER_CARD_TIMEOUT_MS = 420;
const LOADING_SPREAD_PRIMORDIAL_BOOST_MS = 4200;
const LOADING_SPREAD_HISTORY_MULTIPLIER = 1.2;
const SPREAD_LOAD_HISTORY_ALPHA = 0.35;
const LOADING_SCREEN_SETTLE_MS = 120;
const LOADING_SCREEN_FALLBACK_BUFFER_MS = 700;
const SHUFFLE_SCREEN_DURATION_MS = 2800;
const MAX_GRID_PICK_CARDS = 20;
const SHUFFLE_BACK_PRELOAD_TIMEOUT_MS = 2200;
const SHUFFLE_BACK_GUARD_BASE_MS = 80;
const SHUFFLE_BACK_GUARD_MIN_MS = 120;
const SHUFFLE_BACK_GUARD_MAX_MS = 900;
const SHUFFLE_BACK_GUARD_FACTOR = 0.35;
const BUTTON_JSON_CLICK_DELAY_MS = 520;
const PICKER_WHEEL_ICON_REST_DELAY_MS = 180;
const SPREAD_CENTER_FIT_TOLERANCE_PX = 20;

// Screen control Lotties
const ICONS = {
  start_screen: {
    next_arrow_deck_picker: new URL('./assets/animation/screen_control/start_screen/next_arrow_deck_picker/31-arrow-right-outline.json', import.meta.url).toString(),
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

async function mountLottieInteractive(
  container,
  jsonUrl,
  { sizePx = 24, colorHex = '#ffd36a', restAtEnd = false, playReversed = false } = {}
) {
  const anim = await mountLottieLoop(container, jsonUrl, {
    sizePx,
    colorHex,
    loop: false,
    autoplay: false
  });

  const lastFrame = () => Math.max(0, Math.floor((anim.totalFrames || 1) - 1));
  const setRestFrame = () => anim.goToAndStop(restAtEnd ? lastFrame() : 0, true);

  setRestFrame();

  anim.addEventListener('complete', () => {
    anim.stop();
    setRestFrame();
  });

  const host = container.closest('button') || container;
  let lastTriggerTs = 0;
  const trigger = ({ restart = true } = {}) => {
    if (host instanceof HTMLButtonElement && host.disabled) return;
    if (!restart && !anim.isPaused) return;
    const now = performance.now();
    if (now - lastTriggerTs < 100) return;
    lastTriggerTs = now;
    anim.stop();
    if (playReversed) {
      anim.setDirection(-1);
      anim.goToAndStop(lastFrame(), true);
    } else {
      anim.setDirection(1);
      anim.goToAndStop(0, true);
    }
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

  anim.__triggerOnce = trigger;
  anim.__setRestFrame = setRestFrame;
  anim.__hostEl = host;
  anim.__containerEl = container;

  return anim;
}

const loadingGifWarmStatus = new Map();
const spreadLoadHistoryMsByDeck = new Map();

function shuffledCopy(list) {
  const arr = [...list];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function preloadImageUrlWithStats(url, timeoutMs = 1500) {
  return new Promise((resolve) => {
    const startedAt = performance.now();

    if (!url) {
      resolve({ ok: false, durationMs: 0, timedOut: false });
      return;
    }

    const img = new Image();
    let settled = false;
    const done = (ok, timedOut = false) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeoutId);
      img.onload = null;
      img.onerror = null;
      resolve({
        ok,
        timedOut,
        durationMs: Math.round(performance.now() - startedAt),
      });
    };

    img.onload = () => done(true, false);
    img.onerror = () => done(false, false);

    const timeoutId = setTimeout(() => done(false, true), timeoutMs);
    img.decoding = 'async';
    img.src = url;
  });
}

async function preloadImageUrl(url, timeoutMs = 1500) {
  const result = await preloadImageUrlWithStats(url, timeoutMs);
  return result.ok;
}

function computeShuffleBackGuardMs(loadStats) {
  if (!loadStats?.ok) return SHUFFLE_BACK_GUARD_MIN_MS;
  const dynamic = SHUFFLE_BACK_GUARD_BASE_MS + (loadStats.durationMs * SHUFFLE_BACK_GUARD_FACTOR);
  return Math.round(clamp(dynamic, SHUFFLE_BACK_GUARD_MIN_MS, SHUFFLE_BACK_GUARD_MAX_MS));
}

function getCurrentDeckId() {
  return DECK_LIST[currentDeckIdx]?.id || 'unknown';
}

function getCurrentSpreadImageUrls() {
  const deckInfo = DECK_LIST[currentDeckIdx];
  if (!deckInfo?.hasImages) return [];

  const seen = new Set();
  const urls = [];
  for (const card of drawnCards) {
    const url = card?.image;
    if (!url || seen.has(url)) continue;
    seen.add(url);
    urls.push(url);
  }
  return urls;
}

function getDynamicSpreadPreloadTimeoutMs(urlCount = getCurrentSpreadImageUrls().length) {
  const deckId = getCurrentDeckId();
  const byCount = LOADING_SPREAD_BASE_TIMEOUT_MS + (urlCount * LOADING_SPREAD_PER_CARD_TIMEOUT_MS);
  const deckBoost = deckId === 'primordial' ? LOADING_SPREAD_PRIMORDIAL_BOOST_MS : 0;

  const historyMs = spreadLoadHistoryMsByDeck.get(deckId) || 0;
  const byHistory = historyMs > 0
    ? Math.round(historyMs * LOADING_SPREAD_HISTORY_MULTIPLIER)
    : 0;

  const dynamicMs = Math.max(byCount + deckBoost, byHistory);
  return Math.round(clamp(dynamicMs, LOADING_SPREAD_TIMEOUT_MIN_MS, LOADING_SPREAD_TIMEOUT_MAX_MS));
}

function updateSpreadLoadHistory(deckId, sampleMs) {
  if (!deckId || !Number.isFinite(sampleMs) || sampleMs <= 0) return;

  const prev = spreadLoadHistoryMsByDeck.get(deckId);
  if (typeof prev !== 'number') {
    spreadLoadHistoryMsByDeck.set(deckId, Math.round(sampleMs));
    return;
  }

  const next = Math.round((prev * (1 - SPREAD_LOAD_HISTORY_ALPHA)) + (sampleMs * SPREAD_LOAD_HISTORY_ALPHA));
  spreadLoadHistoryMsByDeck.set(deckId, next);
}

async function preloadCurrentSpreadImages(timeoutMs, urlsInput = null) {
  const urls = Array.isArray(urlsInput) ? urlsInput : getCurrentSpreadImageUrls();
  if (!urls.length) return { total: 0, loaded: 0, failed: 0, maxDurationMs: 0 };

  const safeTimeoutMs = Math.round(clamp(
    timeoutMs ?? getDynamicSpreadPreloadTimeoutMs(urls.length),
    LOADING_SPREAD_TIMEOUT_MIN_MS,
    LOADING_SPREAD_TIMEOUT_MAX_MS
  ));

  const results = await Promise.all(
    urls.map((url) => preloadImageUrlWithStats(url, safeTimeoutMs))
  );

  let loaded = 0;
  let failed = 0;
  let maxDurationMs = 0;
  for (const r of results) {
    if (r.ok) loaded += 1;
    else failed += 1;
    maxDurationMs = Math.max(maxDurationMs, r.durationMs || 0);
  }

  const deckId = getCurrentDeckId();
  const sampleMs = Math.max(maxDurationMs, loaded > 0 ? 0 : safeTimeoutMs);
  updateSpreadLoadHistory(deckId, sampleMs || safeTimeoutMs);

  return { total: urls.length, loaded, failed, maxDurationMs };
}

function prewarmLoadingGifs(limit = 8) {
  const candidates = shuffledCopy(LOADING_GIF_URLS);
  let queued = 0;

  for (const url of candidates) {
    if (queued >= limit) break;

    const status = loadingGifWarmStatus.get(url);
    if (status === 'loaded' || status === 'pending') continue;

    queued += 1;
    loadingGifWarmStatus.set(url, 'pending');

    void preloadImageUrl(url, 5000).then((ok) => {
      loadingGifWarmStatus.set(url, ok ? 'loaded' : 'failed');
    });
  }
}

function pickLoadingGifCandidates(limit = 6) {
  const loaded = [];
  const fresh = [];
  const failed = [];

  for (const url of LOADING_GIF_URLS) {
    const status = loadingGifWarmStatus.get(url);
    if (status === 'loaded') loaded.push(url);
    else if (status === 'failed') failed.push(url);
    else fresh.push(url);
  }

  const prioritized = [
    ...shuffledCopy(loaded),
    ...shuffledCopy(fresh),
    ...shuffledCopy(failed),
  ];

  return prioritized.slice(0, Math.max(1, Math.min(limit, prioritized.length)));
}

function loadGifWithGuard(imgEl, url, timeoutMs = 1500) {
  return new Promise((resolve) => {
    if (!imgEl || !url) {
      resolve(false);
      return;
    }

    let settled = false;
    const done = (ok) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeoutId);
      imgEl.onload = null;
      imgEl.onerror = null;
      resolve(ok);
    };

    imgEl.onload = () => done(true);
    imgEl.onerror = () => done(false);

    const timeoutId = setTimeout(() => done(false), timeoutMs);
    imgEl.src = url;
  });
}

let logoStillFrameDataUrl = null;
let logoFreezeTimer = null;
let logoDecodePromise = null;
let logoStillReady = false;
let logoStillPrimePromise = null;
let logoPlaybackStartedAt = 0;
let loadingTimer = null;
let loadingRunId = 0;
let spreadCenteringRaf = 0;
let spreadResizeBound = false;

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

  if (logoEl.classList.contains('frozen') && logoEl.src === logoStillFrameDataUrl) {
    return true;
  }

  const commitSwap = () => {
    const currentLogoEl = document.getElementById('appLogo');
    if (!currentLogoEl) return;
    currentLogoEl.src = logoStillFrameDataUrl;
    currentLogoEl.classList.add('frozen');
  };

  // Double-rAF helps avoid paint tearing on iOS during GIF->PNG source swap.
  requestAnimationFrame(() => requestAnimationFrame(commitSwap));
  return true;
}

function primeLogoStillFrame(dataUrl) {
  if (!dataUrl) return Promise.resolve(false);
  if (logoStillReady && logoStillFrameDataUrl === dataUrl) return Promise.resolve(true);
  if (logoStillPrimePromise) return logoStillPrimePromise;

  logoStillPrimePromise = new Promise((resolve) => {
    const probe = new Image();
    let settled = false;
    const done = (ok) => {
      if (settled) return;
      settled = true;
      logoStillReady = ok;
      resolve(ok);
    };

    probe.onload = () => done(true);
    probe.onerror = () => done(false);
    probe.decoding = 'async';
    probe.src = dataUrl;

    if (typeof probe.decode === 'function') {
      probe.decode().then(() => done(true)).catch(() => {});
    }
  }).finally(() => {
    logoStillPrimePromise = null;
  });

  return logoStillPrimePromise;
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
  const cycleMs = Math.max(900, Math.round(durationMs));
  const startedAt = logoPlaybackStartedAt || performance.now();
  const elapsedMs = Math.max(0, performance.now() - startedAt);
  const cyclePosMs = elapsedMs % cycleMs;
  const remainingMs = cycleMs - cyclePosMs;
  const freezeLeadMs = 16;
  const freezeAt = Math.max(48, Math.round(remainingMs - freezeLeadMs));

  logoFreezeTimer = setTimeout(() => {
    logoFreezeTimer = null;
    if (!logoStillReady && logoStillFrameDataUrl) {
      void primeLogoStillFrame(logoStillFrameDataUrl).finally(() => {
        applyLogoStillFrame();
      });
      return;
    }
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
  logoPlaybackStartedAt = performance.now();

  decodeLogoStillAndDuration()
    .then(({ durationMs, stillDataUrl }) => {
      if (stillDataUrl) {
        logoStillFrameDataUrl = stillDataUrl;
        void primeLogoStillFrame(stillDataUrl);
      }
      scheduleLogoFreeze(durationMs);
    })
    .catch(() => {
      scheduleLogoFreeze(2200);
    });
}

function mountPickerControlLotties() {
  clearPickerStartLottieIdle();
  pickerStartLottieAnim = null;
  const start = document.getElementById('iconStartDraw');
  if (start) {
    mountLottieInteractive(start, startLottieUrl, { sizePx: 28, colorHex: '#1d1300' })
      .then((anim) => { pickerStartLottieAnim = anim; })
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
let pickerStartLottieAnim = null;
let pickerStartLottieIdleTimer = null;



function stepActiveWheel(delta) {
  if (!activeWheelCtrl) return;
  activeWheelCtrl.step(delta);
}

function clearPickerStartLottieIdle() {
  clearTimeout(pickerStartLottieIdleTimer);
  pickerStartLottieIdleTimer = null;
}

function triggerPickerStartLottieFromWheel() {
  if (screen !== 'picker') return;
  const anim = pickerStartLottieAnim;
  if (!anim || typeof anim.__triggerOnce !== 'function') return;

  const host = anim.__hostEl || anim.__containerEl;
  if (host && !host.isConnected) {
    pickerStartLottieAnim = null;
    clearPickerStartLottieIdle();
    return;
  }

  anim.__triggerOnce({ restart: false });

  clearPickerStartLottieIdle();
  pickerStartLottieIdleTimer = setTimeout(() => {
    if (pickerStartLottieAnim !== anim) return;
    if (typeof anim.__setRestFrame === 'function') anim.__setRestFrame();
  }, PICKER_WHEEL_ICON_REST_DELAY_MS);
}

const LOCAL_ASSETS = import.meta.glob(
  './assets/decks/**/{thumb.{jpg,jpeg,png,webp,JPG,JPEG,PNG,WEBP},back,back.{jpg,jpeg,png,webp,JPG,JPEG,PNG,WEBP},image/*.{jpg,jpeg,png,webp,JPG,JPEG,PNG,WEBP},images/*.{jpg,jpeg,png,webp,JPG,JPEG,PNG,WEBP}}',
  { eager: true, query: '?url', import: 'default' }
);

function localAsset(path) {
  const v = LOCAL_ASSETS[path];
  return (typeof v === 'string' && v.length > 0) ? v : null;
}

function deckThumb(deckId) {
  return (
    localAsset(`./assets/decks/${deckId}/thumb.jpg`) ||
    localAsset(`./assets/decks/${deckId}/thumb.jpeg`) ||
    localAsset(`./assets/decks/${deckId}/thumb.png`) ||
    localAsset(`./assets/decks/${deckId}/thumb.webp`)
  );
}

function deckBack(deckId) {
  return (
    localAsset(`./assets/decks/${deckId}/back`) ||
    localAsset(`./assets/decks/${deckId}/back.jpg`) ||
    localAsset(`./assets/decks/${deckId}/back.jpeg`) ||
    localAsset(`./assets/decks/${deckId}/back.png`) ||
    localAsset(`./assets/decks/${deckId}/back.webp`) ||
    deckThumb(deckId)
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

  const exts = ['.jpg', '.jpeg', '.png', '.webp', '.JPG', '.JPEG', '.PNG', '.WEBP'];

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
// SECURE RANDOM SHUFFLE (crypto, unbiased)
// ------------------------------------------------------------
function secureRandomInt(maxExclusive) {
  if (!Number.isInteger(maxExclusive) || maxExclusive <= 0) return 0;

  const cryptoObj = window.crypto || window.msCrypto;
  if (!cryptoObj?.getRandomValues) {
    return Math.floor(Math.random() * maxExclusive);
  }

  const UINT32_RANGE = 0x100000000; // 2^32
  const limit = UINT32_RANGE - (UINT32_RANGE % maxExclusive);
  const arr = new Uint32Array(1);

  let x = 0;
  do {
    cryptoObj.getRandomValues(arr);
    x = arr[0];
  } while (x >= limit);

  return x % maxExclusive;
}

function randomBool50() {
  return secureRandomInt(2) === 1;
}

function shuffleDeck(deck) {
  const shuffled = deck.map(card => ({ ...card, reversed: randomBool50() }));
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = secureRandomInt(i + 1);
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
let viewIndex = 0;
let screen = 'picker'; // picker | shuffling | grid | loading | spread | card
let shuffleRunId = 0;

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

function triggerTapFeedback(el) {
  if (!el) return;
  el.classList.remove('tap-feedback');
  void el.offsetWidth;
  el.classList.add('tap-feedback');
}

function bindButtonAction(buttonEl, action, delayMs = 120) {
  if (!buttonEl) return;
  let busy = false;
  const hasJsonIcon = !!buttonEl.querySelector('.lottie');
  const effectiveDelayMs = hasJsonIcon
    ? Math.max(delayMs, BUTTON_JSON_CLICK_DELAY_MS)
    : delayMs;

  buttonEl.addEventListener('click', () => {
    if (buttonEl.disabled || busy) return;
    busy = true;
    triggerTapFeedback(buttonEl);

    const run = async () => {
      try {
        await action();
      } finally {
        if (document.contains(buttonEl)) busy = false;
      }
    };

    if (effectiveDelayMs > 0) {
      setTimeout(() => { void run(); }, effectiveDelayMs);
    } else {
      void run();
    }
  });
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

const MINOR_RANK_ROMAN = {
  Ace: 'I',
  Two: 'II',
  Three: 'III',
  Four: 'IV',
  Five: 'V',
  Six: 'VI',
  Seven: 'VII',
  Eight: 'VIII',
  Nine: 'IX',
  Ten: 'X'
};

const MINOR_COURT_EMOJI = {
  Page: '🧒',
  Knight: '🐎',
  Queen: '👑',
  King: '🤴',
  Child: '👶',
  Animal: '🐾',
  Woman: '👩',
  Man: '👨'
};

function toRomanNumeral(value) {
  const num = Math.floor(Number(value));
  if (!Number.isFinite(num) || num <= 0) return '';

  const numerals = [
    [1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'],
    [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'],
    [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I'],
  ];

  let remaining = num;
  let out = '';
  for (const [v, glyph] of numerals) {
    while (remaining >= v) {
      out += glyph;
      remaining -= v;
    }
  }
  return out;
}

function getSpreadMinorRankShort(cardName) {
  const rankRaw = String(cardName || '').split(' of ')[0].trim();
  if (!rankRaw) return '•';
  if (/^\d+$/.test(rankRaw)) {
    const numRank = parseInt(rankRaw, 10);
    return toRomanNumeral(numRank) || rankRaw;
  }
  return MINOR_RANK_ROMAN[rankRaw] || MINOR_COURT_EMOJI[rankRaw] || rankRaw.slice(0, 2).toUpperCase();
}

function getSpreadMiniBadge(card, deckId) {
  const symbol = getCardSymbol(card, deckId);

  if (card.type === 'major') {
    return String(card.name || 'Major Arcana');
  }

  if (card.type === 'minor') {
    const rank = getSpreadMinorRankShort(card.name);
    return `${rank} | ${symbol}`;
  }

  return String(card.name || `${toRomanNumeral(card.number || 0)} | ${symbol}`);
}

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
// PICKER FLOW (Deck -> Start Draw)
// ------------------------------------------------------------
function renderPicker() {
  screen = 'picker';
  renderPickerDeck();
}

function renderPickerDeck() {
  screen = 'picker';

  app.innerHTML = `
    <div class="picker-screen">
      <div class="logo-wrap">
        <img id="appLogo" class="picker-logo" src="${appLogoGif}" alt="Tarot" />
        <span class="logo-crystal-overlay" aria-hidden="true"></span>
      </div>
    
      <h1 class="picker-heading">TAROT</h1>

      <div class="picker-single">
        <div class="picker-label picker-label-deck">CHOOSE YOUR DECK</div>

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
        <button id="startBtn" class="btn-start" aria-label="Shuffle deck">
          <span class="lottie" id="iconStartDraw"></span>
          <span class="btn-label">SHUFFLE DECK</span>
        </button>
      </div>
    </div>
  `;

  const deckWheel = document.getElementById('deckWheel');
  initWheel(deckWheel, currentDeckIdx, idx => { currentDeckIdx = idx; });

  bindButtonAction(document.getElementById('startBtn'), () => {
    fullDeck = DECK_LIST[currentDeckIdx].build();
    doShuffle();
  }, 130);
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
  const mask = el.closest('.wheel-mask') || el.parentElement;

  let ITEM_H = getRowHeightPx(el);

  // ✅ set visible rows dynamically based on current space
  function refreshWheelSizing() {
    ITEM_H = getRowHeightPx(el);
    applyWheelRows(el, ITEM_H);

    // ensure scroll snaps to correct pixel increments after resize
    el.scrollTop = currentIdx * ITEM_H;
    updateStyles(currentIdx);
    setLockedItem(currentIdx);
  }

  let currentIdx = Math.max(0, Math.min(defaultIdx, totalItems - 1));
  let scrollTimer = null;
  let lockTimer = null;

  function setLockedItem(lockedIdx = -1) {
    items.forEach((item, i) => {
      item.classList.toggle('locked', i === lockedIdx);
    });
  }

  function getCenterAlignedIndex(fallbackIdx = currentIdx) {
    if (!items.length) return 0;
    const maskRect = (mask?.getBoundingClientRect?.() || el.getBoundingClientRect());
    const centerY = maskRect.top + (maskRect.height / 2);

    let bestIdx = Math.max(0, Math.min(fallbackIdx, totalItems - 1));
    let bestDist = Number.POSITIVE_INFINITY;

    items.forEach((item, i) => {
      const rect = item.getBoundingClientRect();
      const itemCenterY = rect.top + (rect.height / 2);
      const dist = Math.abs(itemCenterY - centerY);
      if (dist < bestDist) {
        bestDist = dist;
        bestIdx = i;
      }
    });

    return bestIdx;
  }

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
    if (!smooth) setLockedItem(clamped);
    onChange(clamped);
  }

  function snapToNearest() {
    const idx = getCenterAlignedIndex(currentIdx);
    scrollToIdx(idx, true);
    clearTimeout(lockTimer);
    lockTimer = setTimeout(() => {
      if (!el.isConnected) return;
      const centeredIdx = getCenterAlignedIndex(currentIdx);
      currentIdx = centeredIdx;
      updateStyles(centeredIdx);
      setLockedItem(centeredIdx);
      onChange(centeredIdx);
    }, 130);
  }

  // ✅ initial sizing + position
  refreshWheelSizing();
  onChange(currentIdx);
  setLockedItem(currentIdx);

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
      clearTimeout(lockTimer);
      window.removeEventListener('resize', onResize);
      if (activeWheelCtrl && activeWheelCtrl.getIndex === this.getIndex) activeWheelCtrl = null;
    }
  });

  el.addEventListener('scroll', () => {
    clearTimeout(scrollTimer);
    clearTimeout(lockTimer);
    setLockedItem(-1);
    const clamped = getCenterAlignedIndex(currentIdx);
    currentIdx = clamped;
    updateStyles(clamped);
    triggerPickerStartLottieFromWheel();
    scrollTimer = setTimeout(snapToNearest, 110);
  }, { passive: true });

  items.forEach((item, i) => item.addEventListener('click', () => scrollToIdx(i, true)));
}

// ------------------------------------------------------------
// SHUFFLE ANIMATION
// ------------------------------------------------------------
async function doShuffle() {
  clearTimeout(loadingTimer);
  const runId = ++shuffleRunId;

  const deckInfo = DECK_LIST[currentDeckIdx];
  const backUrl = deckBack(deckInfo.id);

  shuffledDeck = shuffleDeck(fullDeck);
  drawnCards = [];
  viewIndex = 0;
  prewarmLoadingGifs(10);

  if (backUrl) {
    const backLoadStats = await preloadImageUrlWithStats(backUrl, SHUFFLE_BACK_PRELOAD_TIMEOUT_MS);
    if (runId !== shuffleRunId) return;

    const guardMs = computeShuffleBackGuardMs(backLoadStats);
    if (guardMs > 0) {
      await sleep(guardMs);
      if (runId !== shuffleRunId) return;
    }
  }

  const style = backUrl
    ? `style="background-image:url('${backUrl}'); background-size:cover; background-position:center; background-repeat:no-repeat;"`
    : '';

  screen = 'shuffling';
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
  setTimeout(() => {
    if (runId !== shuffleRunId) return;
    if (screen === 'shuffling') renderGrid();
  }, SHUFFLE_SCREEN_DURATION_MS);
}

// ------------------------------------------------------------
// FACE-DOWN GRID
// ------------------------------------------------------------
function renderGrid() {
  screen = 'grid';
  prewarmLoadingGifs(10);

  const picked = drawnCards.length;
  const reachedMax = picked >= MAX_GRID_PICK_CARDS;
  const deckInfo = DECK_LIST[currentDeckIdx];
  const backUrl = deckBack(deckInfo.id);

  app.innerHTML = `
    <div class="grid-screen">
      <div class="grid-header">
        <span class="grid-status">${reachedMax ? 'Cards Picked (max)' : 'Cards Picked'}</span>
        <span class="grid-count">${picked}/${MAX_GRID_PICK_CARDS}</span>
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

      <div class="grid-footer">
        <p class="grid-hint">${reachedMax ? `Maximum ${MAX_GRID_PICK_CARDS} cards selected` : 'Tap cards to select your spread'}</p>
        <button id="gridRevealBtn" class="btn-start grid-reveal-btn" ${picked === 0 ? 'disabled' : ''} aria-label="Card reveal">
          <span class="lottie" id="iconGridReveal"></span>
          <span class="btn-label">CARD REVEAL</span>
        </button>
      </div>
      <div id="toast" class="toast" aria-live="polite"></div>
    </div>
  `;

  const statusEl = document.querySelector('.grid-status');
  const countEl = document.querySelector('.grid-count');
  const hintEl = document.querySelector('.grid-hint');
  const revealBtn = document.getElementById('gridRevealBtn');
  let transitioning = false;

  if (revealBtn) {
    bindButtonAction(revealBtn, () => {
      if (transitioning) return;
      if (drawnCards.length === 0) {
        showToast('Pick at least 1 card');
        return;
      }
      transitioning = true;
      renderLoading();
    }, 130);
  }

  mountLottieInteractive(document.getElementById('iconGridReveal'), ICONS.start_screen.next_arrow_deck_picker, { sizePx: 28, colorHex: '#1d1300' }).catch(() => {});

  document.querySelectorAll('.grid-card:not(.picked)').forEach(el => {
    el.addEventListener('click', () => {
      if (transitioning) return;
      if (drawnCards.length >= MAX_GRID_PICK_CARDS) return;

      const idx = parseInt(el.dataset.idx, 10);

      // prevent double-pick on the same tile
      el.style.pointerEvents = 'none';

      // animate card as being taken away from the deck
      el.classList.add('taking-away');

      // commit selection immediately to state
      drawnCards.push({ ...shuffledDeck[idx], _gridIdx: idx });

      // update header immediately
      const nowPicked = drawnCards.length;
      const nowMaxed = nowPicked >= MAX_GRID_PICK_CARDS;
      if (statusEl) statusEl.textContent = nowMaxed ? 'Cards Picked (max)' : 'Cards Picked';
      if (countEl) countEl.textContent = `${nowPicked}/${MAX_GRID_PICK_CARDS}`;
      if (hintEl) hintEl.textContent = nowMaxed ? `Maximum ${MAX_GRID_PICK_CARDS} cards selected` : 'Tap cards to select your spread';
      if (revealBtn) revealBtn.disabled = nowPicked === 0;
      prewarmLoadingGifs(3);

      // after take-away animation, mark as picked
      setTimeout(() => {
        el.classList.remove('taking-away');
        el.classList.add('picked');
        persistSession();
      }, CARD_TAKE_AWAY_DURATION_MS);
    });
  });
}

function renderLoading() {
  screen = 'loading';
  clearTimeout(loadingTimer);
  const runId = ++loadingRunId;

  app.innerHTML = `
    <div class="loading-screen">
      <div class="loading-wrap">
        <img class="loading-gif is-loading" id="loadingGif" src="" alt="Loading animation" decoding="async" />
        <div class="loading-fallback" id="loadingFallback" aria-hidden="true">✦</div>
      </div>
      <p class="loading-label">Revealing your spread...</p>
    </div>
  `;

  const loadingGifEl = document.getElementById('loadingGif');
  const loadingFallbackEl = document.getElementById('loadingFallback');
  const candidates = pickLoadingGifCandidates(6);
  loadingFallbackEl?.classList.add('show');

  if (loadingGifEl && candidates.length) {
    loadingGifEl.decoding = 'async';

    void (async () => {
      let loaded = false;

      for (const gifUrl of candidates) {
        if (screen !== 'loading') return;
        const ok = await loadGifWithGuard(loadingGifEl, gifUrl, 1500);
        if (ok) {
          loaded = true;
          break;
        }
      }

      if (screen !== 'loading') return;

      if (loaded) {
        loadingGifEl.classList.remove('is-loading', 'is-hidden');
        loadingFallbackEl?.classList.remove('show');
      } else {
        loadingGifEl.classList.remove('is-loading');
        loadingGifEl.classList.add('is-hidden');
        loadingFallbackEl?.classList.add('show');
      }
    })();
  } else {
    loadingFallbackEl?.classList.add('show');
  }

  const spreadUrls = getCurrentSpreadImageUrls();
  const spreadPreloadTimeoutMs = getDynamicSpreadPreloadTimeoutMs(spreadUrls.length);
  const minDelayPromise = sleep(LOADING_SCREEN_DURATION_MS);
  const spreadPreloadPromise = preloadCurrentSpreadImages(spreadPreloadTimeoutMs, spreadUrls);

  void (async () => {
    await Promise.all([minDelayPromise, spreadPreloadPromise]);
    await sleep(LOADING_SCREEN_SETTLE_MS);
    if (runId !== loadingRunId || screen !== 'loading') return;
    clearTimeout(loadingTimer);
    renderSpread();
  })();

  // safety fallback in case image preload hangs due platform bugs
  loadingTimer = setTimeout(() => {
    if (runId !== loadingRunId || screen !== 'loading') return;
    renderSpread();
  }, LOADING_SCREEN_DURATION_MS + spreadPreloadTimeoutMs + LOADING_SCREEN_FALLBACK_BUFFER_MS);
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

function applySpreadVerticalCentering() {
  if (screen !== 'spread') return;
  const spreadScreenEl = document.querySelector('.spread-screen');
  const spreadAreaEl = document.querySelector('.spread-area');
  if (!spreadAreaEl || !spreadScreenEl) return;

  const getOuterHeight = (el) => {
    if (!el) return 0;
    const rect = el.getBoundingClientRect();
    const cs = window.getComputedStyle(el);
    const marginTop = parseFloat(cs.marginTop || '0') || 0;
    const marginBottom = parseFloat(cs.marginBottom || '0') || 0;
    return rect.height + marginTop + marginBottom;
  };

  const children = Array.from(spreadScreenEl.children);
  const areaIndex = children.indexOf(spreadAreaEl);
  let topOccupiedH = 0;
  let bottomOccupiedH = 0;

  children.forEach((child, idx) => {
    if (child === spreadAreaEl) return;
    if (child.classList && child.classList.contains('toast')) return;
    const pos = window.getComputedStyle(child).position;
    if (pos === 'absolute' || pos === 'fixed') return;
    const h = getOuterHeight(child);
    if (idx < areaIndex) topOccupiedH += h;
    else bottomOccupiedH += h;
  });

  const centerOffsetPx = Math.round((bottomOccupiedH - topOccupiedH) / 2);

  const cs = window.getComputedStyle(spreadAreaEl);
  const basePadTop = parseFloat(cs.paddingTop || '0') || 0;
  const basePadBottom = parseFloat(cs.paddingBottom || '0') || 0;
  const rowGap = parseFloat(cs.rowGap || cs.gap || '0') || 0;
  const rowEls = Array.from(spreadAreaEl.children).filter((el) =>
    el.classList && el.classList.contains('spread-row')
  );
  const rowsHeight = rowEls.reduce((sum, rowEl) => sum + rowEl.getBoundingClientRect().height, 0);
  const contentHeight = rowsHeight + Math.max(0, rowEls.length - 1) * rowGap;
  const innerHeight = Math.max(0, spreadAreaEl.clientHeight - basePadTop - basePadBottom);
  const fitsWithoutScroll = contentHeight <= (innerHeight + SPREAD_CENTER_FIT_TOLERANCE_PX);

  spreadAreaEl.classList.toggle('fit-centered', fitsWithoutScroll);
  spreadAreaEl.style.setProperty('--spread-fit-center-offset', fitsWithoutScroll ? `${centerOffsetPx}px` : '0px');
  if (fitsWithoutScroll) spreadAreaEl.scrollTop = 0;
}

function queueSpreadVerticalCentering() {
  if (screen !== 'spread') return;
  cancelAnimationFrame(spreadCenteringRaf);
  spreadCenteringRaf = requestAnimationFrame(() => {
    spreadCenteringRaf = requestAnimationFrame(() => {
      spreadCenteringRaf = 0;
      applySpreadVerticalCentering();
    });
  });
}

function bindSpreadResizeCentering() {
  if (spreadResizeBound || typeof window === 'undefined') return;
  window.addEventListener('resize', () => {
    if (screen !== 'spread') return;
    queueSpreadVerticalCentering();
  });
  spreadResizeBound = true;
}

function syncSpreadCardAspectRatios(onLayoutChange) {
  const notifyLayout = () => {
    if (typeof onLayoutChange === 'function') onLayoutChange();
  };

  document.querySelectorAll('.spread-card').forEach((cardEl) => {
    const img = cardEl.querySelector('.spread-img');
    if (!img) return;

    const applyAspect = () => {
      const w = img.naturalWidth || 0;
      const h = img.naturalHeight || 0;
      if (!w || !h) return;
      cardEl.style.aspectRatio = `${w} / ${h}`;
      notifyLayout();
    };

    if (img.complete && img.naturalWidth > 0) applyAspect();
    else {
      img.addEventListener('load', applyAspect, { once: true });
      img.addEventListener('error', notifyLayout, { once: true });
    }
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
              const majorClass = card.type === 'major' ? 'major-arcana' : '';
              return `
                <div class="spread-card-wrap ${card.reversed ? 'reversed' : ''} ${majorClass}" data-idx="${cardIdx}">
                  <div class="spread-mini-badge ${card.reversed ? 'rev' : 'up'} ${majorClass}">${getSpreadMiniBadge(card, deckInfo.id)}</div>
                  <div class="spread-card ${card.reversed ? 'reversed' : ''} ${majorClass}">
                    ${hasImg
                      ? `<img class="spread-img" src="${card.image}" alt="${card.name}"
                           onerror="this.outerHTML='<div class=\\'spread-symbol\\'>${getCardSymbol(card, deckInfo.id)}</div>'" />`
                      : `<div class="spread-symbol">${getCardSymbol(card, deckInfo.id)}</div>`
                    }
                    <div class="spread-label">${card.reversed ? '↓' : ''}</div>
                  </div>
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

  let cardTransitioning = false;
  document.querySelectorAll('.spread-card-wrap').forEach(el => {
    el.addEventListener('click', () => {
      if (cardTransitioning) return;
      const idx = parseInt(el.dataset.idx, 10);
      if (Number.isNaN(idx)) return;
      cardTransitioning = true;
      triggerTapFeedback(el.querySelector('.spread-card') || el);
      setTimeout(() => renderCard(idx), 140);
    });
  });

  bindButtonAction(document.getElementById('copySpreadBtn'), async () => {
    const ok = await copyTextToClipboard(formatSpreadForCopy());
    showToast(ok ? 'Copied ✅' : 'Copy failed');
  }, 110);

  bindButtonAction(document.getElementById('spreadDetailBtn'), () => {
    renderCard(0);
  }, 130);

  bindButtonAction(document.getElementById('spreadHomeBtn'), () => {
    renderPicker();
  }, 130);

  const spreadIconLastFrameOpts = { sizePx: 34, colorHex: '#ffd36a', restAtEnd: true, playReversed: false };
  const spreadHomeFirstFrameOpts = { sizePx: 34, colorHex: '#ffd36a', restAtEnd: false, playReversed: false };
  mountLottieInteractive(document.getElementById('iconCopySpread'), ICONS.result_screen.copy_spread, spreadIconLastFrameOpts).catch(() => {});
  mountLottieInteractive(document.getElementById('iconSpreadDetail'), ICONS.result_screen.view_details, spreadIconLastFrameOpts).catch(() => {});
  mountLottieInteractive(document.getElementById('iconSpreadHome'), ICONS.result_screen.home, spreadHomeFirstFrameOpts).catch(() => {});
  bindSpreadResizeCentering();
  syncSpreadCardAspectRatios(queueSpreadVerticalCentering);
  queueSpreadVerticalCentering();
  setTimeout(() => {
    if (screen !== 'spread') return;
    queueSpreadVerticalCentering();
  }, 120);
  setTimeout(() => {
    if (screen !== 'spread') return;
    queueSpreadVerticalCentering();
  }, 320);
  persistSession();
}

// ------------------------------------------------------------
// CARD DETAIL VIEW
// ------------------------------------------------------------
function renderReveal(lastPickedCard) {
  screen = 'reveal';

  const deckInfo = DECK_LIST[currentDeckIdx];
  const backUrl = deckBack(deckInfo.id);

  // show up to 3 most recently picked cards
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
        <span class="card-name ${card.reversed ? 'rev' : 'up'}">${card.name}</span>
        <span class="card-orientation ${card.reversed ? 'rev' : 'up'}">${reversedLabel}</span>

      </div>
      <div id="toast" class="toast" aria-live="polite"></div>

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

  bindButtonAction(document.getElementById('prevBtn'), () => renderCard(index - 1), 110);
  bindButtonAction(document.getElementById('nextBtn'), () => renderCard(index + 1), 110);
  bindButtonAction(document.getElementById('reshuffleBtn'), doShuffle, 130);
  bindButtonAction(document.getElementById('spreadBtn'), renderSpread, 120);
  const cardFrameEl = document.getElementById('cardFrame');
  if (cardFrameEl) {
    let frameBusy = false;
    const goBackToSpread = () => {
      if (frameBusy) return;
      frameBusy = true;
      triggerTapFeedback(cardFrameEl);
      setTimeout(() => {
        renderSpread();
      }, 130);
    };

    cardFrameEl.addEventListener('click', goBackToSpread);
    cardFrameEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        goBackToSpread();
      }
    });
  }

  // Copy spread button
const copyBtn = document.getElementById('copyCardBtn');
if (copyBtn) {
  bindButtonAction(copyBtn, async () => {
    const text = formatSingleCardForCopy(viewIndex);
    const ok = await copyTextToClipboard(text);
    showToast(ok ? 'Copied ✅' : 'Copy failed');
    copyBtn.classList.remove('copy-feedback');
    // restart pulse feedback animation on each click
    void copyBtn.offsetWidth;
    copyBtn.classList.add('copy-feedback');
    setTimeout(() => copyBtn.classList.remove('copy-feedback'), 420);
  }, 100);
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
  if (screen === 'grid') {
    clickIfExists('gridRevealBtn');
    return;
  }
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
