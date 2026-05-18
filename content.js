(() => {
  'use strict';

  const SEARCH_ID = 'yt-playlist-search-box';

  function injectSearchBox() {

    if (document.getElementById(SEARCH_ID)) {
      return;
    }

    const listView = document.querySelector(
      'yt-list-view-model'
    );

    if (!listView) {
      return;
    }

    const items = listView.querySelectorAll(
      'toggleable-list-item-view-model'
    );

    if (!items.length) {
      return;
    }

    // ダイアログ全体
    const dialog = listView.closest(
      'yt-contextual-sheet-layout'
    );

    if (!dialog) {
      return;
    }

    // 検索欄
    const input = document.createElement('input');

    input.id = SEARCH_ID;
    input.type = 'text';
    input.placeholder = 'プレイリスト検索...';

    // YouTubeのクリック閉鎖対策
    const stop = (e) => {
      e.stopPropagation();
    };

    input.addEventListener('mousedown', stop);
    input.addEventListener('click', stop);
    input.addEventListener('mouseup', stop);

    // スクロール外固定エリア
    const wrapper = document.createElement('div');

    wrapper.style.position = 'sticky';
    wrapper.style.top = '0';
    wrapper.style.zIndex = '9999';
    wrapper.style.background = '#212121';
    wrapper.style.padding = '8px';

    wrapper.appendChild(input);

    // ダイアログ先頭へ追加
    dialog.prepend(wrapper);

    // 検索
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

        item.style.display =
          title.toLowerCase().includes(query)
            ? ''
            : 'none';
      });
    });

    console.log('playlist search injected');
  }

  const observer = new MutationObserver(() => {
    injectSearchBox();
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

})();
