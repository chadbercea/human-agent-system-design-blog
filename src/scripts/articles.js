(function () {
  var nav = window.__nav;
  if (!nav) { console.error('nav.js must load before articles.js'); return; }

  var L   = document.getElementById('layer-list');
  var A   = document.getElementById('layer-article');
  var hz  = document.getElementById('hit-zone');

  var items = Array.prototype.slice.call(document.querySelectorAll('.ali'));
  var swapping = false;

  // ── LOAD ARTICLE CONTENT ──
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
    body.innerHTML = '';

    fetch('/' + slug + '/')
      .then(function (r) { return r.text(); })
      .then(function (html) {
        var doc = new DOMParser().parseFromString(html, 'text/html');
        var prose = doc.querySelector('.prose');
        if (prose) body.innerHTML = prose.innerHTML;
      });
  }

  // ── OPEN ARTICLE ──
  function openArticle(item) {
    if (nav.busy() || swapping) return;
    var slug = item.dataset.slug;

    if (nav.getState() === 'reading') {
      // Article-to-article swap: current article zooms out, new one zooms in
      swapping = true;
      clearHi();
      nav.zz(L, 'z-back');
      nav.zz(A, 'z-gone');
      setTimeout(function () {
        loadArticle(item);
        nav.zz(A, 'z-front');
        history.pushState({ view: 'reading' }, '', '/' + slug);
        setTimeout(function () { swapping = false; }, 480);
      }, 300);
    } else {
      loadArticle(item);
      nav.navigate('reading', '/' + slug);
    }
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
