# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.0] - 2026-01-14

### Added

#### Core Features
- **Amazon Product Filtering:**
  - Filter sponsored/promoted products (gesponserte Anzeigen)
  - Filter FBM products (non-FBA, seller-fulfilled items)
  - Show only FBA (Fulfilled by Amazon) products
  - Strict Prime mode (only Prime-eligible products)

#### Multi-Language & Marketplace Support
- **15+ Languages:** German, English, French, Spanish, Italian, Portuguese, Dutch, Polish, Swedish, Turkish, Japanese, Chinese, Arabic, Hindi
- **23 Amazon Marketplaces:**
  - Europe: .de, .co.uk, .fr, .es, .it, .nl, .pl, .se, .be, .tr
  - Americas: .com (US), .ca, .com.mx, .com.br
  - Asia-Pacific: .co.jp, .in, .cn, .com.au, .sg
  - Middle East/Africa: .ae, .sa, .eg, .co.za

#### User Interface
- **Settings Page (options.html):**
  - Toggle for sponsored products filtering
  - Toggle for FBM filtering
  - Visual display mode selector (remove/dim/red-border)
  - Strict Prime mode toggle
  - Modern Amazon-themed design (#232F3E dark blue, #FF9900 orange)

- **Popup Interface (popup.html):**
  - Quick ON/OFF toggle for entire extension
  - Real-time statistics (total filtered, breakdown by type)
  - Quick filter toggles (sponsored, FBM)
  - Link to full settings page
  - Compact 300px design

- **On-Page Indicators:**
  - Badge on extension icon showing filtered count
  - Floating indicator on Amazon pages (dismissible)
  - Visual feedback for active filtering

#### Display Modes
- **Remove:** Completely hide filtered products (default)
- **Dim:** Show products with 30% opacity
- **Red Border:** Mark products with red border and 70% opacity

#### Technical Features
- **Performance Optimizations:**
  - MutationObserver for dynamic content (infinite scroll, pagination)
  - Debounced filtering (100ms) to prevent performance issues
  - Efficient DOM queries with data attributes caching
  
- **Live Settings Sync:**
  - Changes apply instantly without page reload
  - Settings sync across Chrome browsers via chrome.storage.sync
  - Local statistics storage via chrome.storage.local

- **Manifest V3 Architecture:**
  - Service Worker background script (background.js)
  - Content script with isolated execution (content.js)
  - Separate popup and options pages with external JS files

### Security

- **CSP (Content Security Policy) Compliant:**
  - No inline scripts in HTML files
  - All JavaScript in separate .js files
  - No inline event handlers (addEventListener only)
  
- **No Unsafe Code:**
  - No eval() usage
  - No innerHTML (textContent and DOM manipulation only)
  - No new Function() dynamic code generation
  - No external script loading

- **Privacy by Design:**
  - No data collection or tracking
  - No external API calls
  - No analytics or telemetry
  - Settings stored locally only (chrome.storage)

- **Minimal Permissions:**
  - `storage` - For saving user preferences
  - Amazon domain host permissions - Only to filter products
  - No broad permissions like `<all_urls>`

### Development

- **Code Quality:**
  - Prettier formatted with consistent style
  - Semantic git commits (Conventional Commits)
  - Comprehensive documentation (README.md, PRIVACY.md, STORE_LISTING.md)

- **Build & Release:**
  - Automated GitHub Actions workflow for ZIP creation
  - SHA256 checksums for release integrity
  - Chrome Web Store ready package structure

### Documentation

- README.md with installation and usage instructions
- PRIVACY.md with GDPR-compliant privacy policy (German & English)
- STORE_LISTING.md with Chrome Web Store content (German & English)
- CHANGELOG.md following Keep a Changelog format
- Inline code documentation

---

## Developer Notes

**Version:** 1.0.0  
**Release Date:** January 14, 2026  
**Manifest Version:** 3  
**Minimum Chrome Version:** 88+ (for Manifest V3 support)

**Repository:** https://github.com/mleem97/frika-fba-finder  
**License:** MIT  
**Developer:** Meyer Media
