(function optionsController() {
  'use strict';

  const extensionApi = globalThis.browser || globalThis.chrome;
  const platformIds = ['amazon', 'aliexpress', 'alibaba', 'temu', 'shein', 'dhgate', 'banggood', 'ebay'];
  const scalarDefaults = {
    enabled: true, viewMode: 'remove', similarityThreshold: 0.9,
    requireShippingKnown: true, showIndicator: true,
    hideFBM: true, hideUnknown: true, strictPrime: false,
  };
  const platformDefaults = (id) => ({
    enabled: true, hideSponsored: true, hideRecommended: id !== 'amazon' && id !== 'aliexpress',
    deduplicate: id !== 'amazon', sortByPrice: false,
  });

  function storageGet(defaults) {
    return new Promise((resolve) => extensionApi.storage.sync.get(defaults, (result) => {
      void extensionApi.runtime.lastError; resolve(result || defaults);
    }));
  }
  function storageSet(area, values) {
    return new Promise((resolve) => extensionApi.storage[area].set(values, () => {
      void extensionApi.runtime.lastError; resolve();
    }));
  }
  function platformSettingsFromForm() {
    return Object.fromEntries(platformIds.map((id) => {
      const root = document.querySelector(`[data-platform="${id}"]`);
      return [id, Object.fromEntries(
        Array.from(root.querySelectorAll('[data-option]')).map((input) => [input.dataset.option, input.checked])
      )];
    }));
  }
  function renderPlatformSettings(platformSettings) {
    platformIds.forEach((id) => {
      const values = { ...platformDefaults(id), ...(platformSettings?.[id] || {}) };
      const root = document.querySelector(`[data-platform="${id}"]`);
      root.querySelectorAll('[data-option]').forEach((input) => { input.checked = Boolean(values[input.dataset.option]); });
    });
  }
  function flashSaved() {
    const button = document.getElementById('save');
    const original = button.textContent;
    button.textContent = 'Gespeichert';
    setTimeout(() => { button.textContent = original; }, 1200);
  }
  async function save() {
    const values = Object.fromEntries(Object.keys(scalarDefaults).map((key) => {
      const control = document.getElementById(key);
      return [key, control.type === 'checkbox' ? control.checked : key === 'similarityThreshold' ? Number(control.value) : control.value];
    }));
    values.platformSettings = platformSettingsFromForm();
    await storageSet('sync', values);
    flashSaved();
  }
  async function init() {
    const defaults = { ...scalarDefaults, platformSettings: Object.fromEntries(platformIds.map((id) => [id, platformDefaults(id)])) };
    const saved = await storageGet(defaults);
    Object.keys(scalarDefaults).forEach((key) => {
      const control = document.getElementById(key);
      if (control.type === 'checkbox') control.checked = Boolean(saved[key]);
      else control.value = String(saved[key]);
    });
    renderPlatformSettings(saved.platformSettings);
    document.querySelectorAll('[data-version]').forEach((node) => {
      node.textContent = `v${extensionApi.runtime.getManifest().version}`;
    });
  }

  document.getElementById('save').addEventListener('click', save);
  document.getElementById('resetIndicator').addEventListener('click', async () => {
    await storageSet('local', { indicatorDismissed: false });
    document.getElementById('resetIndicator').textContent = 'Hinweis ist wieder aktiv';
  });
  init();
})();
