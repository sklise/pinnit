const FALLBACK_FAVICON =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="%23222222" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>';

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

document.addEventListener('DOMContentLoaded', async () => {
  const tabList = document.getElementById('locked-tabs-list');
  const supportsHas = CSS.supports('selector(:has(*))');

  try {
    if (!chrome.storage?.local) {
      renderReloadState(tabList);
      return;
    }

    const pinnedTabs = await chrome.tabs.query({ pinned: true });
    const storage = await chrome.storage.local.get(null);

    tabList.replaceChildren();

    if (pinnedTabs.length === 0) {
      renderEmptyState(tabList);
      return;
    }

    pinnedTabs.forEach((tab) => {
      const key = `tab-${tab.id}`;
      const lock = storage[key];
      const tabUrl = tab.url || '';
      const actualDomain = lock?.domain || extractDomain(tabUrl);
      const displayDomain = actualDomain || 'Not locked';

      const favIconUrl =
        tab.favIconUrl && !tab.favIconUrl.startsWith('chrome://')
          ? tab.favIconUrl
          : FALLBACK_FAVICON;

      const blockSubdomains = lock ? lock.blockSubdomains !== false : true;

      const li = document.createElement('li');
      li.className = 'tab-item';
      li.id = `tab-item-${tab.id}`;

      const tabInfo = document.createElement('div');
      tabInfo.className = 'tab-info';

      const titleRow = document.createElement('div');
      titleRow.className = 'tab-title-row';

      const faviconImg = document.createElement('img');
      faviconImg.className = 'tab-favicon';
      faviconImg.src = favIconUrl;
      faviconImg.alt = '';
      faviconImg.addEventListener(
        'error',
        () => {
          faviconImg.src = FALLBACK_FAVICON;
        },
        { once: true }
      );

      const titleSpan = document.createElement('span');
      titleSpan.className = 'tab-title';
      titleSpan.textContent = tab.title || 'Tab';

      titleRow.append(faviconImg, titleSpan);

      const domainSpan = document.createElement('span');
      domainSpan.className = 'tab-domain';
      domainSpan.textContent = displayDomain;

      tabInfo.append(titleRow, domainSpan);

      const toggleLabel = document.createElement('label');
      toggleLabel.className = 'subdomain-toggle';
      toggleLabel.title = 'Block Subdomains Toggle';
      if (!supportsHas && blockSubdomains) {
        toggleLabel.classList.add('is-strict');
      }

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.className = 'subdomain-checkbox';
      checkbox.checked = blockSubdomains;

      const badgeSpan = document.createElement('span');
      badgeSpan.className = 'toggle-label';
      badgeSpan.textContent = 'STRICT';

      toggleLabel.append(checkbox, badgeSpan);
      li.append(tabInfo, toggleLabel);

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

      checkbox.addEventListener('click', (e) => e.stopPropagation());
      toggleLabel.addEventListener('click', (e) => e.stopPropagation());

      checkbox.addEventListener('change', async (e) => {
        const checked = e.target.checked;
        if (!supportsHas) {
          toggleLabel.classList.toggle('is-strict', checked);
        }

        try {
          const storageData = await chrome.storage.local.get(key);
          const currentLock = storageData[key];
          const domainToSave = currentLock?.domain || actualDomain;

          if (!domainToSave) {
            // Blank/internal pinned tab: persist strictness preference without locking to a placeholder string
            await chrome.storage.local.set({
              [key]: { blockSubdomains: checked }
            });
            return;
          }

          let urlToSave = currentLock?.url || tabUrl || `https://${domainToSave}/`;
          if (checked && extractDomain(urlToSave) !== domainToSave) {
            urlToSave =
              extractDomain(tabUrl) === domainToSave
                ? tabUrl
                : `https://${domainToSave}/`;
          }

          await chrome.storage.local.set({
            [key]: {
              domain: domainToSave,
              url: urlToSave,
              blockSubdomains: checked
            }
          });
        } catch (err) {
          console.error('Failed to update subdomain permission:', err);
        }
      });

      tabList.appendChild(li);
    });
  } catch (error) {
    console.error('Error loading popup content:', error);
    renderErrorState(tabList);
  }
});

function createSvgIcon(paths, strokeColor) {
  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('width', '28');
  svg.setAttribute('height', '28');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('fill', 'none');
  svg.setAttribute('stroke', strokeColor || 'currentColor');
  svg.setAttribute('stroke-width', '2');
  svg.setAttribute('stroke-linecap', 'round');
  svg.setAttribute('stroke-linejoin', 'round');

  for (const item of paths) {
    const el = document.createElementNS(ns, item.tag);
    for (const [attr, val] of Object.entries(item.attrs)) {
      el.setAttribute(attr, val);
    }
    svg.appendChild(el);
  }
  return svg;
}

function renderEmptyState(container) {
  const wrapper = document.createElement('li');
  wrapper.className = 'empty-state';

  const svg = createSvgIcon([
    { tag: 'path', attrs: { d: 'M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z' } },
    { tag: 'circle', attrs: { cx: '12', cy: '10', r: '3' } }
  ]);

  const title = document.createElement('span');
  title.className = 'empty-title';
  title.textContent = 'No Pinned Tabs';

  const desc = document.createElement('p');
  desc.textContent = 'Pin a tab in Chrome, and its domain will lock automatically.';

  wrapper.append(svg, title, desc);
  container.replaceChildren(wrapper);
}

function renderReloadState(container) {
  const wrapper = document.createElement('li');
  wrapper.className = 'empty-state';

  const svg = createSvgIcon(
    [
      {
        tag: 'path',
        attrs: { d: 'M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67' }
      }
    ],
    'var(--color-grey-medium)'
  );

  const title = document.createElement('span');
  title.className = 'empty-title';
  title.textContent = 'Reload Required';

  const desc = document.createElement('p');
  desc.textContent =
    'Please reload Pinnit on chrome://extensions to enable storage permissions.';

  wrapper.append(svg, title, desc);
  container.replaceChildren(wrapper);
}

function renderErrorState(container) {
  const wrapper = document.createElement('li');
  wrapper.className = 'empty-state';

  const title = document.createElement('span');
  title.className = 'empty-title';
  title.textContent = 'Error';

  const desc = document.createElement('p');
  desc.textContent = 'Failed to load pinned tabs.';

  wrapper.append(title, desc);
  container.replaceChildren(wrapper);
}
