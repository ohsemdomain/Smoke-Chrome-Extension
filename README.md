# Smoke Break Tracker (Chrome Extension)

This repo builds a Manifest V3 Chrome extension whose popup UI is a static-exported Next.js app.

## Edit the UI

- UI + logic: `src/app/page.tsx`
- Styling: `src/app/globals.css`
- Layout wrapper (fonts + extension popup sizing flag): `src/app/layout.tsx`

## Build + load in Chrome

1. Build the extension bundle: `npm run build:extension`
2. Chrome → `chrome://extensions` → enable **Developer mode** → **Load unpacked**
3. Select `extension/dist`
