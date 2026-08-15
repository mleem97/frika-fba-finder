const test = require('node:test');
const assert = require('node:assert/strict');
const detector = require('../detector.js');

function node(text = '', attributes = {}) {
  return {
    nodeType: 1,
    innerText: text,
    textContent: text,
    getAttribute(name) { return attributes[name] ?? null; },
  };
}

function card({ text = '', selectorText = {}, present = [], attributes = {} } = {}) {
  const element = node(text, attributes);
  element.querySelector = (selector) => {
    if (selectorText[selector] != null) return node(selectorText[selector]);
    if (present.some((marker) => selector.includes(marker))) return node('marker');
    return null;
  };
  element.querySelectorAll = (selector) => {
    const value = selectorText[selector];
    return value != null ? [node(value)] : [];
  };
  element.matches = (selector) => present.some((marker) => selector.includes(marker));
  element.closest = () => element;
  element.contains = () => false;
  return element;
}

test('recognizes all supported marketplace hosts', () => {
  const cases = {
    'www.amazon.de': 'amazon', 'www.amazon.co.jp': 'amazon', 'de.aliexpress.com': 'aliexpress',
    'www.alibaba.com': 'alibaba', 'www.temu.com': 'temu',
    'de.shein.com': 'shein', 'www.dhgate.com': 'dhgate',
    'www.banggood.com': 'banggood', 'www.ebay.de': 'ebay', 'www.ebay.com.au': 'ebay',
  };
  for (const [hostname, expected] of Object.entries(cases)) {
    assert.equal(detector.getPlatform(hostname), expected);
  }
});

test('parses German and international money formats', () => {
  assert.deepEqual(detector.parseMoney('12,99 €'), { amount: 12.99, currency: 'EUR', displayText: '12,99 €' });
  assert.deepEqual(detector.parseMoney('US$ 1,299.50'), { amount: 1299.5, currency: 'USD', displayText: 'US$ 1,299.50' });
  assert.deepEqual(detector.parseMoney('1.249,00 EUR'), { amount: 1249, currency: 'EUR', displayText: '1.249,00 EUR' });
  assert.deepEqual(detector.parseMoney('9,99 € statt 19,99 €'), { amount: 9.99, currency: 'EUR', displayText: '9,99 € statt 19,99 €' });
});

test('keeps model and size numbers significant for duplicate detection', () => {
  const left = { title: 'USB C Ladegerät 65W GaN 2 Port EU', normalizedTitle: detector.normalizeTitle('USB C Ladegerät 65W GaN 2 Port EU'), currency: 'EUR' };
  const same = { title: '65W GaN USB-C Ladegerät mit 2 Port EU', normalizedTitle: detector.normalizeTitle('65W GaN USB-C Ladegerät mit 2 Port EU'), currency: 'EUR' };
  const different = { title: 'USB C Ladegerät 100W GaN 3 Port EU', normalizedTitle: detector.normalizeTitle('USB C Ladegerät 100W GaN 3 Port EU'), currency: 'EUR' };
  assert.equal(detector.areDuplicates(left, same, 0.75), true);
  assert.equal(detector.areDuplicates(left, different, 0.75), false);
});

test('does not mistake Prime for Amazon fulfillment', () => {
  const product = card({ text: 'Prime – Versand durch den Verkäufer', present: ['prime'] });
  const facts = detector.inspectProduct(product, 'amazon');
  assert.equal(facts.prime, true);
  assert.equal(facts.fulfillment, 'fbm');
});

test('detects sponsored eBay result from visible localized label', () => {
  const product = card({
    text: 'Gesponsert – USB C Kabel',
    selectorText: { '.s-item__title': 'USB C Kabel', '.s-item__price': '9,99 €', '.s-item__shipping': 'Kostenloser Versand' },
  });
  const facts = detector.inspectProduct(product, 'ebay');
  assert.equal(facts.sponsored, true);
  assert.equal(facts.total, 9.99);
});

test('uses Alibaba minimum order quantity in total price', () => {
  const product = card({
    text: 'USB Hub MOQ 5',
    selectorText: {
      '[class*="product-title"]': 'USB Hub 7 Port Aluminium',
      '[class*="price" i]': 'US$10.00',
      '[class*="shipping" i]': 'Shipping US$5.00',
      '[class*="moq" i]': 'MOQ 5',
    },
  });
  const facts = detector.inspectProduct(product, 'alibaba');
  assert.equal(facts.minimumOrder, 5);
  assert.equal(facts.total, 55);
});

test('finds a fallback AliExpress product link when wrapper classes change', () => {
  const product = card({ present: ['/item/'] });
  const root = { querySelectorAll(selector) { return selector === 'a[href*="/item/"]' ? [product] : []; } };
  assert.deepEqual(detector.findProductCards(root, 'aliexpress'), [product]);
});
