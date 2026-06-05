// Service Worker state to lock concurrent sync operations and prevent race conditions
let isSyncing = false;
let pendingSync = false;

/**
 * Synchronizes the declarativeNetRequest session rules with the currently pinned tabs.
 */
async function syncRules() {
  if (isSyncing) {
    pendingSync = true;
    return;
  }
  isSyncing = true;

  try {
    const pinnedTabs = await chrome.tabs.query({ pinned: true });
    const currentRules = await chrome.declarativeNetRequest.getSessionRules();

    const rulesToRemove = [];
    const rulesToAdd = [];

    const pinnedTabIds = new Set(pinnedTabs.map(t => t.id));

    // 1. Identify rules to remove: rules whose corresponding tab is no longer pinned,
    // or does not have a web URL (HTTP/HTTPS) anymore.
    for (const rule of currentRules) {
      const tab = pinnedTabs.find(t => t.id === rule.id);
      if (!tab) {
        rulesToRemove.push(rule.id);
      } else {
        const url = tab.url || '';
        if (!url.startsWith('http:') && !url.startsWith('https:')) {
          rulesToRemove.push(rule.id);
        }
      }
    }

    // 2. Identify rules to add or update: pinned tabs with HTTP/HTTPS URLs.
    for (const tab of pinnedTabs) {
      const url = tab.url || '';
      if (!url.startsWith('http:') && !url.startsWith('https:')) {
        continue;
      }

      let currentDomain = '';
      try {
        currentDomain = new URL(url).hostname;
        if (currentDomain.startsWith('www.')) {
          currentDomain = currentDomain.substring(4);
        }
      } catch (e) {
        console.error('[Pinnit] Failed to parse tab URL:', url, e);
        continue;
      }

      if (!currentDomain) continue;

      const existingRule = currentRules.find(r => r.id === tab.id);
      if (!existingRule) {
        rulesToAdd.push({
          id: tab.id,
          priority: 1,
          action: { type: 'block' },
          condition: {
            tabIds: [tab.id],
            resourceTypes: ['main_frame'],
            excludedRequestDomains: [currentDomain]
          }
        });
      } else {
        const ruleDomain = existingRule.condition.excludedRequestDomains[0];
        // If the current tab domain has changed, and it is NOT a subdomain of the existing rule domain,
        // we update the rule (meaning the tab was somehow navigated or reassigned).
        if (currentDomain !== ruleDomain && !currentDomain.endsWith('.' + ruleDomain)) {
          rulesToRemove.push(tab.id);
          rulesToAdd.push({
            id: tab.id,
            priority: 1,
            action: { type: 'block' },
            condition: {
              tabIds: [tab.id],
              resourceTypes: ['main_frame'],
              excludedRequestDomains: [currentDomain]
            }
          });
        }
      }
    }

    if (rulesToRemove.length > 0 || rulesToAdd.length > 0) {
      console.log('[Pinnit] Updating session rules. Removing:', rulesToRemove, 'Adding:', rulesToAdd);
      await chrome.declarativeNetRequest.updateSessionRules({
        removeRuleIds: rulesToRemove,
        addRules: rulesToAdd
      });
    }
  } catch (error) {
    console.error('[Pinnit] Error synchronizing rules:', error);
  } finally {
    isSyncing = false;
    if (pendingSync) {
      pendingSync = false;
      // Schedule next sync shortly to handle queued updates
      setTimeout(syncRules, 50);
    }
  }
}

// Initial setup on extension install or browser startup
async function initialize() {
  try {
    // Enable the automatic badge count displaying the number of blocked requests on the action icon
    if (chrome.declarativeNetRequest.setExtensionActionOptions) {
      await chrome.declarativeNetRequest.setExtensionActionOptions({
        displayActionCountAsBadgeText: true
      });
    }
  } catch (e) {
    console.warn('[Pinnit] Could not set extension action options:', e);
  }
  await syncRules();
}

chrome.runtime.onInstalled.addListener(initialize);
chrome.runtime.onStartup.addListener(initialize);

// Listen for tab updates (e.g. pinned state change or navigation changes)
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // Only sync if the pinned state or the URL has updated
  if ('pinned' in changeInfo || 'url' in changeInfo) {
    syncRules();
  }
});

// Remove tab rules when tabs are closed
chrome.tabs.onRemoved.addListener((tabId) => {
  syncRules();
});

// Handle tab replacements (e.g. pre-rendering changes tab ID)
chrome.tabs.onReplaced.addListener((addedTabId, removedTabId) => {
  syncRules();
});

// Run syncRules immediately on service worker startup to catch active tabs
syncRules();
