# 📦 FBA Finder - Chrome Extension

> Filter Amazon search results to show only FBA products and hide sponsored listings.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Manifest](https://img.shields.io/badge/manifest-v3-green.svg)
![License](https://img.shields.io/badge/license-MIT-brightgreen.svg)

<img width="440" height="280" alt="chromeestorew2" src="https://github.com/user-attachments/assets/e98e7ff0-5a3e-4129-a43c-e94a45895917" />


---

## ✨ Features

- **🚫 Hide Sponsored Products** - Remove sponsored/advertisement listings from search results
- **📦 FBA-Only Filter** - Show only products fulfilled by Amazon (FBA), hide FBM products
- **🌍 Multi-Language Support** - Supports 15+ languages for accurate detection
- **🛒 23 Amazon Marketplaces** - Works on all major Amazon domains worldwide
- **👁️ Visual Feedback Modes** - Choose between remove, dim, or red-border display modes
- **🔢 Badge Counter** - See how many products were filtered at a glance
- **⚡ Live Updates** - Settings apply instantly without page reload
- **🎯 Strict Prime Mode** - Extra strict filtering for Prime products only

---

## 🛠️ Installation (Developer Mode)

### Prerequisites
- Google Chrome Browser (Version 88+)

### Steps

1. **Clone or download this repository**
   ```bash
   git clone https://github.com/your-username/fba-finder.git
   ```
   Or download and extract the ZIP file.

2. **Open Chrome Extensions page**
   - Navigate to `chrome://extensions` in your browser
   - Or go to Menu → More Tools → Extensions

3. **Enable Developer Mode**
   - Toggle the "Developer mode" switch in the top-right corner

4. **Load the extension**
   - Click "Load unpacked" button
   - Select the `fba-finder` folder (the one containing `manifest.json`)

5. **Done!** 🎉
   - The FBA Finder icon should appear in your browser toolbar
   - Pin it for easy access

---

## 📖 Usage

### Popup Interface
Click the FBA Finder icon in your toolbar to access quick controls:
- **Toggle filters on/off** with one click
- **View statistics** of filtered products on the current page
- **Access full settings** via the options link

### Settings (Options Page)
Right-click the extension icon → "Options" to configure:

| Setting | Description |
|---------|-------------|
| **Hide Sponsored** | Remove all sponsored product listings |
| **Hide Non-FBA** | Show only FBA (Fulfilled by Amazon) products |
| **View Mode** | `remove` (hide completely), `dim` (50% opacity), or `red-border` (visual marker) |
| **Strict Prime** | Extra strict filtering for Prime-eligible items only |
| **Show Indicator** | Display floating counter on the page |

### Filter Modes

| Mode | Effect |
|------|--------|
| **Remove** | Completely hides filtered products from view |
| **Dim** | Reduces opacity of filtered products to 50% |
| **Red Border** | Adds a red border around filtered products |

---

## 🌐 Supported Amazon Marketplaces

FBA Finder works on **23 Amazon domains**:

| Region | Domains |
|--------|---------|
| **Americas** | amazon.com, amazon.ca, amazon.com.mx, amazon.com.br |
| **Europe** | amazon.co.uk, amazon.de, amazon.fr, amazon.it, amazon.es, amazon.nl, amazon.pl, amazon.se, amazon.com.be |
| **Asia Pacific** | amazon.co.jp, amazon.in, amazon.com.au, amazon.sg, amazon.cn |
| **Middle East & Africa** | amazon.ae, amazon.sa, amazon.eg, amazon.com.tr, amazon.co.za |

---

## 📁 Project Structure

```
fba-finder/
├── manifest.json       # Extension manifest (Manifest V3)
├── background.js       # Service worker for badge updates
├── content.js          # Main filtering logic (injected into Amazon pages)
├── popup.html          # Popup UI when clicking extension icon
├── popup.js            # Popup functionality
├── options.html        # Settings/options page
├── options.js          # Options page functionality
├── icons/              # Extension icons (16x16, 48x48, 128x128)
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── README.md           # This file
```

### File Overview

| File | Purpose |
|------|---------|
| `manifest.json` | Defines extension permissions, scripts, and metadata |
| `background.js` | Service worker handling badge text and cross-script communication |
| `content.js` | Core filtering logic with MutationObserver for dynamic content |
| `popup.html/js` | Quick access popup with toggle and statistics |
| `options.html/js` | Full settings page with all configuration options |

---

## 🔧 Development

### Technologies Used
- **JavaScript** (ES6+)
- **HTML5** & **CSS3**
- **Chrome Extension APIs** (Manifest V3)
  - `chrome.storage.sync`
  - `chrome.action` (badge)
  - `chrome.runtime` (messaging)

### Key Concepts
- **MutationObserver** for detecting dynamically loaded products
- **Debounced filtering** for performance optimization
- **Cross-script messaging** between content script and service worker

### Code Style
This project uses [Prettier](https://prettier.io/) for code formatting:
```bash
npx prettier --write .
```

---

## 🔒 Privacy

FBA Finder:
- ✅ Does **NOT** collect any personal data
- ✅ Does **NOT** track your browsing activity
- ✅ Does **NOT** send data to external servers
- ✅ All settings are stored locally in your browser via `chrome.storage.sync`

---

## 📝 License

This project is licensed under the **MIT License**.

```
MIT License

Copyright (c) 2024 FBA Finder

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 🤝 Contributing

Contributions are welcome! Feel free to:
1. Fork the repository
2. Create a feature branch
3. Submit a pull request

---

## 📞 Support

If you encounter any issues or have suggestions:
- Open an issue on GitHub
- Check existing issues for solutions

---

Made with ❤️ for a better Amazon shopping experience
