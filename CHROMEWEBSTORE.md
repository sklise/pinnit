# Chrome Web Store Listing — Pinnit

> Last Updated: 2026-06-05

## Store Listing

**Extension Name** [REQUIRED]
Pinnit

**Short Description** [REQUIRED]
Locks your pinned tabs to their active domains. Opens external link navigations in new tabs automatically.

**Detailed Description** [REQUIRED]
Pinnit is a lightweight, performant productivity utility that automatically restricts your pinned tabs to their active domains. When you pin a tab, Pinnit locks it. If you attempt to navigate to a different domain (by clicking an external link or typing a new URL in the address bar), Pinnit intercepts it, opens the new page in a new tab, and returns the original pinned tab to its last allowed page.

Pinnit operates entirely locally and uses Chrome's native webNavigation and session storage, ensuring maximum performance, battery saving, and absolute privacy.

To use Pinnit:
1. Load a website in a tab (e.g. Hacker News).
2. Pin the tab. Pinnit immediately locks it to that domain.
3. Clicking external links or attempting to navigate elsewhere in this tab will cause the link to open in a new tab, while the pinned tab remains on Hacker News.
4. Navigating within the same domain is allowed, and Pinnit automatically updates the tab's return point.
5. To disable the restriction, simply unpin the tab.

**Category** [REQUIRED]
Productivity

**Single Purpose** [REQUIRED]
Locks pinned tabs to their current domain and opens external link navigations in new tabs.

**Primary Language** [REQUIRED]
English

## Graphics & Assets

| Asset | Dimensions | Status | Filename |
|-------|-----------|--------|----------|
| Store Icon [REQUIRED] | 128×128 PNG | ✅ Ready | icons/icon-128.png |
| Screenshot 1 [REQUIRED] | 1280×800 or 640×400 | ⬜ Not created | |
| Screenshot 2 [RECOMMENDED] | 1280×800 or 640×400 | ⬜ Not created | |
| Small Promo Tile [RECOMMENDED] | 440×280 | ⬜ Not created | |

### Screenshot Notes
- **Screenshot 1**: Showing a pinned tab on a website (e.g. Hacker News) and a new tab opening on a different domain after clicking an external link.
- **Screenshot 2**: Showing the custom Pinnit extension popup UI listing currently locked tabs and their respective domains.

## Permissions Justification

| Permission | Type | Justification |
|------------|------|---------------|
| `webNavigation` | permissions | Used to detect when a pinned tab is initiating a navigation, allowing the extension to intercept it before it commits. |
| `tabs` | permissions | Used to query active pinned tabs and inspect their URL to extract base domains, open target URLs in new tabs, and return pinned tabs to their last allowed URLs. |
| `storage` | permissions | Used to persist lock metadata (domain and last allowed URL) for active pinned tabs in `chrome.storage.session` for the duration of the browser session. |

## Privacy & Data Use

### Data Collection

**Does the extension collect user data?** No

### Data Use Certification
- [x] Data is NOT sold to third parties
- [x] Data is NOT used for purposes unrelated to the extension's core functionality
- [x] Data is NOT used for creditworthiness or lending purposes

## Distribution

**Visibility**: Public
**Regions**: All regions
**Pricing**: Free

## Developer Info

**Publisher Name** [REQUIRED]
Pinnit Developer

**Contact Email** [REQUIRED]
developer@example.com

**Support URL / Email** [RECOMMENDED]
https://github.com/example/pinnit/issues

## Version History

| Version | Date | Changes | Status |
|---------|------|---------|--------|
| 1.0.0 | 2026-06-05 | Initial release with webNavigation interception, session storage locking, and popup dashboard. | Draft |

## Review Notes

### Known Issues / Limitations
- Navigation interception works for all main frame top-level navigations. Frame/iframe internal navigations are not blocked.
