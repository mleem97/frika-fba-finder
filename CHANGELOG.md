# Changelog

All notable changes to this project are documented here. The project follows Semantic Versioning.

## [Unreleased]

## [2.0.0] - 2026-08-15

### Added

- Marketplace adapters for AliExpress, Alibaba, Temu, SHEIN, DHgate, Banggood, and eBay.
- Per-marketplace controls for filtering, sponsored results, inserted recommendations, duplicate grouping, and client-side total-price sorting.
- High-confidence duplicate detection that preserves distinct model numbers and product sizes.
- Cheapest-offer selection using item price, shipping, and Alibaba minimum order quantity.
- Configurable similarity threshold and shipping-confidence requirement.
- Browser-native responsive light and dark UI.
- A local “What’s new” tab shown once after an update.
- Separate reproducible Chromium and Firefox Manifest V3 builds.
- Firefox extension ID and explicit no-data-collection declaration.
- Dependency-free Node.js tests, manifest validation, and packaging scripts.

### Fixed

- Replaced the single outdated Amazon result selector with layered card and product-link discovery.
- Stopped treating Prime eligibility as proof of FBA fulfillment.
- Added explicit FBA, FBM, and unknown-fulfillment states.
- Made filtering reversible without a page reload.
- Improved support for lazy-loaded and dynamically updated result cards.

### Changed

- Renamed the product to “FBA Finder – Smart Shopping Filter” while retaining the FBA Finder short name.
- Version and UI metadata now come from the runtime manifest.
- Counters now include sponsored, recommended, duplicate, FBM, and unknown results.

## [1.0.0] - 2026-01-14

- Initial Chrome Manifest V3 release for Amazon search-result filtering.
