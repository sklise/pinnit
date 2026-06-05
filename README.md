# Pinnit

**Pinnit** is a Chrome extension that locks your pinned tabs to their active domains. It intercepts navigation events that attempt to change the domain of a pinned tab:
1. **Intercepts Navigations**: Intercepts the top-level main frame navigation event before it loads.
2. **Redirects to New Tab**: Opens the target URL in a new tab.
3. **Restores Original Pinned Tab**: Aborts the navigation in the original pinned tab and returns it to its last allowed URL, preventing domain changes.

## How It Works

Pinnit uses Manifest V3 best practices and standard Chrome extension APIs:
1. **Dynamic Detection**: A background service worker (`background.js`) tracks the pinned states and active URLs of tabs, storing state locks securely in `chrome.storage.session`.
2. **Navigation Interception**: It listens to `chrome.webNavigation.onBeforeNavigate` events.
3. **Domain Comparison**: If a pinned tab initiates a top-level navigation, the target domain is compared against the locked domain.
4. **Action**: If they do not match, it opens a new tab with the target URL and restores the pinned tab to its last allowed URL.
5. **No Overhead**: Navigations within the same domain (or its subdomains) are allowed, and the allowed URL in session storage updates automatically to track your current subpage.

## Project Structure

```
pinnit/
├── manifest.json        # Extension MV3 configuration (permissions: webNavigation, tabs, storage)
├── background.js       # Background service worker (Interception, tracking & redirection)
├── popup/               # Extension popup UI
│   ├── popup.html       # Popup structure
│   ├── popup.css        # Premium dark glassmorphic styling
│   └── popup.js         # Dynamic tab rendering (retrieved from storage.session)
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

Once loaded, pin any tab with an active web page (e.g. `https://news.ycombinator.com/`) and try to click an external link or type a different address. You will see a new tab open with the link, while the pinned tab stays on Hacker News!
