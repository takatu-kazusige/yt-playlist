(() => {
  'use strict';

  function injectSearchBox() {
    // ==========================================
    // アプローチ①：通常のダイアログ用（新仕様：再利用対応版）
    // ==========================================
    const normalLayout = document.querySelector('yt-contextual-sheet-layout');
    if (normalLayout) {
      const dropdown = normalLayout.closest('tp-yt-iron-dropdown');
      // ダイアログが「display: none」ではなく、現実に画面に表示されている時だけ処理する
      const isVisible = dropdown && window.getComputedStyle(dropdown).display !== 'none';
      
      if (isVisible) {
        const header = normalLayout.querySelector('.ytContextualSheetLayoutHeaderContainer');
        // 再生リスト保存用のヘッダー領域（yt-panel-header-view-modelなど）があるか確認
        // (3点リーダメニューの時はこの中に再生リスト用のヘッダーがないため誤爆を防げる)
        if (header && (header.querySelector('yt-panel-header-view-model') || header.textContent.includes('保存先'))) {
          
          // 既に検索バーが挿入済みでなければ挿入する
          if (!header.querySelector('.custom-dialog-search-wrapper')) {
            const input = document.createElement('input');
            input.type = 'text';
            input.placeholder = 'プレイリスト検索...';

            const wrapper = document.createElement('div');
            wrapper.className = 'custom-dialog-search-wrapper';
            wrapper.style.cssText = 'background:#212121; padding:8px 16px; width:100%; box-sizing:border-box;';

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
            header.appendChild(wrapper); // ヘッダー領域の最下部に追加

            // インクリメンタル検索（新仕様のリスト要素に対応）
            input.addEventListener('input', () => {
              const query = input.value.trim().toLowerCase();
              // ダイアログ内のリストアイテム（ViewModel系、あるいは標準のレンダラー要素）を広く捕捉
              const items = normalLayout.querySelectorAll('yt-playlist-add-to-option-renderer, ytd-playlist-add-to-option-renderer, ytd-privacy-dropdown-item-renderer, yt-list-item-view-model');
              
              items.forEach(item => {
                const label = item.textContent || '';
                item.style.display = label.toLowerCase().includes(query) ? '' : 'none';
              });
            });
          }
        }
      }
    }

    // ==========================================
    // アプローチ②：「複数選択」拡張機能のダイアログ用（別系統）
    // ==========================================
    const extendedRenderers = document.querySelectorAll('ytd-add-to-playlist-renderer');
    extendedRenderers.forEach(renderer => {
      const root = renderer.shadowRoot || renderer;
      if (root.querySelector('.custom-extended-search-wrapper')) return;

      const dialogHeader = root.querySelector('#header');
      const playlistContainer = root.querySelector('#playlists');

      if (!dialogHeader || !playlistContainer) return;

      const input = document.createElement('input');
      input.type = 'text';
      input.placeholder = 'プレイリスト検索...';

      const wrapper = document.createElement('div');
      // 後から削除できるように識別用のクラス名を追加
      wrapper.className = 'custom-extended-search-wrapper';
      wrapper.style.cssText = 'background:#212121; padding:8px 16px; flex-shrink:0; width:100%; box-sizing:border-box;';

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
      dialogHeader.after(wrapper);

      input.addEventListener('input', () => {
        const query = input.value.trim().toLowerCase();
        const items = playlistContainer.querySelectorAll('ytd-playlist-add-to-option-renderer');
        items.forEach(item => {
          const label = item.querySelector('#label')?.textContent || '';
          item.style.display = label.toLowerCase().includes(query) ? '' : 'none';
        });
      });
    });

    // ==========================================
    // アプローチ③：再生リスト一覧画面（/feed/playlists）用
    // ==========================================
    if (location.href.includes('/playlists')) {
      const gridHeaders = document.querySelectorAll('ytd-rich-grid-renderer > #header');
      gridHeaders.forEach(header => {
        if (header.querySelector('.custom-search-container')) return;

        const searchWrapper = document.createElement('div');
        searchWrapper.className = 'custom-search-container';
        searchWrapper.style.cssText = 'position:relative; width:100%; max-width:600px; padding: 8px 0; margin-top: 8px; box-sizing:border-box;';

        const input = document.createElement('input');
        input.type = 'text';
        input.placeholder = '再生リストを検索...';
        Object.assign(input.style, {
          width: '100%',
          padding: '10px 16px',
          background: '#272727',
          color: 'white',
          border: 'none',
          borderRadius: '24px',
          fontSize: '14px',
          boxSizing: 'border-box',
          outline: 'none'
        });

        const dropdown = document.createElement('div');
        dropdown.className = 'custom-search-dropdown';
        dropdown.style.cssText = 'position:absolute; top:100%; left:0; right:0; background:#212121; border-radius:8px; box-shadow:0 4px 20px rgba(0,0,0,0.5); max-height:300px; overflow-y:auto; display:none; margin-top:4px; z-index:99999; padding: 4px 0; border: 1px solid #333;';

        searchWrapper.appendChild(input);
        searchWrapper.appendChild(dropdown);
        header.appendChild(searchWrapper);

        const stop = (e) => e.stopPropagation();
        ['mousedown', 'mouseup', 'click', 'pointerdown', 'touchstart'].forEach(ev => {
          searchWrapper.addEventListener(ev, stop);
        });

        const rebuildDropdown = () => {
          dropdown.innerHTML = '';
          const query = input.value.trim().toLowerCase();
          const gridBox = header.closest('ytd-rich-grid-renderer');
          if (!gridBox) return;

          const cards = gridBox.querySelectorAll('ytd-rich-item-renderer');
          const titles = new Set();
          
          cards.forEach(card => {
            const titleEl = card.querySelector('#video-title') || card.querySelector('h3');
            const titleText = titleEl?.textContent?.trim();
            if (titleText) titles.add(titleText);
          });

          titles.forEach(title => {
            if (query && !title.toLowerCase().includes(query)) return;

            const row = document.createElement('div');
            row.textContent = title;
            row.style.cssText = 'padding: 10px 16px; color: #fff; cursor: pointer; font-size: 14px; transition: background 0.2s; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;';
            
            row.addEventListener('mouseenter', () => row.style.background = '#333');
            row.addEventListener('mouseleave', () => row.style.background = 'transparent');
            
            row.addEventListener('click', (e) => {
              e.stopPropagation();
              input.value = title;
              commitSearch();
            });
            
            dropdown.appendChild(row);
          });

          dropdown.style.display = dropdown.children.length > 0 ? 'block' : 'none';
        };

        const commitSearch = () => {
          dropdown.style.display = 'none';
          const query = input.value.trim().toLowerCase();
          const gridBox = header.closest('ytd-rich-grid-renderer');
          if (!gridBox) return;

          const cards = gridBox.querySelectorAll('ytd-rich-item-renderer');
          cards.forEach(card => {
            if (!query) {
              card.style.display = '';
              return;
            }
            const titleEl = card.querySelector('#video-title') || card.querySelector('h3');
            const titleText = titleEl?.textContent?.trim().toLowerCase() || '';
            card.style.display = titleText.includes(query) ? '' : 'none';
          });
        };

        input.addEventListener('focus', rebuildDropdown);
        input.addEventListener('input', rebuildDropdown);
        document.addEventListener('click', commitSearch);
        input.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') {
            input.blur();
            commitSearch();
          }
        });
      });
    }
  }

  // DOM全体の動的変化を監視（属性変更も合わせてキャッチする設定に強化）
  const observer = new MutationObserver(() => {
    injectSearchBox();
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,         // style="display:none" の切り替えの瞬間を検知するために必須
    attributeFilter: ['style', 'class'] // 監視の負荷を下げるため、関係する属性だけに絞り込み
  });

  injectSearchBox();
})();