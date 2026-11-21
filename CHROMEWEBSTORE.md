# Chrome Web Store Listing — Pinnit

> Last Updated: 2026-11-21

## Store Listing

**Extension Name** [REQUIRED]
Pinnit

**Short Description** [REQUIRED]
Locks your pinned tabs to their active domains. Opens external link navigations in new tabs automatically.

**Detailed Description** [REQUIRED]
Keep your pinned tabs permanently on the websites you pinned them for. Whenever you click an external link or enter a different website address inside a pinned tab, Pinnit automatically opens that destination in a new tab while keeping your pinned tab right where you left it.

FEATURES
• Automatic Domain Locking — Pinning any tab in Chrome immediately locks it to its active website domain with zero setup.
• Automatic New-Tab Redirection — External links clicked inside a pinned tab open cleanly in a new tab instead of overwriting your workspace.
• Seamless Same-Site Browsing — Navigate freely across pages within the locked website while Pinnit remembers your latest page.
• Per-Tab Strict Subdomain Control — Toggle STRICT mode per pinned tab in the toolbar popup to isolate exact domains or allow navigation across subdomains (such as docs.example.com and app.example.com).
• Quick Tab Switcher Popup — View all locked pinned tabs at a glance and click any entry to jump straight to that tab.
• 100% Local & Private — Operates completely offline on your device with no accounts, no analytics, and zero data collection.

HOW TO USE
1. Open any website you want to keep handy (such as your inbox, calendar, docs, or project board).
2. Right-click the tab and select "Pin". Pinnit locks the tab to that website's domain automatically.
3. Click any external link inside that pinned tab — the external site opens in a new tab while your pinned tab stays put.
4. Click the Pinnit icon in the Chrome toolbar anytime to inspect locked tabs or toggle STRICT subdomain mode per tab.
5. Unpin the tab whenever you want to remove its domain lock.

PRIVACY
Pinnit does not collect, store externally, or transmit any personal data or browsing history. All domain lock preferences stay strictly on your device and are automatically removed as soon as a tab is unpinned or closed.

PERMISSIONS EXPLAINED
• Access browser tabs and navigation activity — Needed to detect when a pinned tab starts navigating to a different website domain so Pinnit can open the external address in a new tab and keep your pinned tab on its locked page.
• Local extension storage — Needed to remember which tabs are locked and your per-tab STRICT subdomain settings across browser restarts.

SUPPORT
Found a bug or have a feature request? Email sk@sklise.com or open an issue at https://github.com/sklise/pinnit/issues

Version 1.0.0 — Initial release with automatic pinned-tab domain locking, new-tab external link redirection, and per-tab STRICT subdomain controls.

**Category** [REQUIRED]
Productivity

**Single Purpose** [REQUIRED]
Locks pinned tabs to their active domain and opens external link navigations in new tabs.

**Primary Language** [REQUIRED]
English

## Graphics & Assets

| Asset | Dimensions | Status | Filename |
|-------|-----------|--------|----------|
| Store Icon [REQUIRED] | 128×128 PNG | ✅ Ready | icons/icon-128.png |
| Screenshot 1 [REQUIRED] | 1280×800 PNG | ✅ Ready | store-assets/screenshot-1.png |
| Screenshot 2 [RECOMMENDED] | 1280×800 PNG | ✅ Ready | store-assets/screenshot-2.png |
| Small Promo Tile [RECOMMENDED] | 440×280 PNG | ✅ Ready | store-assets/promo-small.png |

### Screenshot Notes
- **Screenshot 1 (`store-assets/screenshot-1.png`)**: Demonstrates Pinnit protecting a pinned tab (`mail.acme.dev`) while opening a clicked external link (`external-journal.org`) in an adjacent new tab.
- **Screenshot 2 (`store-assets/screenshot-2.png`)**: Showcases the actual Swiss-style Pinnit toolbar popup UI displaying locked pinned tabs alongside both enabled and disabled `STRICT` subdomain toggles.
- **Small Promo Tile (`store-assets/promo-small.png`)**: High-contrast Swiss typographic promo tile featuring the Pinnit pushpin icon and concise value proposition.

## Permissions Justification

| Permission | Type | Justification |
|------------|------|---------------|
| `webNavigation` | permissions | Required to listen to top-level `onBeforeNavigate` events in pinned tabs so cross-domain navigations can be intercepted before replacing the pinned page and redirected to a new tab. |
| `tabs` | permissions | Required to query open pinned tabs, read pinned tab URLs/titles/favicons for domain matching and the popup dashboard, open external URLs in new tabs, and restore pinned tabs to their last allowed URL. `activeTab` cannot be used because Pinnit protects pinned tabs automatically in the background whenever links are clicked without requiring the user to click the toolbar icon first. |
| `storage` | permissions | Required to persist per-tab domain lock records (locked domain, last allowed recovery URL, and `STRICT` subdomain toggle state) locally in `chrome.storage.local` across service worker restarts. |
| *(None)* | host_permissions | Pinnit requests no `host_permissions` (`<all_urls>` is not needed) and injects no content scripts into web pages. |

## Privacy & Data Use

### Data Collection

**Does the extension collect user data?** No

*(Note for CWS Privacy Tab: Pinnit reads tab URLs strictly locally in memory/local storage to compare hostnames for pinned tabs and never transmits any data off the user's device. Leave all off-device data collection checkboxes unchecked and check all three certification boxes below.)*

### Data Use Certification
- [x] Data is NOT sold to third parties
- [x] Data is NOT used for purposes unrelated to the extension's core functionality
- [x] Data is NOT used for creditworthiness or lending purposes

## Privacy Policy

**Privacy Policy URL** [REQUIRED]
https://github.com/sklise/pinnit/blob/main/PRIVACY.md

*(Ensure `PRIVACY.md` is committed and pushed to the public `main` branch on GitHub before submitting the listing for review so the URL resolves publicly with HTTP 200.)*

## Distribution

**Visibility**: Public
**Regions**: All regions
**Pricing**: Free

## Developer Info

**Publisher Name** [REQUIRED]
Steve Klise

**Contact Email** [REQUIRED]
sk@sklise.com

**Support URL / Email** [RECOMMENDED]
https://github.com/sklise/pinnit/issues

**Homepage URL** [RECOMMENDED]
https://github.com/sklise/pinnit

## Version History

| Version | Date | Changes | Status |
|---------|------|---------|--------|
| 1.0.0 | 2026-11-21 | Initial Chrome Web Store release: automatic pinned-tab domain locking, external link redirection to new tabs, Swiss-style popup dashboard, and per-tab STRICT subdomain toggle. | Ready to Submit |

## Review Notes

### Known Issues / Limitations
- Interception targets top-level main-frame HTTP/HTTPS navigations (`frameId === 0`). Embedded `<iframe>` navigations that do not change the top-level tab URL are intentionally ignored.
- Internal browser pages (`chrome://`, `about:blank`) are not locked until the pinned tab navigates to its first HTTP/HTTPS website.
