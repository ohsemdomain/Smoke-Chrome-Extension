# Smoke Break Tracker (Chrome Extension)

A lightweight **Chrome extension** (Manifest V3) to **track smoke breaks / cigarette use** by logging events and showing a live **timer since your last finished smoke**—right from your browser toolbar.

Built for habit awareness: quick logging, simple stats, and **local-only storage**.

<p>
  <img alt="Chrome Extension Manifest V3" src="https://img.shields.io/badge/Chrome_Extension-Manifest_V3-4285F4" />
  <img alt="React" src="https://img.shields.io/badge/React-UI-61DAFB?logo=react&logoColor=000" />
  <img alt="Vite" src="https://img.shields.io/badge/Vite-Build-646CFF?logo=vite&logoColor=fff" />
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-Code-3178C6?logo=typescript&logoColor=fff" />
  <img alt="Tailwind CSS" src="https://img.shields.io/badge/Tailwind-CSS-38B2AC?logo=tailwindcss&logoColor=fff" />
</p>

## Table of Contents

- [Features](#features)
- [Privacy](#privacy)
- [Install (Load Unpacked)](#install-load-unpacked)
- [Supported Browsers](#supported-browsers)
- [Tech Stack](#tech-stack)
- [Development](#development)
- [Customization](#customization)
- [Contributing](#contributing)
- [Disclaimer](#disclaimer)
- [Keywords](#keywords)

## Features

- **One-tap smoke logging** (timestamped)
- **Live elapsed timer** since last finished smoke (assumes a 7‑minute smoke duration)
- **Daily “Today” count**
- **Logs screen**: review entries, delete individual entries, or delete all
- **Boxes tracking**: log when you open a new box (brand + quantity), see last 30 days total, time since last, and average days per box
- **Offline-first**: the extension UI runs in the popup

## Privacy

- **No accounts, no sync, no analytics**
- The extension itself makes **no network requests**
- Data is stored locally via `chrome.storage.local` (permission: `storage`) with a `localStorage` fallback when Chrome storage isn’t available

## Install (Load Unpacked)

1. Install dependencies: `npm install`
2. Build the extension bundle: `npm run build:extension`
3. Open Chrome → `chrome://extensions`
4. Enable **Developer mode**
5. Click **Load unpacked**
6. Select `extension/dist`

## Supported Browsers

- Google Chrome and other Chromium-based browsers that support Manifest V3 (e.g., Brave, Microsoft Edge)

## Tech Stack

- **React** (popup UI)
- **Vite** (build tooling) + **TypeScript**
- **Tailwind CSS** (styling)
- **Chrome Extension Manifest V3**
- Storage: `chrome.storage.local` (+ `localStorage` fallback via `src/lib/storage.ts`)

## Development

- Dev server (web UI): `npm run dev`
- Build popup UI only (writes to `extension/dist`, does not include `manifest.json`): `npm run build`
- Full extension build (popup UI + `manifest.json` + icons): `npm run build:extension`

Key files:
- Popup app router: `src/App.tsx`
- Smoke logging screen: `src/screens/Home.tsx`
- Smoke logs list: `src/screens/Logs.tsx`
- Boxes tracking: `src/screens/Boxes.tsx`
- Storage wrapper: `src/lib/storage.ts`

## Customization

- Assumed smoke duration (used for “time since last finished”): `src/screens/Home.tsx`
- Optional: add `extension/manifest.json` (and `extension/icons/icon16.png`, `icon48.png`, `icon128.png`) to override the generated manifest/icons used by `scripts/build-extension.mjs`

## Contributing

Issues and PRs are welcome—especially around UX improvements, accessibility, and stats/insights that help people reduce smoking.

## Disclaimer

This tool is for informational and habit-tracking purposes only and is not medical advice. If you’re trying to quit smoking, consider seeking professional support.

## Keywords

Smoke break tracker, cigarette tracker, smoking habit tracker, quit smoking tracker, smoke timer, Chrome extension, Manifest V3.
