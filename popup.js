// DOM Elemente
const toggleEnabled = document.getElementById('toggleEnabled');
const toggleSponsored = document.getElementById('toggleSponsored');
const toggleFBM = document.getElementById('toggleFBM');
const statusDot = document.getElementById('statusDot');
const hiddenCount = document.getElementById('hiddenCount');
const sponsoredCount = document.getElementById('sponsoredCount');
const fbmCount = document.getElementById('fbmCount');
const openSettingsBtn = document.getElementById('openSettings');

/**
 * Update the status dot based on enabled state
 * @param {boolean} enabled - Whether the extension is enabled
 */
function updateStatusDot(enabled) {
  if (enabled) {
    statusDot.classList.remove('disabled');
  } else {
    statusDot.classList.add('disabled');
  }
}

/**
 * Load settings from chrome.storage.sync and counter from local
 */
function loadSettings() {
  if (chrome.storage && chrome.storage.sync) {
    chrome.storage.sync.get(['enabled', 'hideSponsored', 'hideFBM'], (result) => {
      // Default to enabled if not set
      const isEnabled = result.enabled !== undefined ? result.enabled : true;
      const hideSponsored = result.hideSponsored !== undefined ? result.hideSponsored : true;
      const hideFBM = result.hideFBM !== undefined ? result.hideFBM : true;

      toggleEnabled.checked = isEnabled;
      toggleSponsored.checked = hideSponsored;
      toggleFBM.checked = hideFBM;
      updateStatusDot(isEnabled);
    });
  }

  // Load hidden count and detailed stats from local storage
  loadDetailedStats();
}

/**
 * Load detailed stats from chrome.storage.local and request fresh stats from content script
 */
function loadDetailedStats() {
  // First, try to get from storage
  if (chrome.storage && chrome.storage.local) {
    chrome.storage.local.get(['hiddenCount', 'detailedStats'], (result) => {
      const count = result.hiddenCount || 0;
      hiddenCount.textContent = count.toString();

      if (result.detailedStats) {
        updateStatsDisplay(result.detailedStats);
      }
    });
  }

  // Then, request fresh detailed stats from content script in active tab
  if (chrome.tabs) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0] && tabs[0].id) {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'getDetailedStats' }, (response) => {
          // Check for errors (e.g., content script not loaded on non-Amazon pages)
          if (chrome.runtime.lastError) {
            // Silently ignore - content script might not be active on this page
            return;
          }
          if (response) {
            if (response.hiddenCount !== undefined) {
              hiddenCount.textContent = response.hiddenCount.toString();
            }
            if (response.detailedStats) {
              updateStatsDisplay(response.detailedStats);
            }
          }
        });
      }
    });
  }
}

/**
 * Update the stats display with detailed breakdown
 * @param {Object} stats - The detailed stats object
 */
function updateStatsDisplay(stats) {
  sponsoredCount.textContent = (stats.sponsored || 0).toString();
  fbmCount.textContent = ((stats.fbm || 0) + (stats.noPrime || 0)).toString();
}

/**
 * Save a filter setting to chrome.storage.sync
 * @param {string} key - The setting key
 * @param {boolean} value - The setting value
 */
function saveFilterSetting(key, value) {
  if (chrome.storage && chrome.storage.sync) {
    chrome.storage.sync.set({ [key]: value });
  }
}

/**
 * Save enabled state to chrome.storage.sync
 * @param {boolean} enabled - Whether the extension is enabled
 */
function saveEnabledState(enabled) {
  if (chrome.storage && chrome.storage.sync) {
    chrome.storage.sync.set({ enabled: enabled }, () => {
      updateStatusDot(enabled);
    });
  }
}

/**
 * Open the full options page
 */
function openOptionsPage() {
  if (chrome.runtime && chrome.runtime.openOptionsPage) {
    chrome.runtime.openOptionsPage();
  } else {
    // Fallback for older browsers
    window.open(chrome.runtime.getURL('options.html'));
  }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
  loadSettings();
});

toggleEnabled.addEventListener('change', () => {
  saveEnabledState(toggleEnabled.checked);
});

toggleSponsored.addEventListener('change', () => {
  saveFilterSetting('hideSponsored', toggleSponsored.checked);
});

toggleFBM.addEventListener('change', () => {
  saveFilterSetting('hideFBM', toggleFBM.checked);
});

openSettingsBtn.addEventListener('click', () => {
  openOptionsPage();
});

// Listen for storage changes to update counter in real-time
if (chrome.storage && chrome.storage.onChanged) {
  chrome.storage.onChanged.addListener((changes, namespace) => {
    // Listen for enabled state and filter changes in sync storage
    if (namespace === 'sync') {
      if (changes.enabled !== undefined) {
        toggleEnabled.checked = changes.enabled.newValue;
        updateStatusDot(changes.enabled.newValue);
      }
      if (changes.hideSponsored !== undefined) {
        toggleSponsored.checked = changes.hideSponsored.newValue;
      }
      if (changes.hideFBM !== undefined) {
        toggleFBM.checked = changes.hideFBM.newValue;
      }
    }
    // Listen for hidden count and detailed stats changes in local storage
    if (namespace === 'local') {
      if (changes.hiddenCount !== undefined) {
        hiddenCount.textContent = (changes.hiddenCount.newValue || 0).toString();
      }
      if (changes.detailedStats !== undefined) {
        updateStatsDisplay(changes.detailedStats.newValue || {});
      }
    }
  });
}
