# Chrome extension quickstart

These steps explain how to build and load the Chrome extension that ships in this repo.

## Prerequisites
- Node.js and npm installed locally
- Google Chrome with the Extensions page available at `chrome://extensions`

## Build the extension bundle
1. Install dependencies: `npm install`
2. Create a static export configured for extensions: `npm run build:extension`
   - The build writes a fully static site to `out/` and then copies it into `extension/dist/` alongside the manifest and icons.

## Load the unpacked extension in Chrome
1. Open `chrome://extensions`
2. Toggle **Developer mode** (top right)
3. Click **Load unpacked**
4. Choose the `extension/dist` directory created during the build
5. A **Smoke Break Tracker** card should appear; pin it to the toolbar to open the popup UI

## Making changes and reloading
- After code changes, run `npm run build:extension` again to refresh `extension/dist`
- Back in `chrome://extensions`, click the **Reload** icon on the Smoke Break Tracker card to pick up the new build
- Use the **Inspect views: service worker/popup** links on the card to open devtools for debugging

## Notes
- The extension uses Next.js static export, so features that require a Node.js server will not be available in the popup.
- Generated assets in `extension/dist` are ignored by git; rebuild locally whenever you need an updated bundle.
