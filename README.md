# FBA Finder – Smart Shopping Filter

A local, privacy-first browser extension that repairs Amazon FBA filtering and improves search-result UX across major marketplaces.

## Supported marketplaces

| Marketplace | Sponsored results | Inserted recommendations | Exact duplicate grouping | Price + shipping | Special handling |
| --- | --- | --- | --- | --- | --- |
| Amazon | Yes | Optional | Optional | Yes | FBA, FBM, unknown fulfillment, and Prime are separate signals |
| AliExpress | Yes | Yes | Yes | Yes | Resilient link fallback for frequently changing card classes |
| Alibaba | Yes | Yes | Yes | Yes | Minimum order quantity is included in comparable total cost |
| Temu | Yes | Yes | Yes | Yes | Stable attributes plus product-link fallback |
| SHEIN | Yes | Yes | Yes | Yes | Fashion-card variants and localized domains |
| DHgate | Yes | Yes | Yes | Yes | Marketplace card and product-link fallbacks |
| Banggood | Yes | Yes | Yes | Yes | Product-list and direct-link fallbacks |
| eBay | Yes | Yes | Yes | Yes | Item price and shipping cost are evaluated together |

## Core behavior

- Removes sponsored results using visible labels and marketplace-specific metadata.
- Optionally removes recommendation cards inserted into otherwise sorted results.
- Groups only high-confidence title matches. Model numbers, sizes, wattages, and other numeric tokens must match.
- Keeps the lowest known total cost: item price × minimum order quantity + shipping.
- Requires known shipping by default before hiding a duplicate. This can be relaxed in settings.
- Can optionally reorder currently loaded cards by their detected total price.
- Re-runs after infinite scrolling, lazy rendering, and single-page navigation changes.
- Restores every card without a reload when a filter or marketplace is disabled.
- Opens a local “What’s new” tab once after an extension update.
- Uses the browser’s light/dark preference; no user-theme or page-theme probing.

## Amazon fix

The previous release depended on one Amazon selector and treated Prime as evidence of FBA. Version 2.0 uses multiple result-card strategies and keeps these concepts separate:

- `FBA`: explicit “shipped/fulfilled by Amazon” evidence.
- `FBM`: explicit seller-fulfilled evidence.
- `Unknown`: the search card does not expose a fulfillment signal.
- `Prime`: an optional independent eligibility filter.

Amazon does not expose fulfillment on every search card. The default “hide unknown fulfillment” setting is intentionally strict and can be disabled.

## Build and test

Requires Node.js 20+ and the system `zip` command. No npm dependencies are required.

```bash
npm test
npm run validate
npm run package
```

Generated packages:

- `artifacts/fba-finder-2.0.0-chromium.zip`
- `artifacts/fba-finder-2.0.0-firefox.zip`

## Install an unpacked development build

### Chromium, Chrome, Edge, Brave, Vivaldi

1. Run `npm run build`.
2. Open the browser's extensions page.
3. Enable developer mode.
4. Choose **Load unpacked**.
5. Select `dist/chromium`.

### Firefox

1. Run `npm run build`.
2. Open `about:debugging#/runtime/this-firefox`.
3. Choose **Load Temporary Add-on**.
4. Select `dist/firefox/manifest.json`.

The Firefox package uses Manifest V3 event scripts, a fixed Gecko extension ID, and the required no-data-collection declaration. The Chromium package uses a Manifest V3 service worker.

## Privacy and permissions

The extension has no telemetry, analytics, external API, remote code, or account system. Search-result text is processed only in the active page and is never transmitted or persisted. The sole API permission is `storage`; host access is limited to the supported marketplace domains declared by the content script.

See [PRIVACY.md](PRIVACY.md) for details.

## Known limits

Marketplace HTML is not a public API and can change without notice. The adapter design deliberately combines stable attributes, semantic links, and class fallbacks, but site changes may still require selector updates. Price comparisons are skipped when a trustworthy total cannot be calculated under the selected settings.

## License

MIT © Meyer Media
