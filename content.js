(() => {
  'use strict';

  function injectSearchBox() {
    const renderers = document.querySelectorAll('ytd-add-to-playlist-renderer');

    renderers.forEach(renderer => {
      if (renderer.dataset.searchInjected) return;

      const root = renderer.shadowRoot || renderer;
      const dialogHeader = root.querySelector('#header');
      const playlistContainer = root.querySelector('#playlists');

      if (!dialogHeader || !playlistContainer) return;

      renderer.dataset.searchInjected = 'true';

      const input = document.createElement('input');
      input.type = 'text';
      input.placeholder = 'プレイリスト検索...';

      const wrapper = document.createElement('div');
      wrapper.style.cssText = 'background:#212121;padding:8px 16px;flex-shrink:0;';

      const stop = (e) => e.stopPropagation();
      ['mousedown', 'mouseup', 'click', 'pointerdown', 'touchstart'].forEach(ev => {
        input.addEventListener(ev, stop);
        wrapper.addEventListener(ev, stop);
      });

      Object.assign(input.style, {
        width: '100%',
        padding: '10px 12px',
        background: '#121212',
        color: 'white',
        border: '1px solid #444',
        borderRadius: '8px',
        fontSize: '14px',
        boxSizing: 'border-box'
      });

      wrapper.appendChild(input);
      dialogHeader.insertAdjacentElement('afterend', wrapper);

      input.addEventListener('input', () => {
        const query = input.value.trim().toLowerCase();
        playlistContainer.querySelectorAll('ytd-playlist-add-to-option-renderer').forEach(item => {
          const itemRoot = item.shadowRoot || item;
          const labelEl = itemRoot.querySelector('#label');
          const title = labelEl ? (labelEl.getAttribute('title') || labelEl.textContent) : '';
          item.style.display = title.toLowerCase().includes(query) ? '' : 'none';
        });
      });

      console.log('playlist search injected', renderer);
    });

    if (!document.querySelector('ytd-add-to-playlist-renderer')) {
      const listView = document.querySelector('yt-list-view-model');
      if (listView && listView.parentElement && !listView.parentElement.dataset.searchInjected) {
        insertToNormalPage(listView.parentElement);
      }
    }
  }

  function insertToNormalPage(container) {
    container.dataset.searchInjected = 'true';

    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'プレイリスト検索...';

    const wrapper = document.createElement('div');
    wrapper.style.cssText = 'position:sticky;top:0;z-index:9999;background:#212121;padding:8px;flex-shrink:0;';

    const stop = (e) => e.stopPropagation();
    ['mousedown', 'mouseup', 'click', 'pointerdown', 'touchstart'].forEach(ev => {
      input.addEventListener(ev, stop);
      wrapper.addEventListener(ev, stop);
    });

    Object.assign(input.style, {
      width: '100%',
      padding: '10px 12px',
      background: '#121212',
      color: 'white',
      border: '1px solid #444',
      borderRadius: '8px',
      fontSize: '14px',
      boxSizing: 'border-box'
    });

    wrapper.appendChild(input);
    container.prepend(wrapper);

    input.addEventListener('input', () => {
      const query = input.value.trim().toLowerCase();
      const listView = container.querySelector('yt-list-view-model');
      if (listView) {
        listView.querySelectorAll('toggleable-list-item-view-model').forEach(item => {
          const title = item.querySelector('.ytListItemViewModelTitleWrapper')?.textContent || '';
          item.style.display = title.toLowerCase().includes(query) ? '' : 'none';
        });
      }
    });

    console.log('playlist search injected into page');
  }

  const observer = new MutationObserver(() => {
    injectSearchBox();
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
})();