# Privacy Policy for Pinnit

> Last Updated: 2026-11-21

Pinnit ("we", "our", or "the extension") is a Chrome browser extension designed to keep pinned tabs locked to their active domains. Your browsing activity stays strictly on your device.

## Summary

- Pinnit does **not** collect, transmit, rent, or sell any personal data, user identifiers, or browsing history.
- All navigation checks and tab lock preferences run locally inside your browser.
- Pinnit uses no remote servers, external APIs, tracking pixels, cookies, or third-party analytics.

## Information Processed Locally on Your Device

To fulfill its single purpose—preventing pinned tabs from navigating away from their locked domains—Pinnit reads and stores the following state locally in your browser:

1. **Pinned Tab URLs & Domains**: When a tab is pinned, Pinnit reads the hostname (domain) and URL of that tab so it can establish a domain lock and restore the allowed page if an external link is clicked. When a top-level navigation begins in a pinned tab, Pinnit compares the destination hostname against the locked domain locally.
2. **Pinned State**: Pinnit checks whether tabs are pinned or unpinned to enable or remove domain locks automatically.
3. **Subdomain Preference (`STRICT` Mode)**: When you toggle `STRICT` mode for a pinned tab in the popup, that boolean preference is saved locally alongside the tab's lock entry.

## How Data Is Stored

All lock state (locked domain, last allowed recovery URL, and subdomain toggle preference) is stored exclusively on your device using Chrome's local extension storage (`chrome.storage.local` and ephemeral `chrome.storage.session`).

- **No Off-Device Transmission**: Zero data is transmitted to developer servers or third parties.
- **No Cloud Sync**: Pinnit does not use `chrome.storage.sync`; lock state remains inside your local browser profile.

## Data Retention and Deletion

- **Unpinning a Tab**: Immediately deletes that tab's domain lock from local storage.
- **Closing a Tab**: Immediately deletes that tab's domain lock and session state.
- **Uninstalling Pinnit**: Permanently erases all local extension storage managed by Chrome.

## Third-Party Services

This extension does not integrate any third-party services, SDKs, remote fonts, external CDNs, advertising networks, or analytics tools.

## Chrome Web Store Limited Use Disclosure

Pinnit complies with the Chrome Web Store Developer Program Policies, including the User Data Privacy and Limited Use policies:

- User data is **not** sold to third parties.
- User data is **not** used or transferred for purposes unrelated to the extension's single purpose.
- User data is **not** used or transferred to determine creditworthiness or for lending purposes.

## Changes to This Policy

If Pinnit's privacy practices ever change, this policy will be updated in the project repository with a revised "Last Updated" date prior to releasing the corresponding extension update.

## Contact

If you have questions or concerns about this Privacy Policy, please reach out:

- **Developer**: Steve Klise
- **Email**: [sk@sklise.com](mailto:sk@sklise.com)
- **Support & Issues**: [https://github.com/sklise/pinnit/issues](https://github.com/sklise/pinnit/issues)
