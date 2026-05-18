(() => {
  'use strict';

  const SEARCH_ID = 'yt-playlist-search-box';

  function injectSearchBox() {

    // 二重追加防止
    if (document.getElementById(SEARCH_ID)) {
      return;
    }

    // プレイリスト一覧
    const listView = document.querySelector(
      'yt-list-view-model'
    );

    if (!listView) {
      return;
    }

    // プレイリスト項目
    const items = listView.querySelectorAll(
      'toggleable-list-item-view-model'
    );

    if (!items.length) {
      return;
    }

    // リストコンテナ
    const container = listView.parentElement;

    if (!container) {
      return;
    }

    // 検索欄
    const input = document.createElement('input');

    input.id = SEARCH_ID;
    input.type = 'text';
    input.placeholder = 'プレイリスト検索...';

    // ダイアログ閉鎖対策
    const stop = (e) => {
      e.stopPropagation();
    };

    input.addEventListener('mousedown', stop);
    input.addEventListener('mouseup', stop);
    input.addEventListener('click', stop);
    input.addEventListener('pointerdown', stop);
    input.addEventListener('touchstart', stop);

    // ラッパー
    const wrapper = document.createElement('div');

    wrapper.style.position = 'sticky';
    wrapper.style.top = '0';
    wrapper.style.zIndex = '9999';

    wrapper.style.background = '#212121';

    wrapper.style.padding = '8px';
    wrapper.style.flexShrink = '0';

    // 検索欄スタイル
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

    // リストコンテナ先頭へ追加
    container.prepend(wrapper);

    // 検索処理
    input.addEventListener('input', () => {

      const query =
        input.value.trim().toLowerCase();

      const currentItems = listView.querySelectorAll(
        'toggleable-list-item-view-model'
      );

      currentItems.forEach(item => {

        const title =
          item.querySelector(
            '.ytListItemViewModelTitleWrapper'
          )?.textContent || '';

        const matched =
          title.toLowerCase().includes(query);

        item.style.display =
          matched ? '' : 'none';
      });
    });

    console.log('playlist search injected');
  }

  // DOM監視
  const observer = new MutationObserver(() => {
    injectSearchBox();
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

})();
