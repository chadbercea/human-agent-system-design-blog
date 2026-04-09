(function () {
  var nav = window.__nav;
  if (!nav) { console.error('nav.js must load before articles.js'); return; }

  var L   = document.getElementById('layer-list');
  var A   = document.getElementById('layer-article');
  var hz  = document.getElementById('hit-zone');

  var items = Array.prototype.slice.call(document.querySelectorAll('.ali'));
  var swapping = false;

  /** Clear entrance animation classes before new content or re-run. */
  function clearArticleEntrance() {
    var header = document.querySelector('#layer-article .art-header');
    var body = document.getElementById('art-body');
    var footer = document.querySelector('#layer-article .art-footer');
    if (header) header.classList.remove('art-header--enter');
    if (body) body.classList.remove('prose--enter');
    if (footer) footer.classList.remove('art-footer--enter');
  }

  /**
   * Re-trigger CSS staggered entrance on header, prose, footer.
   * Call after layer is z-front (small delay aligns with nav stagger).
   */
  function runArticleEntrance() {
    var header = document.querySelector('#layer-article .art-header');
    var body = document.getElementById('art-body');
    var footer = document.querySelector('#layer-article .art-footer');
    clearArticleEntrance();
    if (body) void body.offsetWidth;
    if (header) header.classList.add('art-header--enter');
    if (body) body.classList.add('prose--enter');
    if (footer) footer.classList.add('art-footer--enter');
  }

  /** ~72ms aligns with nav stagger; cleanup strips entrance classes after fades finish (no stray layers). */
  function scheduleArticleEntrance() {
    setTimeout(function () {
      runArticleEntrance();
      setTimeout(function () {
        clearArticleEntrance();
      }, 950);
    }, 72);
  }

  // ── LOAD ARTICLE CONTENT (fetch completes before caller navigates / reveals) ──
  function loadArticle(item) {
    var slug  = item.dataset.slug;
    var title = item.dataset.title;
    var date  = item.dataset.date;
    var desc  = item.dataset.description;

    document.getElementById('art-title').textContent = title;
    document.getElementById('art-date').textContent  = date;
    document.getElementById('art-lede').textContent  = desc || '';
    A.scrollTop = 0;

    var body = document.getElementById('art-body');
    clearArticleEntrance();
    body.innerHTML = '';

    return fetch('/' + slug + '/')
      .then(function (r) {
        if (!r.ok) throw new Error('fetch failed');
        return r.text();
      })
      .then(function (html) {
        var doc = new DOMParser().parseFromString(html, 'text/html');
        var prose = doc.querySelector('.prose');
        if (prose) body.innerHTML = prose.innerHTML;
      })
      .catch(function () {
        body.innerHTML =
          '<p class="art-load-err">Could not load this transmission.</p>';
      });
  }

  // ── OPEN ARTICLE ──
  function openArticle(item) {
    if (nav.busy() || swapping) return;
    var slug = item.dataset.slug;

    if (nav.getState() === 'reading') {
      swapping = true;
      clearHi();
      nav.zz(L, 'z-back');
      nav.zz(A, 'z-gone');
      setTimeout(function () {
        loadArticle(item).then(function () {
          nav.zz(A, 'z-front');
          if (nav.syncHeaderScrollState) nav.syncHeaderScrollState();
          history.pushState({ view: 'reading' }, '', '/' + slug);
          scheduleArticleEntrance();
          setTimeout(function () {
            swapping = false;
          }, 480);
        });
      }, 300);
    } else {
      loadArticle(item).then(function () {
        nav.navigate('reading', '/' + slug);
        scheduleArticleEntrance();
      });
    }
  }

  // ── BACK LINK (SPA nav, no full reload) ──
  var back = document.getElementById('art-back');
  if (back) {
    back.addEventListener('click', function (e) {
      e.preventDefault();
      nav.navigate('list');
    });
  }

  // ── ARTICLE LIST CLICK HANDLERS ──
  items.forEach(function (item) {
    item.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      openArticle(item);
    });
  });

  // ── HIT-ZONE HELPERS ──
  function clearHi() {
    items.forEach(function (li) { li.classList.remove('hi'); });
  }

  function itemAt(y) {
    for (var i = 0; i < items.length; i++) {
      var r = items[i].getBoundingClientRect();
      if (y >= r.top && y <= r.bottom) return items[i];
    }
    return null;
  }

  // ── HIT-ZONE INTERACTIONS ──
  hz.addEventListener('mouseenter', function () {
    if (nav.getState() !== 'reading') return;
    nav.zz(L, 'z-crisp');
    nav.zz(A, 'z-front');
  });

  hz.addEventListener('mousemove', function (e) {
    if (nav.getState() !== 'reading') return;
    clearHi();
    var li = itemAt(e.clientY);
    if (li) {
      li.classList.add('hi');
      nav.zz(A, 'z-dim');
    } else {
      nav.zz(A, 'z-front');
    }
  });

  hz.addEventListener('mouseleave', function () {
    if (nav.getState() !== 'reading') return;
    clearHi();
    nav.zz(L, 'z-back');
    nav.zz(A, 'z-front');
  });

  hz.addEventListener('click', function (e) {
    if (nav.getState() !== 'reading' || nav.busy() || swapping) return;
    var li = itemAt(e.clientY);
    if (li) {
      openArticle(li);
    } else {
      nav.navigate('list');
    }
  });
})();
