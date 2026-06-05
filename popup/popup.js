document.addEventListener('DOMContentLoaded', async () => {
  const tabList = document.getElementById('locked-tabs-list');

  try {
    // Check if storage permissions are active
    if (!chrome.storage || !chrome.storage.session) {
      tabList.innerHTML = `
        <div class="empty-state">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="stroke: var(--text-muted);">
            <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"></path>
          </svg>
          <span class="empty-title">Reload Required</span>
          <p>Please click the reload button on the <code>chrome://extensions</code> page to grant storage permissions.</p>
        </div>
      `;
      return;
    }

    // 1. Fetch all pinned tabs and current session storage locks
    const pinnedTabs = await chrome.tabs.query({ pinned: true });
    const storage = await chrome.storage.session.get(null);

    // Clear loading state
    tabList.innerHTML = '';

    if (pinnedTabs.length === 0) {
      displayEmptyState(tabList);
      return;
    }

    // 2. Render pinned tab entries
    pinnedTabs.forEach(tab => {
      const key = `tab-${tab.id}`;
      const lock = storage[key];
      
      const tabUrl = tab.url || '';
      const isWebPage = tabUrl.startsWith('http:') || tabUrl.startsWith('https:');
      
      let lockedDomain = 'Not locked';
      if (lock && lock.domain) {
        lockedDomain = lock.domain;
      } else if (isWebPage) {
        try {
          let domain = new URL(tabUrl).hostname;
          if (domain.startsWith('www.')) {
            domain = domain.substring(4);
          }
          lockedDomain = domain;
        } catch (e) {
          console.error('Failed to parse domain for tab', tab.id, e);
        }
      }

      // Create list item card
      const li = document.createElement('li');
      li.className = 'tab-item';
      li.id = `tab-item-${tab.id}`;
      
      // Determine favicon or fallback
      const favIconUrl = tab.favIconUrl || 'chrome://favicon/';
      
      li.innerHTML = `
        <div class="tab-info">
          <div class="tab-title-row">
            <img class="tab-favicon" src="${favIconUrl}" onerror="this.src='chrome://favicon/'" alt="">
            <span class="tab-title">${escapeHtml(tab.title || 'Tab')}</span>
          </div>
          <span class="tab-domain">${escapeHtml(lockedDomain)}</span>
        </div>
        <button class="go-tab-btn" title="Focus Tab" aria-label="Focus tab ${escapeHtml(tab.title || '')}">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="15 3 21 3 21 9"></polyline>
            <line x1="10" y1="14" x2="21" y2="3"></line>
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
          </svg>
        </button>
      `;

      // Click event to navigate/focus this tab
      li.addEventListener('click', async () => {
        try {
          await chrome.tabs.update(tab.id, { active: true });
          if (tab.windowId) {
            await chrome.windows.update(tab.windowId, { focused: true });
          }
        } catch (err) {
          console.error('Failed to focus tab:', err);
        }
      });

      tabList.appendChild(li);
    });

  } catch (error) {
    console.error('Error loading popup content:', error);
    tabList.innerHTML = `<li class="empty-state"><span class="empty-title">Error</span>Failed to load pinned tabs.</li>`;
  }
});

/**
 * Escapes HTML characters to prevent XSS.
 */
function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Renders a visually premium empty state when no pinned tabs are found.
 */
function displayEmptyState(container) {
  container.innerHTML = `
    <div class="empty-state">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
        <circle cx="12" cy="10" r="3"></circle>
      </svg>
      <span class="empty-title">No Pinned Tabs</span>
      <p>Pin a tab in Chrome, and its domain will lock automatically.</p>
    </div>
  `;
}
