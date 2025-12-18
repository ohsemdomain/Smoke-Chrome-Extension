# Smoke Break Tracker 🚬

<p align="center">
  <img src="https://img.shields.io/badge/license-MIT-blue.svg" />
  <img src="https://img.shields.io/badge/platform-Chrome_Extension-green.svg" />
  <img src="https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?logo=tailwind-css&logoColor=white" />
</p>

<p align="center">
  <strong>A privacy-focused Chrome extension to track smoke breaks, build awareness, and reduce cigarette usage.</strong>
</p>

<p align="center">
  <em>Manifest V3 • Local-only storage • No tracking</em>
</p>

---

## 📌 Table of Contents

* [Features](#-features)
* [Privacy](#-privacy)
* [Installation](#-installation)
* [Tech Stack](#-tech-stack)
* [Development & Customization](#-development--customization)
* [Contributing](#-contributing)
* [Disclaimer](#-disclaimer)

---

## ✨ Features

### ⏱️ Smart Tracking

* **One-tap logging** with precise timestamps
* **Live timer** showing time since last finished smoke
  *(defaults to a 7-minute duration)*
* **Daily counters** for quick “Today” totals

### 📦 Inventory & Insights

* **Pack / box tracking** (brand + quantity)
* **Consumption statistics**:

  * Usage frequency
  * Average days per box
  * Totals for the last 30 days

### 🛡️ Data Management

* **Full history log**
* **Delete individual entries** or wipe everything
* **Offline-first** — no cloud dependencies

---

## 🔒 Privacy

**Your data stays on your device.**

* ❌ No accounts or logins
* ❌ No analytics
* ❌ No external network requests

All data is stored locally using:

```ts
chrome.storage.local
```

---

## 🚀 Installation

This project is intended for **local installation via Chrome Developer Mode**.

### 1️⃣ Build the Extension

```bash
npm install
npm run build:extension
```

This generates a production-ready build in:

```
extension/dist
```

### 2️⃣ Load into Chrome

1. Open `chrome://extensions`
2. Enable **Developer mode** (top-right)
3. Click **Load unpacked**
4. Select the `extension/dist` directory

---

## 🛠️ Tech Stack

* **Framework**: React + TypeScript
* **Styling**: Tailwind CSS
* **Build Tool**: Vite
* **Platform**: Chrome Extension (Manifest V3)
* **Storage**: `chrome.storage.local`
  *(with `localStorage` fallback during development)*

---

## 💻 Development & Customization

Want to tweak smoke duration, UI, or stats?

### Useful Commands

```bash
npm run dev              # UI development in browser
npm run build            # Production popup build
npm run build:extension  # Full extension build (manifest + icons)
```

### Key Files

* **Timer logic**: `src/screens/Home.tsx`
* **Logs view**: `src/screens/Logs.tsx`
* **Box statistics**: `src/screens/Boxes.tsx`
* **Storage layer**: `src/lib/storage.ts`

---

## 🤝 Contributing

Contributions are welcome 🙌
Especially helpful areas:

* 🎨 UX / UI improvements
* ♿ Accessibility enhancements
* 📈 Better insights & visualizations

Feel free to open an **Issue** or **Pull Request**.

---

## ⚠️ Disclaimer

*This tool is for informational and habit-tracking purposes only.*
*It is **not medical advice**. If you are trying to quit smoking, consider seeking professional medical support.*

---

**Keywords:** smoke break tracker, cigarette counter, habit tracker, quit smoking, quantified self, chrome extension, manifest v3