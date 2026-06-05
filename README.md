# Pinnit

**Pinnit** is a Chrome extension that locks your pinned tabs to their active domains. It prevents accidental top-level navigation to other domains (such as clicking external links or typing a new URL in the address bar), keeping your workspace clean and organized.

## How It Works

Pinnit uses Manifest V3 best practices and the native Chrome **`declarativeNetRequest`** API:
1. **Dynamic Detection**: A background service worker (`background.js`) listens for when a tab is pinned or navigated.
2. **Domain Extraction**: It extracts the domain (e.g. `github.com` from `https://github.com/google/pinnit`) and strips `www.` to accommodate subdomains.
3. **Session-Scoped Blocking**: It registers a session-scoped rule inside Chrome's network interception engine to block all `main_frame` navigation requests originating from that specific tab ID that do not match the locked domain.
4. **Lifecycle Synchronization**: When the tab is unpinned or closed, the blocking rule is immediately cleaned up.
5. **No Overhead**: Because Chrome's native engine handles the blocking declaratively, there is zero JavaScript execution overhead per network request.

## Project Structure

```
pinnit/
├── manifest.json        # Extension MV3 configuration & permissions
├── background.js       # Background service worker (Rule synchronization logic)
├── popup/               # Extension popup UI
│   ├── popup.html       # Popup structure
│   ├── popup.css        # Premium dark glassmorphic styling
│   └── popup.js         # Dynamic tab rendering & interaction logic
└── icons/               # Generated PNG icons
    ├── icon-16.png
    ├── icon-48.png
    └── icon-128.png
```

## Installation (Unpacked Development)

To load and test the extension locally:
1. Open Google Chrome.
2. Navigate to `chrome://extensions/`.
3. Enable **Developer mode** using the toggle switch in the top right corner.
4. Click the **Load unpacked** button in the top left.
5. Select the `/Users/sklise/Projects/pinnit` directory.

Once loaded, pin any tab with an active web page (e.g. `https://news.ycombinator.com/`) and try to click an external link or type a different address. The navigation will be blocked, and the extension badge will show the blocked request count!
