// DOM Elemente
const toggleEnabled = document.getElementById('toggleEnabled');
const statusDot = document.getElementById('statusDot');
const hiddenCount = document.getElementById('hiddenCount');
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
        chrome.storage.sync.get(['enabled'], (result) => {
            // Default to enabled if not set
            const isEnabled = result.enabled !== undefined ? result.enabled : true;
            toggleEnabled.checked = isEnabled;
            updateStatusDot(isEnabled);
        });
    }
    
    // Load hidden count from local storage
    loadHiddenCount();
}

/**
 * Load hidden count from chrome.storage.local and request fresh count from content script
 */
function loadHiddenCount() {
    // First, try to get from storage
    if (chrome.storage && chrome.storage.local) {
        chrome.storage.local.get(['hiddenCount'], (result) => {
            const count = result.hiddenCount || 0;
            hiddenCount.textContent = count.toString();
        });
    }
    
    // Then, request fresh count from content script in active tab
    if (chrome.tabs) {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0] && tabs[0].id) {
                chrome.tabs.sendMessage(tabs[0].id, { action: 'getHiddenCount' }, (response) => {
                    // Check for errors (e.g., content script not loaded on non-Amazon pages)
                    if (chrome.runtime.lastError) {
                        // Silently ignore - content script might not be active on this page
                        return;
                    }
                    if (response && response.hiddenCount !== undefined) {
                        hiddenCount.textContent = response.hiddenCount.toString();
                    }
                });
            }
        });
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

openSettingsBtn.addEventListener('click', () => {
    openOptionsPage();
});

// Listen for storage changes to update counter in real-time
if (chrome.storage && chrome.storage.onChanged) {
    chrome.storage.onChanged.addListener((changes, namespace) => {
        // Listen for enabled state changes in sync storage
        if (namespace === 'sync') {
            if (changes.enabled !== undefined) {
                toggleEnabled.checked = changes.enabled.newValue;
                updateStatusDot(changes.enabled.newValue);
            }
        }
        // Listen for hidden count changes in local storage
        if (namespace === 'local') {
            if (changes.hiddenCount !== undefined) {
                hiddenCount.textContent = (changes.hiddenCount.newValue || 0).toString();
            }
        }
    });
}
