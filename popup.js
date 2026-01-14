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
 * Load settings from chrome.storage.sync
 */
function loadSettings() {
    if (chrome.storage && chrome.storage.sync) {
        chrome.storage.sync.get(['enabled', 'hiddenProductsCount'], (result) => {
            // Default to enabled if not set
            const isEnabled = result.enabled !== undefined ? result.enabled : true;
            toggleEnabled.checked = isEnabled;
            updateStatusDot(isEnabled);

            // Load counter (placeholder - will be connected to content script later)
            const count = result.hiddenProductsCount || 0;
            hiddenCount.textContent = count.toString();
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
        if (namespace === 'sync') {
            if (changes.hiddenProductsCount) {
                hiddenCount.textContent = (changes.hiddenProductsCount.newValue || 0).toString();
            }
            if (changes.enabled !== undefined) {
                toggleEnabled.checked = changes.enabled.newValue;
                updateStatusDot(changes.enabled.newValue);
            }
        }
    });
}
