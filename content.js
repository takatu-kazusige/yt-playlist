(() => {
  'use strict';

  function injectSearchBox() {
    // --- A. 複数選択拡張機能用（ytd-add-to-playlist-renderer）の処理 ---
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

      // ダイアログ閉鎖対策
      const stop = (e) => e.stopPropagation();
      ['mousedown', 'mouseup', 'click', 'pointerdown', 'touchstart'].forEach(ev => {
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

      console.log('playlist search injected (multi-select dialog)', renderer);
    });

    // --- B. 通常ページ / 通常ダイアログ用の処理 ---
    // 複数選択用レンダラーがない場合のみ実行
    if (!document.querySelector('ytd-add-to-playlist-renderer')) {
      const listView = document.querySelector('yt-list-view-model');
      
      if (listView) {
        // ②の修正：3点リーダー（role="menu" など）の場合は検索バーを入れない
        // すでに間違って入ってしまっているラッパーがあれば削除する
        if (listView.getAttribute('role') !== 'list') {
          const parent = listView.parentElement;
          if (parent && parent.dataset.searchInjected) {
            parent.querySelector('.custom-search-wrapper')?.remove();
            delete parent.dataset.searchInjected;
            console.log('playlist search removed (context switched from 3-dot menu)');
          }
          return;
        }

        // 正しいコンテキスト（role="list"）かつ、未挿入なら挿入
        if (listView.parentElement && !listView.parentElement.dataset.searchInjected) {
          insertToNormalPage(listView.parentElement);
        }
      }
    }
  }

  function insertToNormalPage(container) {
    container.dataset.searchInjected = 'true';

    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'プレイリスト検索...';

    const wrapper = document.createElement('div');
    // 後から削除できるように識別用のクラス名を追加
    wrapper.className = 'custom-search-wrapper';
    wrapper.style.cssText = 'position:sticky;top:0;z-index:9999;background:#212121;padding:8px;flex-shrink:0;';

    const stop = (e) => e.stopPropagation();
    ['mousedown', 'mouseup', 'click', 'pointerdown', 'touchstart'].forEach(ev => {
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