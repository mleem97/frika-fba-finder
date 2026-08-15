(function contentScript() {
  'use strict';

  const extensionApi = globalThis.browser || globalThis.chrome;
  const detector = globalThis.ShopFilterDetector;
  const platformId = detector?.getPlatform(location.hostname);
  const PLATFORM_DEFAULTS = Object.fromEntries(
    Object.keys(detector?.PLATFORMS || {}).map((id) => [id, {
      enabled: true,
      hideSponsored: true,
      hideRecommended: id !== 'amazon',
      deduplicate: id !== 'amazon',
      sortByPrice: false,
    }])
  );
  const DEFAULT_SETTINGS = {
    enabled: true,
    hideFBM: true,
    hideUnknown: true,
    strictPrime: false,
    viewMode: 'remove',
    showIndicator: true,
    similarityThreshold: 0.9,
    requireShippingKnown: true,
    platformSettings: PLATFORM_DEFAULTS,
  };
  const FILTER_CLASSES = [
    'shop-filter-card--removed', 'shop-filter-card--dimmed', 'shop-filter-card--marked',
  ];

  let settings = structuredClone(DEFAULT_SETTINGS);
  let observer = null;
  let filterTimer = null;
  let indicator = null;

  function addStyles() {
    if (document.getElementById('shop-filter-styles')) return;
    const style = document.createElement('style');
    style.id = 'shop-filter-styles';
    style.textContent = `
      .shop-filter-card--removed { display: none !important; }
      .shop-filter-card--dimmed { opacity: .25 !important; filter: grayscale(.6); }
      .shop-filter-card--marked { outline: 3px solid #d13d3d !important; outline-offset: -3px; }
      .shop-filter-indicator {
        position: fixed; inset: auto 20px 20px auto; z-index: 2147483646; display: flex;
        align-items: center; gap: 10px; max-width: min(390px, calc(100vw - 32px)); padding: 10px 12px;
        border: 1px solid rgba(255,255,255,.16); border-radius: 12px; background: #17202b; color: #fff;
        box-shadow: 0 12px 32px rgba(15,23,42,.28); font: 600 13px/1.35 system-ui, sans-serif;
      }
      .shop-filter-indicator[hidden] { display: none !important; }
      .shop-filter-indicator__mark { display: grid; place-items: center; width: 24px; height: 24px; border-radius: 8px; background: #ffb000; color: #17202b; font-weight: 900; }
      .shop-filter-indicator__close { margin-left: 2px; padding: 3px 7px; border: 0; border-radius: 6px; background: transparent; color: #fff; font: inherit; cursor: pointer; }
      .shop-filter-indicator__close:hover, .shop-filter-indicator__close:focus-visible { background: #344150; }
      @media (prefers-reduced-motion: no-preference) { .shop-filter-card--dimmed { transition: opacity .18s ease, filter .18s ease; } }
      @media (max-width: 520px) { .shop-filter-indicator { inset: auto 12px 12px 12px; } }
    `;
    (document.head || document.documentElement).appendChild(style);
  }

  function storageGet(area, defaults) {
    return new Promise((resolve) => extensionApi.storage[area].get(defaults, (result) => {
      void extensionApi.runtime.lastError; resolve(result || defaults);
    }));
  }
  function storageSet(area, values) {
    return new Promise((resolve) => extensionApi.storage[area].set(values, () => {
      void extensionApi.runtime.lastError; resolve();
    }));
  }
  function mergeSettings(saved) {
    return {
      ...DEFAULT_SETTINGS,
      ...saved,
      platformSettings: Object.fromEntries(Object.entries(PLATFORM_DEFAULTS).map(([id, defaults]) => [
        id, { ...defaults, ...(saved.platformSettings?.[id] || {}) },
      ])),
    };
  }
  function clearCardState(card) {
    card.classList.remove(...FILTER_CLASSES);
    delete card.dataset.shopFilterReason;
    delete card.dataset.shopFilterSignature;
    delete card.dataset.shopFilterTotal;
  }
  function applyCardState(card, reason) {
    card.classList.remove(...FILTER_CLASSES);
    card.dataset.shopFilterReason = reason || 'visible';
    if (!reason) return;
    if (settings.viewMode === 'dim') card.classList.add('shop-filter-card--dimmed');
    else if (settings.viewMode === 'mark') card.classList.add('shop-filter-card--marked');
    else card.classList.add('shop-filter-card--removed');
  }
  function deduplicate(items, platformSettings) {
    if (!platformSettings.deduplicate) return;
    const eligible = items.filter((item) => !item.reason && item.facts.total != null);
    const claimed = new Set();
    eligible.forEach((item, index) => {
      if (claimed.has(item.card)) return;
      const group = [item];
      eligible.slice(index + 1).forEach((candidate) => {
        if (!claimed.has(candidate.card) && detector.areDuplicates(item.facts, candidate.facts, settings.similarityThreshold)) {
          group.push(candidate);
        }
      });
      if (group.length < 2) return;
      group.sort((left, right) => left.facts.total - right.facts.total);
      group.slice(1).forEach((duplicate) => { duplicate.reason = 'duplicate'; claimed.add(duplicate.card); });
      claimed.add(group[0].card);
    });
  }
  function sortVisibleItems(items, platformSettings) {
    if (!platformSettings.sortByPrice) return;
    const visible = items.filter((item) => !item.reason && item.facts.total != null);
    if (visible.length < 2 || !visible.every((item) => item.card.parentElement === visible[0].card.parentElement)) return;
    const parent = visible[0].card.parentElement;
    const sorted = [...visible].sort((a, b) => a.facts.total - b.facts.total);
    const currentOrder = visible.map((item) => item.card);
    if (sorted.every((item, index) => item.card === currentOrder[index])) return;
    sorted.forEach((item) => parent.appendChild(item.card));
  }
  function collectStats(items) {
    const stats = {
      platformId, scanned: items.length, hidden: 0, sponsored: 0, recommended: 0,
      duplicate: 0, fbm: 0, unknown: 0, noPrime: 0,
    };
    items.forEach(({ reason }) => {
      if (!reason) return;
      stats.hidden += 1;
      if (Object.hasOwn(stats, reason)) stats[reason] += 1;
    });
    return stats;
  }
  function sendBadge(count) {
    try {
      extensionApi.runtime.sendMessage({ type: 'updateBadge', count }, () => void extensionApi.runtime.lastError);
    } catch (_error) { /* Extension reload race. */ }
  }
  function ensureIndicator() {
    if (indicator || !document.body) return;
    indicator = document.createElement('aside');
    indicator.className = 'shop-filter-indicator';
    indicator.hidden = true;
    indicator.setAttribute('role', 'status');
    indicator.setAttribute('aria-live', 'polite');
    const mark = document.createElement('span');
    mark.className = 'shop-filter-indicator__mark'; mark.textContent = 'F'; mark.setAttribute('aria-hidden', 'true');
    const text = document.createElement('span'); text.className = 'shop-filter-indicator__text';
    const close = document.createElement('button'); close.type = 'button'; close.className = 'shop-filter-indicator__close';
    close.textContent = '×'; close.setAttribute('aria-label', 'Hinweis ausblenden');
    close.addEventListener('click', () => { indicator.hidden = true; storageSet('local', { indicatorDismissed: true }); });
    indicator.append(mark, text, close); document.body.appendChild(indicator);
  }
  async function publishStats(stats) {
    await storageSet('local', { shopFilterStats: stats, fbaFinderStats: stats });
    sendBadge(settings.enabled ? stats.hidden : 0);
    ensureIndicator();
    const local = await storageGet('local', { indicatorDismissed: false });
    const show = settings.enabled && settings.showIndicator && !local.indicatorDismissed && stats.hidden > 0;
    if (indicator) {
      indicator.hidden = !show;
      if (show) indicator.querySelector('.shop-filter-indicator__text').textContent = `${stats.hidden} von ${stats.scanned} Treffern auf ${detector.PLATFORMS[platformId].label} gefiltert`;
    }
  }
  async function filterProducts({ force = false } = {}) {
    if (!platformId) return;
    const cards = detector.findProductCards(document, platformId);
    const platformSettings = settings.platformSettings[platformId];
    if (!settings.enabled || !platformSettings.enabled) {
      cards.forEach(clearCardState);
      await publishStats(collectStats(cards.map((card) => ({ card, reason: null }))));
      return;
    }
    const items = cards.map((card) => {
      const signature = detector.signatureFor(card, { settings, platformSettings });
      const facts = detector.inspectProduct(card, platformId);
      if (!settings.requireShippingKnown && facts.total == null && facts.price) {
        facts.total = facts.price.amount * (facts.minimumOrder || 1);
      }
      const reason = detector.classifyProduct(facts, settings, platformSettings);
      if (force || card.dataset.shopFilterSignature !== signature) card.dataset.shopFilterSignature = signature;
      if (facts.total != null) card.dataset.shopFilterTotal = String(facts.total);
      return { card, facts, reason };
    });
    deduplicate(items, platformSettings);
    items.forEach((item) => applyCardState(item.card, item.reason));
    sortVisibleItems(items, platformSettings);
    await publishStats(collectStats(items));
  }
  function scheduleFilter(force = false) {
    clearTimeout(filterTimer); filterTimer = setTimeout(() => filterProducts({ force }), 160);
  }
  function startObserver() {
    observer?.disconnect();
    observer = new MutationObserver((mutations) => {
      if (mutations.some((mutation) => ['childList', 'characterData', 'attributes'].includes(mutation.type))) scheduleFilter(false);
    });
    observer.observe(document.body || document.documentElement, {
      childList: true, subtree: true, characterData: true, attributes: true,
      attributeFilter: ['aria-label', 'title', 'class', 'data-asin', 'data-product-id', 'data-goods-id', 'data-testid'],
    });
  }

  extensionApi.storage.onChanged.addListener((changes, namespace) => {
    if (namespace !== 'sync') return;
    const patch = Object.fromEntries(Object.entries(changes).map(([key, value]) => [key, value.newValue]));
    settings = mergeSettings({ ...settings, ...patch }); scheduleFilter(true);
  });
  extensionApi.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message?.action === 'getStats') {
      const cards = detector.findProductCards(document, platformId);
      const items = cards.map((card) => ({ card, reason: card.dataset.shopFilterReason === 'visible' ? null : card.dataset.shopFilterReason }));
      sendResponse({ stats: collectStats(items), platformId, supportedPage: Boolean(platformId) });
    } else if (message?.action === 'refilter') {
      filterProducts({ force: true }).then(() => sendResponse({ ok: true })); return true;
    }
    return false;
  });
  async function init() {
    if (!detector || !extensionApi?.storage || !platformId) return;
    settings = mergeSettings(await storageGet('sync', DEFAULT_SETTINGS));
    addStyles(); await filterProducts({ force: true }); startObserver();
  }
  init();
})();
