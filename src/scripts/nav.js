(function () {
  var VIEWS = ['articles', 'article', 'about', 'contact'];
  var POS   = ['p-c', 'p-b', 'p-f'];

  var POSMAP = {
    articles: { articles: 'p-c', article: 'p-b', about: 'p-b', contact: 'p-b' },
    article:  { articles: 'p-f', article: 'p-c', about: 'p-b', contact: 'p-b' },
    about:    { articles: 'p-f', article: 'p-f', about: 'p-c', contact: 'p-b' },
    contact:  { articles: 'p-f', article: 'p-f', about: 'p-f', contact: 'p-c' },
  };

  var layers = {
    articles: document.getElementById('layer-articles'),
    article:  document.getElementById('layer-article'),
    about:    document.getElementById('layer-about'),
    contact:  document.getElementById('layer-contact'),
  };

  var state = 'articles';

  function apply(next) {
    var map = POSMAP[next];
    if (!map) return;
    state = next;
    for (var i = 0; i < VIEWS.length; i++) {
      var view = VIEWS[i];
      var el = layers[view];
      if (!el) continue;
      for (var j = 0; j < POS.length; j++) {
        el.classList.remove(POS[j]);
      }
      el.classList.add(map[view]);
    }
  }

  function navigate(next, url, push) {
    if (state === next) return;
    apply(next);
    if (push !== false) {
      history.pushState({ view: next }, '', url);
    }
  }

  function detectState() {
    var path = location.pathname.replace(/\/+$/, '') || '/';
    if (path === '/' || path === '/articles') return { view: 'articles', url: '/' };
    if (path === '/about') return { view: 'about', url: '/about' };
    if (path === '/contact') return { view: 'contact', url: '/contact' };
    if (path.indexOf('/') === 0) return { view: 'article', url: path };
    return { view: 'articles', url: '/' };
  }

  // Nav link clicks (Articles, About, Contact)
  document.addEventListener('click', function (e) {
    var link = e.target.closest('[data-nav]');
    if (link) {
      e.preventDefault();
      var target = link.getAttribute('data-nav');
      var url = link.getAttribute('href') || '/';
      navigate(target, url);
      return;
    }

    // Article list item clicks
    var item = e.target.closest('[data-slug]');
    if (item) {
      e.preventDefault();
      var slug = item.getAttribute('data-slug');
      navigate('article', '/' + slug);
      return;
    }

    // Back-to-list from article view
    var back = e.target.closest('[data-back]');
    if (back) {
      e.preventDefault();
      navigate('articles', '/');
      return;
    }
  });

  // Browser back/forward
  window.addEventListener('popstate', function (e) {
    if (e.state && e.state.view) {
      apply(e.state.view);
    } else {
      var detected = detectState();
      apply(detected.view);
    }
  });

  // Initialize on load
  var initial = detectState();
  apply(initial.view);
  history.replaceState({ view: initial.view }, '', initial.url);
})();
