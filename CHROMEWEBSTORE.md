# Chrome Web Store Listing — Pinnit

> Last Updated: 2026-06-05

## Store Listing

**Extension Name** [REQUIRED]
Pinnit

**Short Description** [REQUIRED]
Locks your pinned tabs to their active domains to prevent accidental navigations away from your workspace.

**Detailed Description** [REQUIRED]
Pinnit is a lightweight, performant productivity utility that automatically restricts your pinned tabs to their active domains. When you pin a tab, Pinnit locks it. If you click a link pointing to a different domain, or type a new address in the search bar, the navigation is blocked in that tab. 

Pinnit operates entirely locally and uses Chrome's native declarativeNetRequest engine, ensuring maximum performance, battery saving, and absolute privacy. 

To use Pinnit:
1. Load a website in a tab (e.g. GitHub).
2. Pin the tab. Pinnit immediately locks it to that domain.
3. Clicking external links or attempting to navigate elsewhere will be blocked.
4. To allow navigations, simply unpin the tab.

**Category** [REQUIRED]
Productivity

**Single Purpose** [REQUIRED]
Locks pinned tabs to their current domain to prevent accidental navigations.

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
- **Screenshot 1**: Showing a pinned tab on a website (e.g. GitHub) attempting to navigate to an external link, showing Chrome's clean block page.
- **Screenshot 2**: Showing the custom Pinnit extension popup UI listing currently locked tabs and their respective domains.

## Permissions Justification

| Permission | Type | Justification |
|------------|------|---------------|
| `declarativeNetRequest` | permissions | Used to register session-scoped rules that block top-level frame navigations on specific pinned tab IDs if they attempt to change domains. |
| `tabs` | permissions | Used to query active pinned tabs and inspect their URL to extract the base domain name for rule synchronization. |

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
| 1.0.0 | 2026-06-05 | Initial release with automatic domain locking, sync logic, and popup dashboard. | Draft |

## Review Notes

### Known Issues / Limitations
- DNR rules block navigations at the request level, meaning Chrome's default error page ("This page has been blocked by an extension") is displayed when navigation is intercepted.
