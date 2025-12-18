# Smoke Break Tracker (Chrome Extension)

A lightweight **Chrome extension** (Manifest V3) that helps you **track smoke breaks / cigarette use** by logging events and showing a live **timer since your last finished smoke**—right from your browser toolbar.

If you’re trying to **reduce smoking**, build awareness, or simply track patterns, this extension keeps your logs **stored locally** and always accessible.

## Features

- **One-tap logging** for smoke breaks (timestamps)
- **Elapsed timer** since last finished smoke (assumes a 7‑minute smoke duration)
- **Daily count** (“Today” total)
- **Logs view**: browse, delete single entries, or delete all
- **Boxes / packs tracking**: log when you open a new box (brand + quantity), see last 30 days total, time since last, and average days per box

## Tech Stack

- **React** (popup UI)
- **Vite** (build tooling) + **TypeScript**
- **Tailwind CSS** (styling)
- **Chrome Extension Manifest V3**
- **chrome.storage.local** (with `localStorage` fallback via `src/lib/storage.ts`)
- Node build script: `scripts/build-extension.mjs`

## Privacy

- **No accounts, no sync, no analytics**
- Data is stored locally using `chrome.storage.local` (permission: `storage`) and a local fallback (`localStorage`)
- The extension UI runs entirely in the popup (no background scripts, no network calls in this repo)

## Install (Load Unpacked)

This repo is set up for local install via Chrome Developer Mode.

1. Install dependencies: `npm install`
2. Build the extension bundle: `npm run build:extension`
3. Open Chrome → `chrome://extensions`
4. Enable **Developer mode**
5. Click **Load unpacked**
6. Select `extension/dist`

## Supported Browsers

- Google Chrome / Chromium-based browsers that support Manifest V3 (e.g., Brave, Microsoft Edge)

## How To Use

- Open the extension from the Chrome toolbar
- Click **Log Smoke** to create a timestamped entry
- Use **Logs** to review or delete entries
- Use **Boxes** to log when you open a new box (brand + count) and view frequency stats

## Customize

- Assumed smoke duration (used for “time since last finished”): `src/screens/Home.tsx`

## Development

- Dev server (web): `npm run dev`
- Production build (writes popup UI to `extension/dist`): `npm run build`
- Full extension build (adds `manifest.json` + icons): `npm run build:extension`

Key files:
- Popup app router: `src/App.tsx`
- Smoke logging screen: `src/screens/Home.tsx`
- Smoke logs list: `src/screens/Logs.tsx`
- Box/packs tracking: `src/screens/Boxes.tsx`
- Storage wrapper: `src/lib/storage.ts`

## Contributing

Issues and PRs are welcome—especially around UX improvements, accessibility, and stats/insights that help people reduce smoking.

## FAQ

- Does it send my data anywhere? No—everything stays local in your browser profile.
- Is this medical advice? No. If you’re trying to quit smoking, consider seeking professional support.

## Keywords

Smoke break tracker, cigarette tracker, smoking habit tracker, quit smoking tracker, smoke timer, Chrome extension, Manifest V3.
