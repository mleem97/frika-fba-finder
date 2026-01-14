# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.0] - 2026-01-14

### Added

- Core filtering functionality for sponsored products and FBM (Fulfilled by Merchant) listings
- Multi-language support with 15+ languages for sponsored and FBA term detection
- Support for 23 Amazon marketplaces worldwide
- Settings page with intuitive toggles for all filter options
- Popup interface with quick controls and real-time statistics
- Badge counter on extension icon showing filtered product count
- Floating indicator on Amazon pages for filter status visibility
- Visual feedback modes: remove, dim, or red-border for filtered products
- Strict Prime mode for enhanced filtering
- Live settings synchronization across browser sessions
- MutationObserver for lazy-loading content support
- Debounce optimization for improved performance

### Security

- CSP (Content Security Policy) compliant implementation
- No inline scripts used
- No unsafe eval() or innerHTML usage
- Manifest V3 compliance with modern security standards
