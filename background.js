(function backgroundScript() {
  'use strict';

  const extensionApi = globalThis.browser || globalThis.chrome;
  const BADGE_COLOR = '#ffb000';
  const BADGE_TEXT_COLOR = '#17202b';
  const PLATFORM_IDS = ['amazon', 'aliexpress', 'alibaba', 'temu', 'shein', 'dhgate', 'banggood', 'ebay'];

  function initializeBadge() {
    extensionApi.action.setBadgeBackgroundColor({ color: BADGE_COLOR });
    if (extensionApi.action.setBadgeTextColor) {
      extensionApi.action.setBadgeTextColor({ color: BADGE_TEXT_COLOR });
    }
  }

  function migrateSettings() {
    extensionApi.storage.sync.get(null, (saved) => {
      void extensionApi.runtime.lastError;
      const update = {};
      if (!saved.platformSettings) {
        update.platformSettings = Object.fromEntries(PLATFORM_IDS.map((id) => [id, {
          enabled: true,
          hideSponsored: id === 'amazon' && saved.hideSponsored !== undefined ? saved.hideSponsored : true,
          hideRecommended: id !== 'amazon',
          deduplicate: id !== 'amazon',
          sortByPrice: false,
        }]));
      }
      if (saved.viewMode === 'red-border') update.viewMode = 'mark';
      if (Object.keys(update).length > 0) extensionApi.storage.sync.set(update);
    });
  }

  extensionApi.runtime.onInstalled.addListener((details) => {
    initializeBadge();
    migrateSettings();
    if (details.reason === 'update' && details.previousVersion !== extensionApi.runtime.getManifest().version) {
      extensionApi.tabs.create({ url: extensionApi.runtime.getURL('whats-new.html') });
    }
  });
  extensionApi.runtime.onStartup?.addListener(initializeBadge);
  initializeBadge();

  extensionApi.runtime.onMessage.addListener((message, sender) => {
    if (message?.type !== 'updateBadge' || !sender.tab?.id) return;
    const count = Math.max(0, Number(message.count) || 0);
    extensionApi.action.setBadgeText({
      text: count > 99 ? '99+' : count > 0 ? String(count) : '',
      tabId: sender.tab.id,
    });
  });
})();
