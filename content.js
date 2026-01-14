// content.js - FBA Finder Content Script

// 1. Begriffe für "Gesponsert/Werbung" in verschiedenen Sprachen
const SPONSORED_TERMS = [
    "gesponsert",           // DE
    "sponsored",            // EN (US, UK, CA, AU, IN, AE, SG)
    "sponsorisé",           // FR, BE
    "sponsorizzato",        // IT
    "patrocinado",          // ES, MX, BR
    "sponsrad",             // SE
    "gesponsord",           // NL
    "sponsorowane",         // PL
    "sponsorlu",            // TR
    "スポンサー",            // JP (Sponsor)
    "広告",                  // JP (Ad)
    "مُستَحسَن",              // AR (AE, SA, EG)
    "赞助",                  // CN
    "प्रायोजित"              // IN (Hindi)
];

// 2. Begriffe für "Versand durch Amazon" (FBA)
const FBA_TERMS = [
    "versand durch amazon", // DE
    "fulfilled by amazon",  // EN
    "expédié par amazon",   // FR, BE
    "spedito da amazon",    // IT
    "gestionado por amazon",// ES, MX
    "enviado pela amazon",  // BR
    "wysyłka przez amazon", // PL
    "verzonden door amazon",// NL
    "amazon tarafından",    // TR (Teilmatch)
    "amazon sendas",        // SE
    "amazon.co.jp が発送",   // JP
    "ships from amazon",    // EN Alternative
    "sold by amazon",       // EN Alternative
    "配送: amazon",          // JP Alternative
    "由亚马逊配送"            // CN
];

// Standard-Einstellungen
let settings = {
    hideSponsored: true,
    hideFBM: true,
    strictPrime: false,
    viewMode: 'remove',
    enabled: true
};

// Einstellungen aus dem Storage laden
function loadSettings() {
    return new Promise((resolve) => {
        if (chrome.storage && chrome.storage.sync) {
            chrome.storage.sync.get(['hideSponsored', 'hideFBM', 'strictPrime', 'viewMode', 'enabled'], (result) => {
                settings = {
                    hideSponsored: result.hideSponsored !== undefined ? result.hideSponsored : true,
                    hideFBM: result.hideFBM !== undefined ? result.hideFBM : true,
                    strictPrime: result.strictPrime !== undefined ? result.strictPrime : false,
                    viewMode: result.viewMode || 'remove',
                    enabled: result.enabled !== undefined ? result.enabled : true
                };
                resolve(settings);
            });
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
            product.style.display = 'none';
            break;
        case 'dim':
            product.style.opacity = '0.3';
            product.style.transition = 'opacity 0.3s';
            break;
        case 'red-border':
            product.style.border = '3px solid #dc2626';
            product.style.borderRadius = '8px';
            product.style.opacity = '0.7';
            break;
    }
}

// Hauptfunktion zum Filtern der Produkte
function filterAmazonProducts() {
    // Wenn deaktiviert, nichts tun
    if (!settings.enabled) {
        return;
    }

    // Alle Produkt-Karten auf der Seite finden
    const products = document.querySelectorAll('div[data-component-type="s-search-result"]');

    products.forEach(product => {
        // Bereits verarbeitete Produkte überspringen
        if (product.dataset.fbaFinderProcessed === 'true') {
            return;
        }

        const productText = product.innerText.toLowerCase();

        // --- A. SPONSORED CHECK ---
        if (settings.hideSponsored) {
            const isSponsored = SPONSORED_TERMS.some(term => productText.includes(term));
            
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
            const hasFbaText = FBA_TERMS.some(term => productText.includes(term));

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
}

// Alle Produkte wieder anzeigen (wenn Addon deaktiviert wird)
function showAllProducts() {
    const products = document.querySelectorAll('div[data-component-type="s-search-result"]');
    products.forEach(product => {
        product.style.display = '';
        product.style.opacity = '';
        product.style.border = '';
        product.style.borderRadius = '';
        product.dataset.fbaFinderProcessed = 'false';
    });
}

// Produkte neu filtern (z.B. nach Einstellungsänderung)
function refilterProducts() {
    const products = document.querySelectorAll('div[data-component-type="s-search-result"]');
    products.forEach(product => {
        product.style.display = '';
        product.style.opacity = '';
        product.style.border = '';
        product.style.borderRadius = '';
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

// MutationObserver für Lazy-Loading
let observer = null;

function startObserver() {
    if (observer) {
        observer.disconnect();
    }

    observer = new MutationObserver((mutations) => {
        // Nur filtern, wenn tatsächlich Nodes hinzugefügt wurden
        const hasAddedNodes = mutations.some(mutation => mutation.addedNodes.length > 0);
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
                refilterProducts();
            } else {
                showAllProducts();
            }
        }
    });
}

// Initialisierung
async function init() {
    await loadSettings();
    
    if (settings.enabled) {
        filterAmazonProducts();
        startObserver();
    }
}

// Starten
init();
