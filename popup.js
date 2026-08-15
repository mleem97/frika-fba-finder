(function popupController() {
  'use strict';

  const extensionApi = globalThis.browser || globalThis.chrome;
  const platformLabels = {
    amazon: 'Amazon', aliexpress: 'AliExpress', alibaba: 'Alibaba', temu: 'Temu', shein: 'SHEIN',
    dhgate: 'DHgate', banggood: 'Banggood', ebay: 'eBay',
  };
  const platformDefaults = {
    enabled: true, hideSponsored: true, hideRecommended: true, deduplicate: true, sortByPrice: false,
  };
  const statKeys = ['hidden', 'sponsored', 'duplicate', 'recommended', 'fbm', 'unknown'];
  let currentPlatformId = null;
  let savedSettings = { enabled: true, platformSettings: {} };

  function getStorage(area, values) {
    return new Promise((resolve) => extensionApi.storage[area].get(values, (result) => {
      void extensionApi.runtime.lastError; resolve(result || values);
    }));
  }
  function setStorage(area, values) {
    return new Promise((resolve) => extensionApi.storage[area].set(values, () => {
      void extensionApi.runtime.lastError; resolve();
    }));
  }
  function activeTab() {
    return new Promise((resolve) => extensionApi.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      void extensionApi.runtime.lastError; resolve(tabs?.[0] || null);
    }));
  }
  function setStats(stats = {}) {
    statKeys.forEach((key) => { document.getElementById(key).textContent = String(stats[key] || 0); });
  }
  function setPageStatus(active, platformId) {
    const label = platformLabels[platformId] || 'Shop';
    document.getElementById('pageStatus').textContent = active ? `${label}-Ergebnisse erkannt` : 'Auf dieser Seite nicht aktiv';
    document.getElementById('pageStatusDot').classList.toggle('status-dot--active', active);
    document.getElementById('platformLabel').textContent = active ? label : 'Kein unterstützter Shop';
    ['platformEnabled', 'hideSponsored', 'hideRecommended', 'deduplicate'].forEach((id) => {
      document.getElementById(id).disabled = !active;
    });
  }
  function renderPlatformSettings() {
    if (!currentPlatformId) return;
    const platform = { ...platformDefaults, ...(savedSettings.platformSettings[currentPlatformId] || {}) };
    Object.keys(platformDefaults).filter((key) => key !== 'sortByPrice').forEach((key) => {
      document.getElementById(key === 'enabled' ? 'platformEnabled' : key).checked = Boolean(platform[key]);
    });
  }
  async function savePlatformSetting(key, value) {
    const platformSettings = structuredClone(savedSettings.platformSettings || {});
    platformSettings[currentPlatformId] = {
      ...platformDefaults, ...(platformSettings[currentPlatformId] || {}), [key]: value,
    };
    savedSettings.platformSettings = platformSettings;
    await setStorage('sync', { platformSettings });
  }
  async function requestLiveStats() {
    const tab = await activeTab();
    if (!tab?.id) return setPageStatus(false, null);
    extensionApi.tabs.sendMessage(tab.id, { action: 'getStats' }, (response) => {
      const failed = Boolean(extensionApi.runtime.lastError);
      currentPlatformId = failed ? null : response?.platformId || null;
      setPageStatus(!failed && response?.supportedPage === true, currentPlatformId);
      if (!failed && response?.stats) setStats(response.stats);
      renderPlatformSettings();
    });
  }
  async function init() {
    const [sync, local] = await Promise.all([
      getStorage('sync', { enabled: true, platformSettings: {} }),
      getStorage('local', { shopFilterStats: {} }),
    ]);
    savedSettings = sync;
    document.getElementById('enabled').checked = sync.enabled !== false;
    document.getElementById('enabled').addEventListener('change', (event) => setStorage('sync', { enabled: event.target.checked }));
    const controlMap = {
      platformEnabled: 'enabled', hideSponsored: 'hideSponsored',
      hideRecommended: 'hideRecommended', deduplicate: 'deduplicate',
    };
    Object.entries(controlMap).forEach(([id, key]) => {
      document.getElementById(id).addEventListener('change', (event) => savePlatformSetting(key, event.target.checked));
    });
    document.querySelectorAll('[data-version]').forEach((node) => {
      node.textContent = `v${extensionApi.runtime.getManifest().version}`;
    });
    setStats(local.shopFilterStats);
    requestLiveStats();
  }

  document.getElementById('openOptions').addEventListener('click', () => extensionApi.runtime.openOptionsPage());
  extensionApi.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'local' && changes.shopFilterStats) setStats(changes.shopFilterStats.newValue);
  });
  init();
})();
