(function whatsNewController() {
  'use strict';
  const extensionApi = globalThis.browser || globalThis.chrome;
  document.querySelectorAll('[data-version]').forEach((node) => {
    node.textContent = extensionApi.runtime.getManifest().version;
  });
  document.getElementById('openOptions').addEventListener('click', () => extensionApi.runtime.openOptionsPage());
})();
