// content.js - FBA Finder Content Script

// Visual Feedback Indicator
let indicatorElement = null;
let indicatorDismissed = false;

// CSS Styles for floating indicator and animations
const INDICATOR_STYLES = `
.fba-finder-indicator {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: #232F3E;
  color: #FFFFFF;
  padding: 10px 14px;
  border-radius: 6px;
  font-size: 13px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  z-index: 99999;
  box-shadow: 0 2px 12px rgba(0,0,0,0.25);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: opacity 0.3s ease, transform 0.3s ease;
  user-select: none;
}

.fba-finder-indicator:hover {
  background: #374151;
  transform: translateY(-2px);
}

.fba-finder-indicator.fba-finder-hidden {
  opacity: 0;
  pointer-events: none;
  transform: translateY(10px);
}

.fba-finder-indicator-icon {
  width: 16px;
  height: 16px;
  background: #FF9900;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: bold;
  color: #232F3E;
}

.fba-finder-indicator-close {
  margin-left: 6px;
  opacity: 0.7;
  font-size: 16px;
  line-height: 1;
}

.fba-finder-indicator-close:hover {
  opacity: 1;
}

/* Animation for products being filtered */
.fba-finder-fade-out {
  animation: fbaFinderFadeOut 0.4s ease forwards;
}

@keyframes fbaFinderFadeOut {
  from {
    opacity: 1;
    transform: scale(1);
  }
  to {
    opacity: 0;
    transform: scale(0.95);
  }
}

.fba-finder-dim-transition {
  transition: opacity 0.4s ease, filter 0.4s ease;
}
`;

// Inject styles into the page
function injectIndicatorStyles() {
  if (document.getElementById('fba-finder-styles')) return;

  const styleTag = document.createElement('style');
  styleTag.id = 'fba-finder-styles';
  styleTag.textContent = INDICATOR_STYLES;
  document.head.appendChild(styleTag);
}

// Create or update the floating indicator
function createIndicator() {
  if (indicatorDismissed) return;

  if (!indicatorElement) {
    indicatorElement = document.createElement('div');
    indicatorElement.className = 'fba-finder-indicator fba-finder-hidden';
    indicatorElement.setAttribute('role', 'status');
    indicatorElement.setAttribute('aria-live', 'polite');

    // Create indicator icon
    const iconSpan = document.createElement('span');
    iconSpan.className = 'fba-finder-indicator-icon';
    iconSpan.textContent = '✓';

    // Create indicator text
    const textSpan = document.createElement('span');
    textSpan.className = 'fba-finder-indicator-text';
    textSpan.textContent = 'FBA Finder: 0 gefiltert';

    // Create close button
    const closeSpan = document.createElement('span');
    closeSpan.className = 'fba-finder-indicator-close';
    closeSpan.setAttribute('title', 'Ausblenden');
    closeSpan.textContent = '×';

    // Append all elements
    indicatorElement.appendChild(iconSpan);
    indicatorElement.appendChild(textSpan);
    indicatorElement.appendChild(closeSpan);

    // Click on close button to dismiss
    closeSpan.addEventListener('click', (e) => {
      e.stopPropagation();
      dismissIndicator();
    });

    // Click on indicator itself to temporarily minimize
    indicatorElement.addEventListener('click', () => {
      indicatorElement.classList.add('fba-finder-hidden');
      // Show again after 5 seconds
      setTimeout(() => {
        if (!indicatorDismissed && countHiddenProducts() > 0) {
          indicatorElement.classList.remove('fba-finder-hidden');
        }
      }, 5000);
    });

    document.body.appendChild(indicatorElement);
  }
}

// Update indicator with current count
function updateIndicator(count) {
  if (!indicatorElement || indicatorDismissed) return;

  const textElement = indicatorElement.querySelector('.fba-finder-indicator-text');
  if (textElement) {
    textElement.textContent = `FBA Finder: ${count} gefiltert`;
  }

  // Only show if products have been filtered
  if (count > 0 && settings.enabled) {
    indicatorElement.classList.remove('fba-finder-hidden');
  } else {
    indicatorElement.classList.add('fba-finder-hidden');
  }
}

// Dismiss indicator and save preference
function dismissIndicator() {
  indicatorDismissed = true;
  if (indicatorElement) {
    indicatorElement.classList.add('fba-finder-hidden');
  }
  // Save preference in local storage
  if (chrome.storage && chrome.storage.local) {
    chrome.storage.local.set({ indicatorDismissed: true });
  }
}

// Load indicator dismiss preference
function loadIndicatorPreference() {
  return new Promise((resolve) => {
    if (chrome.storage && chrome.storage.local) {
      chrome.storage.local.get(['indicatorDismissed'], (result) => {
        indicatorDismissed = result.indicatorDismissed === true;
        resolve();
      });
    } else {
      resolve();
    }
  });
}

// Remove indicator from DOM
function removeIndicator() {
  if (indicatorElement) {
    indicatorElement.classList.add('fba-finder-hidden');
  }
}

// 1. Begriffe für "Gesponsert/Werbung" in verschiedenen Sprachen
const SPONSORED_TERMS = [
  'gesponsert', // DE
  'sponsored', // EN (US, UK, CA, AU, IN, AE, SG)
  'sponsorisé', // FR, BE
  'sponsorizzato', // IT
  'patrocinado', // ES, MX, BR
  'sponsrad', // SE
  'gesponsord', // NL
  'sponsorowane', // PL
  'sponsorlu', // TR
  'スポンサー', // JP (Sponsor)
  '広告', // JP (Ad)
  'مُستَحسَن', // AR (AE, SA, EG)
  '赞助', // CN
  'प्रायोजित', // IN (Hindi)
];

// 2. Begriffe für "Versand durch Amazon" (FBA)
const FBA_TERMS = [
  'versand durch amazon', // DE
  'fulfilled by amazon', // EN
  'expédié par amazon', // FR, BE
  'spedito da amazon', // IT
  'gestionado por amazon', // ES, MX
  'enviado pela amazon', // BR
  'wysyłka przez amazon', // PL
  'verzonden door amazon', // NL
  'amazon tarafından', // TR (Teilmatch)
  'amazon sendas', // SE
  'amazon.co.jp が発送', // JP
  'ships from amazon', // EN Alternative
  'sold by amazon', // EN Alternative
  '配送: amazon', // JP Alternative
  '由亚马逊配送', // CN
];

// Standard-Einstellungen
let settings = {
  hideSponsored: true,
  hideFBM: true,
  strictPrime: false,
  viewMode: 'remove',
  enabled: true,
};

// Einstellungen aus dem Storage laden
function loadSettings() {
  return new Promise((resolve) => {
    if (chrome.storage && chrome.storage.sync) {
      chrome.storage.sync.get(
        ['hideSponsored', 'hideFBM', 'strictPrime', 'viewMode', 'enabled'],
        (result) => {
          settings = {
            hideSponsored: result.hideSponsored !== undefined ? result.hideSponsored : true,
            hideFBM: result.hideFBM !== undefined ? result.hideFBM : true,
            strictPrime: result.strictPrime !== undefined ? result.strictPrime : false,
            viewMode: result.viewMode || 'remove',
            enabled: result.enabled !== undefined ? result.enabled : true,
          };
          resolve(settings);
        }
      );
    } else {
      resolve(settings);
    }
  });
}

// Produkt basierend auf viewMode ausblenden/markieren
function hideProduct(product, reason) {
  product.dataset.fbaFinderProcessed = 'true';
  product.dataset.fbaFinderHidden = reason;

  switch (settings.viewMode) {
    case 'remove':
      // Add fade-out animation before hiding
      product.classList.add('fba-finder-fade-out');
      // Hide after animation completes
      setTimeout(() => {
        product.style.display = 'none';
      }, 400);
      break;
    case 'dim':
      // Add smooth transition class for dim mode
      product.classList.add('fba-finder-dim-transition');
      product.style.opacity = '0.3';
      break;
    case 'red-border':
      product.classList.add('fba-finder-dim-transition');
      product.style.border = '3px solid #dc2626';
      product.style.borderRadius = '8px';
      product.style.opacity = '0.7';
      break;
  }
}

// Hauptfunktion zum Filtern der Produkte
function filterAmazonProducts() {
  // Wenn deaktiviert, nichts tun und Counter auf 0 setzen
  if (!settings.enabled) {
    if (chrome.storage && chrome.storage.local) {
      chrome.storage.local.set({ hiddenCount: 0 });
    }
    // Reset badge when disabled
    if (chrome.runtime && chrome.runtime.sendMessage) {
      chrome.runtime.sendMessage({ type: 'updateBadge', count: 0 });
    }
    return;
  }

  // Alle Produkt-Karten auf der Seite finden
  const products = document.querySelectorAll('div[data-component-type="s-search-result"]');

  products.forEach((product) => {
    // Bereits verarbeitete Produkte überspringen
    if (product.dataset.fbaFinderProcessed === 'true') {
      return;
    }

    const productText = product.innerText.toLowerCase();

    // --- A. SPONSORED CHECK ---
    if (settings.hideSponsored) {
      const isSponsored = SPONSORED_TERMS.some((term) => productText.includes(term));

      if (isSponsored) {
        hideProduct(product, 'sponsored');
        return;
      }
    }

    // --- B. FBA CHECK ---
    if (settings.hideFBM) {
      // Prime-Icon suchen
      const hasPrimeIcon = product.querySelector('.a-icon-prime') !== null;

      // FBA-Text suchen
      const hasFbaText = FBA_TERMS.some((term) => productText.includes(term));

      // Strikter Prime-Modus: Nur Prime-Produkte zeigen
      if (settings.strictPrime) {
        if (!hasPrimeIcon) {
          hideProduct(product, 'no-prime');
          return;
        }
      } else {
        // Normaler Modus: Wenn KEIN Prime und KEIN FBA Text -> Ausblenden (FBM)
        if (!hasPrimeIcon && !hasFbaText) {
          hideProduct(product, 'fbm');
          return;
        }
      }
    }

    // Produkt ist sichtbar
    product.dataset.fbaFinderProcessed = 'true';
    product.dataset.fbaFinderHidden = 'false';
  });

  // Update hidden count after filtering
  updateHiddenCount();
}

// Alle Produkte wieder anzeigen (wenn Addon deaktiviert wird)
function showAllProducts() {
  const products = document.querySelectorAll('div[data-component-type="s-search-result"]');
  products.forEach((product) => {
    product.style.display = '';
    product.style.opacity = '';
    product.style.border = '';
    product.style.borderRadius = '';
    product.classList.remove('fba-finder-fade-out', 'fba-finder-dim-transition');
    product.dataset.fbaFinderProcessed = 'false';
  });
  // Hide indicator when extension is disabled
  removeIndicator();
}

// Produkte neu filtern (z.B. nach Einstellungsänderung)
function refilterProducts() {
  const products = document.querySelectorAll('div[data-component-type="s-search-result"]');
  products.forEach((product) => {
    product.style.display = '';
    product.style.opacity = '';
    product.style.border = '';
    product.style.borderRadius = '';
    product.classList.remove('fba-finder-fade-out', 'fba-finder-dim-transition');
    product.dataset.fbaFinderProcessed = 'false';
  });
  filterAmazonProducts();
}

// Debounce-Funktion, damit der Filter nicht zu oft feuert
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Debounced Version der Filter-Funktion
const debouncedFilter = debounce(filterAmazonProducts, 100);

// Counter für ausgeblendete Produkte
function countHiddenProducts() {
  const products = document.querySelectorAll('div[data-component-type="s-search-result"]');
  let count = 0;
  products.forEach((product) => {
    const hiddenReason = product.dataset.fbaFinderHidden;
    if (hiddenReason && hiddenReason !== 'false') {
      count++;
    }
  });
  return count;
}

// Detaillierte Statistiken nach Kategorie zählen
function getDetailedStats() {
  const products = document.querySelectorAll('div[data-component-type="s-search-result"]');
  const stats = {
    sponsored: 0,
    fbm: 0,
    noPrime: 0,
  };

  products.forEach((product) => {
    const hiddenReason = product.dataset.fbaFinderHidden;
    if (hiddenReason === 'sponsored') {
      stats.sponsored++;
    } else if (hiddenReason === 'fbm') {
      stats.fbm++;
    } else if (hiddenReason === 'no-prime') {
      stats.noPrime++;
    }
  });

  return stats;
}

// Speichere den Counter im Storage und aktualisiere Badge
function updateHiddenCount() {
  const count = countHiddenProducts();
  const detailedStats = getDetailedStats();

  if (chrome.storage && chrome.storage.local) {
    chrome.storage.local.set({
      hiddenCount: count,
      detailedStats: detailedStats,
    });
  }
  // Send message to background service worker to update badge
  if (chrome.runtime && chrome.runtime.sendMessage) {
    chrome.runtime.sendMessage({ type: 'updateBadge', count: count });
  }

  // Update the floating indicator
  updateIndicator(count);
}

// MutationObserver für Lazy-Loading
let observer = null;

function startObserver() {
  if (observer) {
    observer.disconnect();
  }

  observer = new MutationObserver((mutations) => {
    // Nur filtern, wenn tatsächlich Nodes hinzugefügt wurden
    const hasAddedNodes = mutations.some((mutation) => mutation.addedNodes.length > 0);
    if (hasAddedNodes) {
      debouncedFilter();
    }
  });

  // Beobachte den Haupt-Container der Suchergebnisse
  const resultList = document.querySelector('.s-main-slot');
  if (resultList) {
    observer.observe(resultList, { childList: true, subtree: true });
  }
}

// Auf Änderungen der Einstellungen reagieren
if (chrome.storage && chrome.storage.onChanged) {
  chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'sync') {
      if (changes.hideSponsored !== undefined) {
        settings.hideSponsored = changes.hideSponsored.newValue;
      }
      if (changes.hideFBM !== undefined) {
        settings.hideFBM = changes.hideFBM.newValue;
      }
      if (changes.strictPrime !== undefined) {
        settings.strictPrime = changes.strictPrime.newValue;
      }
      if (changes.viewMode !== undefined) {
        settings.viewMode = changes.viewMode.newValue;
      }
      if (changes.enabled !== undefined) {
        settings.enabled = changes.enabled.newValue;
      }

      if (settings.enabled) {
        createIndicator();
        refilterProducts();
      } else {
        showAllProducts();
      }
    }

    // Listen for indicator dismiss reset (from local storage)
    if (namespace === 'local' && changes.indicatorDismissed !== undefined) {
      indicatorDismissed = changes.indicatorDismissed.newValue === true;
      if (!indicatorDismissed && settings.enabled) {
        createIndicator();
        updateIndicator(countHiddenProducts());
      }
    }
  });
}

// Initialisierung
async function init() {
  await loadSettings();
  await loadIndicatorPreference();

  // Inject styles for indicator and animations
  injectIndicatorStyles();

  if (settings.enabled) {
    // Create the indicator element
    createIndicator();
    filterAmazonProducts();
    startObserver();
  }
}

// Message Listener für Popup-Anfragen
if (chrome.runtime && chrome.runtime.onMessage) {
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'getHiddenCount') {
      const count = countHiddenProducts();
      sendResponse({ hiddenCount: count });
    } else if (request.action === 'getDetailedStats') {
      const count = countHiddenProducts();
      const detailedStats = getDetailedStats();
      sendResponse({
        hiddenCount: count,
        detailedStats: detailedStats,
      });
    }
    return true; // Keep message channel open for async response
  });
}

// Starten
init();
