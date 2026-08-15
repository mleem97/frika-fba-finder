(function detectorModule(globalScope) {
  'use strict';

  const SPONSORED_TERMS = [
    'gesponsert', 'sponsored', 'sponsorisé', 'sponsorisée', 'sponsorizzato',
    'patrocinado', 'sponsrad', 'gesponsord', 'sponsorowane', 'sponsorlu',
    'スポンサー', '広告', 'إعلان', 'برعاية', '赞助', '广告', 'प्रायोजित',
  ];
  const RECOMMENDED_TERMS = [
    'für dich empfohlen', 'empfohlen für dich', 'ähnliche artikel', 'das könnte dir gefallen',
    'recommended for you', 'you may also like', 'similar items', 'related products',
  ];
  const FBA_TERMS = [
    'versand durch amazon', 'versand von amazon', 'versendet von amazon',
    'verkauf und versand durch amazon', 'ships from amazon', 'dispatched from amazon',
    'fulfilled by amazon', 'expédié par amazon', 'spedito da amazon',
    'gestionado por amazon', 'enviado por amazon', 'enviado pela amazon',
    'wysyłka przez amazon', 'verzonden door amazon', 'amazon tarafından gönderilir',
    'skickas från amazon', 'amazon.co.jp が発送', 'amazonが発送', '配送: amazon', '由亚马逊配送',
  ];
  const FBM_TERMS = [
    'versand durch verkäufer', 'versand durch den verkäufer', 'versendet durch den verkäufer',
    'ships from the seller', 'dispatched from seller', 'seller fulfilled',
    'expédié par le vendeur', 'spedito dal venditore', 'enviado por el vendedor',
    'enviado pelo vendedor', 'wysyłka przez sprzedawcę', 'verzonden door de verkoper',
  ];
  const FREE_SHIPPING_TERMS = [
    'kostenloser versand', 'gratis versand', 'versandkostenfrei', 'free shipping',
    'livraison gratuite', 'spedizione gratuita', 'envío gratis', 'frete grátis',
  ];
  const TITLE_STOP_WORDS = new Set([
    'der', 'die', 'das', 'den', 'dem', 'ein', 'eine', 'einer', 'eines', 'und', 'oder', 'für', 'mit',
    'the', 'and', 'for', 'with', 'from', 'new', 'neu', 'original', 'official', 'sale', 'angebot',
    'hot', '2024', '2025', '2026', 'free', 'shipping', 'versand', 'choice',
  ]);

  const COMMON_PRICE_SELECTORS = [
    '[data-testid*="price" i]', '[class*="sale-price" i]', '[class*="current-price" i]',
    '[class*="price-current" i]', '[class*="price" i]', '[itemprop="price"]',
  ];
  const COMMON_SHIPPING_SELECTORS = [
    '[data-testid*="shipping" i]', '[class*="shipping" i]', '[class*="delivery" i]',
    '[class*="logistics" i]',
  ];

  const PLATFORMS = {
    amazon: {
      label: 'Amazon',
      host: /(^|\.)amazon\.(ae|ca|cn|co\.jp|co\.uk|com|com\.au|com\.be|com\.br|com\.mx|com\.tr|de|eg|es|fr|in|it|nl|pl|sa|se|sg|co\.za)$/i,
      cardSelectors: [
        '[data-component-type="s-search-result"]', '[data-testid="product-grid-item"]',
        '.s-result-item[data-asin]', '[role="listitem"][data-asin]', 'li.a-carousel-card',
        '[data-asin][data-index]',
      ],
      ancestor: '[data-component-type="s-search-result"], [data-testid="product-grid-item"], .s-result-item[data-asin], [role="listitem"][data-asin], li.a-carousel-card, .puis-card-container',
      productLinks: ['a[href*="/dp/"]', 'a[href*="/gp/product/"]'],
      titleSelectors: ['h2', '[data-cy="title-recipe"]', 'a[href*="/dp/"] h2', 'img[alt]'],
      priceSelectors: ['.a-price:not(.a-text-price) .a-offscreen', '.a-price:not(.a-text-price)', ...COMMON_PRICE_SELECTORS],
      shippingSelectors: ['[data-cy="delivery-recipe"]', ...COMMON_SHIPPING_SELECTORS],
      sponsoredSelectors: ['.puis-sponsored-label-text', '.s-sponsored-label-text', '[data-component-type*="sponsored" i]', '[data-csa-c-content-id*="sponsored" i]', 'a[href*="/gp/slredirect/"]'],
      recommendedSelectors: ['[data-component-type*="recommend" i]'],
    },
    aliexpress: {
      label: 'AliExpress', host: /(^|\.)aliexpress\.(com|de)$/i,
      cardSelectors: ['.search-item-card-wrapper-gallery', '[class*="multi--outWrapper"]', '[data-product-id]', '[data-item-id]'],
      ancestor: '.search-item-card-wrapper-gallery, [class*="multi--outWrapper"], [data-product-id], [data-item-id]',
      productLinks: ['a[href*="/item/"]'],
      titleSelectors: ['[class*="titleText"]', 'h1', 'h2', 'h3', 'a[href*="/item/"][title]', 'img[alt]'],
      priceSelectors: ['[class*="price--current"]', '[class*="price-sale"]', ...COMMON_PRICE_SELECTORS],
      shippingSelectors: COMMON_SHIPPING_SELECTORS,
      sponsoredSelectors: ['[class*="sponsor" i]', '[data-spm*="sponsor" i]'],
      // AliExpress uses "recommend" in broad tracking metadata, including on
      // ordinary search cards. Only trust explicit recommendation semantics.
      recommendedSelectors: ['[aria-label*="recommended" i]', '[title*="recommended" i]'],
    },
    alibaba: {
      label: 'Alibaba', host: /(^|\.)alibaba\.com$/i,
      cardSelectors: [
        '.m-gallery-product-item-v2', '.organic-gallery-offer-inner', '.J-offer-wrapper',
        '[class*="gallery-offer"]', '[class*="search-card"]', '[class*="product-card"]',
      ],
      ancestor: '.m-gallery-product-item-v2, .organic-gallery-offer-inner, .J-offer-wrapper, [class*="gallery-offer"], [class*="search-card"], [class*="product-card"]',
      productLinks: ['a[href*="/product-detail/"]', 'a[href*="/p-detail/"]'],
      titleSelectors: ['[class*="product-title"]', '[class*="offer-title"]', 'h2', 'h3', 'a[class*="title"]', 'img[alt]'],
      priceSelectors: ['[class*="price" i]', '[class*="moq" i]', ...COMMON_PRICE_SELECTORS],
      shippingSelectors: COMMON_SHIPPING_SELECTORS,
      sponsoredSelectors: ['[class*="sponsor" i]', '[data-spm*="sponsor" i]', '[class*="ad-badge" i]'],
      recommendedSelectors: ['[class*="recommend" i]', '[data-spm*="recommend" i]'],
    },
    temu: {
      label: 'Temu', host: /(^|\.)temu\.com$/i,
      cardSelectors: ['[data-testid="search-result-card"]', '[data-testid="goods-card"]', '[data-goods-id]', '[data-product-id]'],
      ancestor: '[data-testid="search-result-card"], [data-testid="goods-card"], [data-goods-id], [data-product-id]',
      productLinks: ['a[href*="/goods.html"]'],
      titleSelectors: ['[data-testid="goods-card-title"]', '[data-testid="search-result-title"]', '[class*="title" i]', 'img[alt]'],
      priceSelectors: ['[data-testid="goods-card-price"]', '[data-testid="search-result-price"]', ...COMMON_PRICE_SELECTORS],
      shippingSelectors: COMMON_SHIPPING_SELECTORS,
      sponsoredSelectors: ['[data-testid*="sponsor" i]', '[class*="sponsor" i]', '[aria-label*="sponsored" i]'],
      recommendedSelectors: ['[data-testid*="recommend" i]', '[class*="recommend" i]'],
    },
    shein: {
      label: 'SHEIN', host: /(^|\.)shein\.(com|de)$/i,
      cardSelectors: ['[data-testid="productCard"]', '.S-product-item', '.product-card', '.goods-item', '[data-goods-id]'],
      ancestor: '[data-testid="productCard"], .S-product-item, .product-card, .goods-item, [data-goods-id]',
      productLinks: ['a[href*="-p-"][href*=".html"]', 'a[href*="/product/"]'],
      titleSelectors: ['[data-testid="productTitle"]', '.S-product-item__title', '.product-title', '.goods-title', 'h2', 'h3', 'img[alt]'],
      priceSelectors: ['.S-product-item__price', '.goods-price', ...COMMON_PRICE_SELECTORS],
      shippingSelectors: COMMON_SHIPPING_SELECTORS,
      sponsoredSelectors: ['[class*="sponsor" i]', '[data-testid*="sponsor" i]'],
      recommendedSelectors: ['[class*="recommend" i]', '[data-testid*="recommend" i]'],
    },
    dhgate: {
      label: 'DHgate', host: /(^|\.)dhgate\.com$/i,
      cardSelectors: ['.gallery-list-item', '.product-list-item', '[data-product-id]', '[data-itemcode]'],
      ancestor: '.gallery-list-item, .product-list-item, [data-product-id], [data-itemcode]',
      productLinks: ['a[href*="/product/"]'],
      titleSelectors: ['[class*="title" i]', 'h2', 'h3', 'a[title]', 'img[alt]'],
      priceSelectors: COMMON_PRICE_SELECTORS, shippingSelectors: COMMON_SHIPPING_SELECTORS,
      sponsoredSelectors: ['[class*="sponsor" i]', '[class*="ad-badge" i]'],
      recommendedSelectors: ['[class*="recommend" i]'],
    },
    banggood: {
      label: 'Banggood', host: /(^|\.)banggood\.(com|in)$/i,
      cardSelectors: ['.goodlist_1 li', '.product-item', '[data-product-id]', '[data-goods-id]'],
      ancestor: '.goodlist_1 li, .product-item, [data-product-id], [data-goods-id]',
      productLinks: ['a[href*="-p-"][href*=".html"]'],
      titleSelectors: ['[class*="title" i]', 'h2', 'h3', 'a[title]', 'img[alt]'],
      priceSelectors: COMMON_PRICE_SELECTORS, shippingSelectors: COMMON_SHIPPING_SELECTORS,
      sponsoredSelectors: ['[class*="sponsor" i]', '[class*="ad-badge" i]'],
      recommendedSelectors: ['[class*="recommend" i]'],
    },
    ebay: {
      label: 'eBay', host: /(^|\.)ebay\.(de|com|co\.uk|fr|it|es|nl|pl|ca|com\.au)$/i,
      cardSelectors: ['li.s-item', '.s-item[data-view]', '[data-testid="item-card"]'],
      ancestor: 'li.s-item, .s-item[data-view], [data-testid="item-card"]',
      productLinks: ['a.s-item__link[href*="/itm/"]', 'a[href*="/itm/"]'],
      titleSelectors: ['.s-item__title', 'h3.s-item__title', '[data-testid="item-title"]', 'img[alt]'],
      priceSelectors: ['.s-item__price', '[data-testid="item-price"]', ...COMMON_PRICE_SELECTORS],
      shippingSelectors: ['.s-item__shipping', '.s-item__logisticsCost', '[data-testid="shipping-cost"]', ...COMMON_SHIPPING_SELECTORS],
      sponsoredSelectors: ['.s-item__sponsored-label-text', '[data-testid*="sponsor" i]'],
      recommendedSelectors: ['[class*="recommend" i]', '[data-testid*="recommend" i]'],
    },
  };

  function normalizeText(value) {
    return String(value || '').normalize('NFKC').replace(/[\u200B-\u200D\uFEFF]/g, '')
      .replace(/\s+/g, ' ').trim().toLocaleLowerCase();
  }
  function safeQuery(element, selector) {
    try { return element?.querySelector?.(selector) || null; } catch (_error) { return null; }
  }
  function safeQueryAll(element, selector) {
    try { return Array.from(element?.querySelectorAll?.(selector) || []); } catch (_error) { return []; }
  }
  function includesAny(text, terms) {
    const value = normalizeText(text);
    return terms.some((term) => value.includes(term));
  }
  function elementText(element) {
    return normalizeText(element?.innerText || element?.textContent || '');
  }
  function getPlatform(hostname = globalScope.location?.hostname || '') {
    return Object.entries(PLATFORMS).find(([, platform]) => platform.host.test(hostname))?.[0] || null;
  }
  function readText(card, selectors) {
    for (const selector of selectors) {
      const node = safeQuery(card, selector);
      const value = node?.getAttribute?.('title') || node?.getAttribute?.('alt') || node?.innerText || node?.textContent;
      if (normalizeText(value).length > 2) return String(value).trim();
    }
    return '';
  }
  function parseNumber(raw) {
    let value = String(raw).replace(/\s/g, '');
    const comma = value.lastIndexOf(',');
    const dot = value.lastIndexOf('.');
    const decimal = comma > dot ? ',' : '.';
    const parts = value.split(decimal);
    if (parts.length > 1 && parts.at(-1).length <= 2) {
      value = `${parts.slice(0, -1).join('').replace(/[.,]/g, '')}.${parts.at(-1)}`;
    } else value = value.replace(/[.,]/g, '');
    const number = Number.parseFloat(value);
    return Number.isFinite(number) ? number : null;
  }
  function parseMoney(text) {
    const value = String(text || '');
    const currency = /€|\bEUR\b/i.test(value) ? 'EUR' : /£|\bGBP\b/i.test(value) ? 'GBP' : /\$|\bUSD\b|\bUS\$/i.test(value) ? 'USD' : null;
    const match = value.match(/(?:(?:\d{1,3}(?:[.\s,]\d{3})+)|\d+)(?:[.,]\d{1,2})?/);
    const amount = match ? parseNumber(match[0]) : null;
    return amount != null && amount >= 0 ? { amount, currency, displayText: value.trim() } : null;
  }
  function extractShipping(card, platform) {
    let text = readText(card, platform.shippingSelectors);
    const fullText = elementText(card);
    if (!text && includesAny(fullText, FREE_SHIPPING_TERMS)) text = fullText;
    if (!text) {
      const shippingPattern = /(?:versand|shipping|delivery|livraison|spedizione|envío|frete)[^€$£\d]{0,24}(?:€|\$|£|eur|usd|gbp)?\s*\d[\d.,]*/i;
      const reversePattern = /(?:€|\$|£|eur|usd|gbp)\s*\d[\d.,]*[^\p{L}]{0,10}(?:versand|shipping|delivery|livraison|spedizione|envío|frete)/iu;
      text = fullText.match(shippingPattern)?.[0] || fullText.match(reversePattern)?.[0] || '';
    }
    if (!text) return { known: false, amount: null, currency: null };
    if (includesAny(text, FREE_SHIPPING_TERMS)) return { known: true, amount: 0, currency: null };
    const money = parseMoney(text);
    return money ? { known: true, ...money } : { known: false, amount: null, currency: null };
  }
  function extractPrice(card, platform) {
    const text = readText(card, platform.priceSelectors);
    return parseMoney(text);
  }
  function extractMinimumOrder(card, platformId) {
    if (platformId !== 'alibaba') return 1;
    const moqText = readText(card, ['[class*="moq" i]', '[class*="min-order" i]', '[class*="minimum" i]']);
    const source = moqText || elementText(card);
    const match = source.match(/(?:min(?:imum)?\.?\s*order|moq|≥)\s*:?\s*(\d+)/i)
      || source.match(/(\d+)\s*(?:pieces?|pcs?|stücke?)?\s*\(?\s*min(?:imum)?\.?\s*order/i);
    const amount = match ? Number.parseInt(match[1], 10) : 1;
    return Number.isFinite(amount) && amount > 0 ? amount : 1;
  }
  function canonicalCard(match, platform) {
    return match?.closest?.(platform.ancestor) || match;
  }
  function isProductCard(card, platform) {
    return Boolean(card && platform.productLinks.some((selector) => safeQuery(card, selector) || card.matches?.(selector)));
  }
  function findProductCards(root, platformId = getPlatform()) {
    const platform = PLATFORMS[platformId];
    if (!platform) return [];
    const seen = new Set();
    const cards = [];
    [...platform.cardSelectors, ...platform.productLinks].forEach((selector) => {
      safeQueryAll(root, selector).forEach((match) => {
        const card = canonicalCard(match, platform);
        if (card && !seen.has(card) && isProductCard(card, platform)) {
          seen.add(card); cards.push(card);
        }
      });
    });
    return cards.filter((card) => !cards.some((other) => other !== card && card.contains?.(other)));
  }
  function markerMatch(card, selectors, terms) {
    if (selectors.some((selector) => safeQuery(card, selector) || card.matches?.(selector))) return true;
    return safeQueryAll(card, '[aria-label], [title]').some((node) => includesAny(
      `${node.getAttribute?.('aria-label') || ''} ${node.getAttribute?.('title') || ''}`, terms
    ));
  }
  function inspectProduct(card, platformId = getPlatform()) {
    const platform = PLATFORMS[platformId];
    const title = readText(card, platform.titleSelectors);
    const price = extractPrice(card, platform);
    const shipping = extractShipping(card, platform);
    const minimumOrder = extractMinimumOrder(card, platformId);
    const total = price && shipping.known && (!shipping.currency || !price.currency || shipping.currency === price.currency)
      ? (price.amount * minimumOrder) + shipping.amount : null;
    const text = elementText(card);
    const facts = {
      platformId, title, normalizedTitle: normalizeTitle(title), sponsored: markerMatch(card, platform.sponsoredSelectors, SPONSORED_TERMS) || includesAny(elementText(card), SPONSORED_TERMS),
      recommended: markerMatch(card, platform.recommendedSelectors, RECOMMENDED_TERMS), price, shipping, minimumOrder, total,
      currency: price?.currency || shipping.currency || null, fulfillment: null, prime: false,
    };
    if (platformId === 'amazon') {
      facts.prime = Boolean(safeQuery(card, '.a-icon-prime, i[class*="prime" i], img[alt*="prime" i], [aria-label*="prime" i]'));
      facts.fulfillment = includesAny(text, FBA_TERMS) ? 'fba' : includesAny(text, FBM_TERMS) ? 'fbm' : 'unknown';
    }
    return facts;
  }
  function normalizeTitle(title) {
    return normalizeText(title).replace(/[^\p{L}\p{N}]+/gu, ' ').split(' ')
      .filter((token) => token.length > 1 && !TITLE_STOP_WORDS.has(token)).join(' ');
  }
  function titleSimilarity(left, right) {
    const a = new Set(normalizeTitle(left).split(' ').filter(Boolean));
    const b = new Set(normalizeTitle(right).split(' ').filter(Boolean));
    if (a.size < 3 || b.size < 3) return 0;
    const numericA = [...a].filter((token) => /\d/.test(token)).sort().join('|');
    const numericB = [...b].filter((token) => /\d/.test(token)).sort().join('|');
    if (numericA !== numericB) return 0;
    const intersection = [...a].filter((token) => b.has(token)).length;
    return intersection / Math.max(a.size, b.size);
  }
  function areDuplicates(left, right, threshold = 0.9) {
    if (!left.title || !right.title || left.currency !== right.currency) return false;
    return left.normalizedTitle === right.normalizedTitle || titleSimilarity(left.title, right.title) >= threshold;
  }
  function classifyProduct(facts, settings, platformSettings) {
    if (platformSettings.hideSponsored && facts.sponsored) return 'sponsored';
    if (platformSettings.hideRecommended && facts.recommended) return 'recommended';
    if (facts.platformId === 'amazon') {
      if (settings.hideFBM && facts.fulfillment === 'fbm') return 'fbm';
      if (settings.hideFBM && settings.hideUnknown && facts.fulfillment === 'unknown') return 'unknown';
      if (settings.strictPrime && !facts.prime) return 'noPrime';
    }
    return null;
  }
  function signatureFor(card, settings) {
    const raw = `${elementText(card)}|${JSON.stringify(settings)}`;
    let hash = 2166136261;
    for (let index = 0; index < raw.length; index += 1) { hash ^= raw.charCodeAt(index); hash = Math.imul(hash, 16777619); }
    return (hash >>> 0).toString(36);
  }

  const api = {
    PLATFORMS, SPONSORED_TERMS, FBA_TERMS, FBM_TERMS, normalizeText, normalizeTitle,
    parseMoney, getPlatform, findProductCards, inspectProduct, titleSimilarity, areDuplicates,
    classifyProduct, signatureFor,
  };
  globalScope.ShopFilterDetector = api;
  globalScope.FbaFinderDetector = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
