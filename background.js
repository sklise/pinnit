/**
 * Extracts the normalized hostname from an HTTP/HTTPS URL, stripping a leading 'www.'.
 * Returns an empty string for non-web URLs (chrome://, about:, file://, etc.).
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
  } catch {
    return '';
  }
}

/**
 * Checks whether targetDomain is permitted under lockedDomain and strictness mode.
 */
function isDomainAllowed(targetDomain, lockedDomain, blockSubdomains) {
  if (!targetDomain || !lockedDomain) return false;
  return (
    targetDomain === lockedDomain ||
    (!blockSubdomains && targetDomain.endsWith('.' + lockedDomain))
  );
}

/**
 * Computes a safe recovery URL guaranteed to satisfy the current domain lock,
 * preventing redirect loops if STRICT mode was toggled while on a subdomain.
 */
function getSafeRecoveryUrl(lock, blockSubdomains) {
  const savedDomain = extractDomain(lock.url);
  if (savedDomain && isDomainAllowed(savedDomain, lock.domain, blockSubdomains)) {
    return lock.url;
  }
  return `https://${lock.domain}/`;
}

/**
 * Synchronizes local storage locks with currently open pinned tabs.
 */
async function syncLocks() {
  if (!chrome.storage?.local) return;

  try {
    const pinnedTabs = await chrome.tabs.query({ pinned: true });
    const storage = await chrome.storage.local.get(null);

    const pinnedTabIds = new Set(pinnedTabs.map((t) => t.id));
    const activeLockKeys = Object.keys(storage).filter((key) => key.startsWith('tab-'));

    // 1. Clean up stale locks for tabs that are no longer pinned or no longer exist
    const staleKeys = activeLockKeys.filter((key) => {
      const tabId = parseInt(key.substring(4), 10);
      return !pinnedTabIds.has(tabId);
    });
    if (staleKeys.length > 0) {
      await chrome.storage.local.remove(staleKeys);
    }

    // 2. Initialize locks for pinned web tabs that don't have a domain lock yet
    for (const tab of pinnedTabs) {
      const domain = extractDomain(tab.url);
      if (!domain) continue;

      const key = `tab-${tab.id}`;
      const existing = storage[key];
      if (!existing || !existing.domain) {
        await chrome.storage.local.set({
          [key]: {
            domain,
            url: tab.url,
            blockSubdomains: existing?.blockSubdomains !== false
          }
        });
      }
    }
  } catch (error) {
    console.error('[Pinnit] Error synchronizing locks:', error);
  }
}

// Intercept top-level navigation events before they start loading
chrome.webNavigation.onBeforeNavigate.addListener(async (details) => {
  if (details.frameId !== 0) return;
  if (!chrome.storage?.local) return;

  const tabId = details.tabId;
  const key = `tab-${tabId}`;

  try {
    const storageData = await chrome.storage.local.get(key);
    const lock = storageData[key];
    if (!lock || !lock.domain) return;

    const targetDomain = extractDomain(details.url);
    if (!targetDomain) return;

    const blockSubdomains = lock.blockSubdomains !== false;
    if (isDomainAllowed(targetDomain, lock.domain, blockSubdomains)) return;

    const recoveryUrl = getSafeRecoveryUrl(lock, blockSubdomains);
    if (details.url === recoveryUrl) return;

    // Guard against duplicate external tabs from rapid double-clicks or redirect bursts
    const sessionKey = `redirect-${tabId}`;
    let skipCreate = false;
    if (chrome.storage.session) {
      const sessionData = await chrome.storage.session.get(sessionKey);
      const lastRedirect = sessionData[sessionKey];
      if (
        lastRedirect &&
        lastRedirect.url === details.url &&
        Date.now() - lastRedirect.time < 500
      ) {
        skipCreate = true;
      } else {
        await chrome.storage.session.set({
          [sessionKey]: { url: details.url, time: Date.now() }
        });
      }
    }

    if (recoveryUrl !== lock.url) {
      await chrome.storage.local.set({
        [key]: { ...lock, url: recoveryUrl, blockSubdomains }
      });
    }

    if (!skipCreate) {
      await chrome.tabs.create({
        url: details.url,
        active: true
      });
    }

    await chrome.tabs.update(tabId, { url: recoveryUrl });
  } catch (error) {
    console.error('[Pinnit] Error handling navigation interception:', error);
  }
});

// Watch for tab pin/unpin events and allowed in-domain URL updates
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (!chrome.storage?.local) return;

  try {
    const key = `tab-${tabId}`;

    if ('pinned' in changeInfo) {
      if (changeInfo.pinned) {
        const domain = extractDomain(tab.url);
        if (domain) {
          const existing = (await chrome.storage.local.get(key))[key];
          await chrome.storage.local.set({
            [key]: {
              domain,
              url: tab.url,
              blockSubdomains: existing?.blockSubdomains !== false
            }
          });
        }
      } else {
        await chrome.storage.local.remove(key);
      }
      return;
    }

    if ('url' in changeInfo && tab.pinned) {
      const newDomain = extractDomain(changeInfo.url);
      if (!newDomain) return;

      const storageData = await chrome.storage.local.get(key);
      const lock = storageData[key];

      if (!lock || !lock.domain) {
        await chrome.storage.local.set({
          [key]: {
            domain: newDomain,
            url: changeInfo.url,
            blockSubdomains: lock?.blockSubdomains !== false
          }
        });
      } else {
        const blockSubdomains = lock.blockSubdomains !== false;
        if (isDomainAllowed(newDomain, lock.domain, blockSubdomains)) {
          await chrome.storage.local.set({
            [key]: {
              domain: lock.domain,
              url: changeInfo.url,
              blockSubdomains
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
  if (!chrome.storage?.local) return;
  try {
    await chrome.storage.local.remove(`tab-${tabId}`);
    if (chrome.storage.session) {
      await chrome.storage.session.remove(`redirect-${tabId}`);
    }
  } catch (error) {
    console.error('[Pinnit] Error handling tab removal:', error);
  }
});

// Synchronize locks on startup and installation
chrome.runtime.onInstalled.addListener(syncLocks);
chrome.runtime.onStartup.addListener(syncLocks);

// Run sync immediately on service worker startup to catch open pinned tabs
syncLocks();
