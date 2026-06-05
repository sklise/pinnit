/**
 * Helper to extract domain from a URL, stripping 'www.'
 */
function extractDomain(urlStr) {
  try {
    if (!urlStr) return '';
    const url = new URL(urlStr);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return '';
    let host = url.hostname.toLowerCase();
    if (host.startsWith('www.')) {
      host = host.substring(4);
    }
    return host;
  } catch (e) {
    return '';
  }
}

/**
 * Synchronizes local storage locks with actual pinned tabs in Chrome.
 */
async function syncLocks() {
  if (!chrome.storage || !chrome.storage.local) {
    console.warn('[Pinnit] chrome.storage.local is not available. Please reload the extension.');
    return;
  }
  try {
    const pinnedTabs = await chrome.tabs.query({ pinned: true });
    const storage = await chrome.storage.local.get(null);
    
    const pinnedTabIds = new Set(pinnedTabs.map(t => t.id));
    const activeLockKeys = Object.keys(storage).filter(key => key.startsWith('tab-'));

    // 1. Clean up stale locks for tabs that are no longer pinned or no longer exist
    for (const key of activeLockKeys) {
      const tabId = parseInt(key.substring(4), 10);
      const tab = pinnedTabs.find(t => t.id === tabId);
      if (!tab) {
        await chrome.storage.local.remove(key);
        console.log(`[Pinnit] Cleaned up stale lock for tab ${tabId}`);
      }
    }

    // 2. Initialize locks for pinned tabs that don't have them yet
    for (const tab of pinnedTabs) {
      const domain = extractDomain(tab.url);
      if (!domain) continue;

      const key = `tab-${tab.id}`;
      if (!storage[key]) {
        await chrome.storage.local.set({
          [key]: {
            domain: domain,
            url: tab.url
          }
        });
        console.log(`[Pinnit] Initialized lock for tab ${tab.id} on domain: ${domain}`);
      }
    }
  } catch (error) {
    console.error('[Pinnit] Error synchronizing locks:', error);
  }
}

// Intercept navigation events before they start loading
chrome.webNavigation.onBeforeNavigate.addListener(async (details) => {
  // Only target the main/top-level frame
  if (details.frameId !== 0) return;
  if (!chrome.storage || !chrome.storage.local) return;

  const tabId = details.tabId;
  const key = `tab-${tabId}`;

  try {
    const storageData = await chrome.storage.local.get(key);
    const lock = storageData[key];

    if (lock) {
      const targetDomain = extractDomain(details.url);
      if (!targetDomain) return; // Ignore non-web URLs (chrome://, file://, etc.)

      const blockSubdomains = lock.blockSubdomains !== false;
      // Check if the destination domain is different (and not a subdomain of the locked domain, if allowed)
      const isAllowed = (targetDomain === lock.domain) || (!blockSubdomains && targetDomain.endsWith('.' + lock.domain));

      if (!isAllowed) {
        console.log(`[Pinnit] Domain change detected in tab ${tabId}: ${lock.domain} -> ${targetDomain}. Redirecting to new tab.`);

        // 1. Create a new tab with the target URL
        await chrome.tabs.create({
          url: details.url,
          active: true
        });

        // 2. Cancel original navigation by redirecting the pinned tab back to its last allowed URL
        await chrome.tabs.update(tabId, { url: lock.url });
      }
    }
  } catch (error) {
    console.error('[Pinnit] Error handling navigation interception:', error);
  }
});

// Watch for tab status and updates
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (!chrome.storage || !chrome.storage.local) return;
  try {
    const key = `tab-${tabId}`;
    
    // Handle changes to the pinned state
    if ('pinned' in changeInfo) {
      if (changeInfo.pinned) {
        // Tab was just pinned
        const domain = extractDomain(tab.url);
        if (domain) {
          await chrome.storage.local.set({
            [key]: { domain, url: tab.url }
          });
          console.log(`[Pinnit] Tab ${tabId} pinned. Locked to domain: ${domain}`);
        }
      } else {
        // Tab was just unpinned
        await chrome.storage.local.remove(key);
        console.log(`[Pinnit] Tab ${tabId} unpinned. Removed domain lock.`);
      }
      return;
    }

    // Handle URL changes inside a pinned tab
    if ('url' in changeInfo && tab.pinned) {
      const storageData = await chrome.storage.local.get(key);
      const lock = storageData[key];

      const newDomain = extractDomain(changeInfo.url);
      if (!newDomain) return;

      if (!lock) {
        // Pinned tab was on a blank/internal page, now navigating to its first web page
        await chrome.storage.local.set({
          [key]: { domain: newDomain, url: changeInfo.url }
        });
        console.log(`[Pinnit] Locked pinned tab ${tabId} to initial domain: ${newDomain}`);
      } else {
        // Tab already has a lock. Check if the URL change is within the same domain (or a subdomain, if allowed)
        const blockSubdomains = lock.blockSubdomains !== false;
        const isSameDomain = (newDomain === lock.domain) || (!blockSubdomains && newDomain.endsWith('.' + lock.domain));
        if (isSameDomain) {
          // Update the allowed recovery URL so returning to the tab restores this exact subpage
          await chrome.storage.local.set({
            [key]: {
              domain: lock.domain,
              url: changeInfo.url,
              blockSubdomains: blockSubdomains
            }
          });
        }
      }
    }
  } catch (error) {
    console.error('[Pinnit] Error handling tab update:', error);
  }
});

// Clean up locks when tabs are closed
chrome.tabs.onRemoved.addListener(async (tabId) => {
  if (!chrome.storage || !chrome.storage.local) return;
  try {
    await chrome.storage.local.remove(`tab-${tabId}`);
  } catch (error) {
    console.error('[Pinnit] Error handling tab removal:', error);
  }
});

// Synchronize locks on startup and installation
chrome.runtime.onInstalled.addListener(syncLocks);
chrome.runtime.onStartup.addListener(syncLocks);

// Run sync immediately on background startup to catch currently open pinned tabs
syncLocks();
