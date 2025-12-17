# Firebase Studio

This is a NextJS starter in Firebase Studio.

To get started, take a look at src/app/page.tsx.

## Chrome extension build

Refer to [the full Chrome extension guide](docs/chrome-extension.md) for screenshots and troubleshooting tips. The quick steps are:

1. Install dependencies with `npm install`.
2. Create a static build configured for Chrome extensions: `npm run build:extension`.
3. In Chrome, open **chrome://extensions**, enable **Developer mode**, and choose **Load unpacked**.
4. Select the `extension/dist` directory to load the Smoke Break Tracker as the toolbar popup.

## Push changes to your GitHub fork without the "Create PR" button

If the GitHub UI won’t let you click **Create PR**, follow the terminal-based checklist in [docs/push-to-github.md](docs/push-to-github.md) to push your branch and open a pull request via the CLI or a direct compare URL. The guide also covers fixing web upload errors like `Binary files are not supported`.
