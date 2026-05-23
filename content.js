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
    // 【改善】A（複数選択）の有無に関わらず、画面上のすべての `yt-list-view-model` を個別に精査する
    const listViews = document.querySelectorAll('yt-list-view-model');
    
    listViews.forEach(listView => {
      const parent = listView.parentElement;
      if (!parent) return;

      // ① 3点リーダーメニュー（role !== 'list'）の場合の処理
      if (listView.getAttribute('role') !== 'list') {
        // 過去の使い回しや誤挿入で残ってしまった検索バーがあれば、確実に削除してフラグもリセット
        const existingWrapper = parent.querySelector('.custom-search-wrapper');
        if (existingWrapper) {
          existingWrapper.remove();
          delete parent.dataset.searchInjected;
          console.log('playlist search removed (3-dot menu cleaned)');
        }
        return; 
      }

      // ② 正しい通常ダイアログ（role === 'list'）の場合の処理
      if (!parent.dataset.searchInjected) {
        // YouTubeが要素を使い回した際にゴミが残っていないか念のため掃除してから挿入
        parent.querySelector('.custom-search-wrapper')?.remove();
        insertToNormalPage(parent);
      }
    });
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