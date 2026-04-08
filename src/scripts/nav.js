(function () {
  var SEQ = { list: 0, reading: 1, about: 2, contact: 3 };
  var ZC  = ['z-front', 'z-back', 'z-crisp', 'z-dim', 'z-gone', 'z-ef'];

  var L   = document.getElementById('layer-list');
  var A   = document.getElementById('layer-article');
  var AB  = document.getElementById('layer-about');
  var CO  = document.getElementById('layer-contact');
  var hz  = document.getElementById('hit-zone');
  var hdr = document.getElementById('hdr');

  var state = 'list';
  var busy  = false;

  function zz(el, cls) {
    el.classList.remove.apply(el.classList, ZC);
    el.classList.add(cls);
  }

  function updateNavDots(key) {
    document.querySelectorAll('.hn').forEach(function (el) {
      var matches = el.dataset.nav === key;
      el.classList.toggle('on', matches);
    });
  }

  function elFor(s) {
    if (s === 'list')    return L;
    if (s === 'reading') return A;
    if (s === 'about')   return AB;
    if (s === 'contact') return CO;
  }

  function urlFor(s) {
    if (s === 'list')    return '/';
    if (s === 'about')   return '/about';
    if (s === 'contact') return '/contact';
    return '/';
  }

  function applyState(s) {
    if (s === 'list') {
      zz(L, 'z-front'); zz(A, 'z-gone'); zz(AB, 'z-gone'); zz(CO, 'z-gone');
      hz.classList.remove('on');
      updateNavDots('articles');
    } else if (s === 'reading') {
      zz(A, 'z-front'); zz(L, 'z-back'); zz(AB, 'z-gone'); zz(CO, 'z-gone');
      hz.classList.add('on');
      updateNavDots('articles');
    } else if (s === 'about') {
      zz(AB, 'z-front'); zz(L, 'z-gone'); zz(A, 'z-gone'); zz(CO, 'z-gone');
      hz.classList.remove('on');
      updateNavDots('about');
    } else if (s === 'contact') {
      zz(CO, 'z-front'); zz(L, 'z-gone'); zz(A, 'z-gone'); zz(AB, 'z-gone');
      hz.classList.remove('on');
      updateNavDots('contact');
    }
  }

  function navigate(next, pushUrl) {
    if (next === state || busy) return;
    busy = true;
    var fwd = SEQ[next] > SEQ[state];
    var old = elFor(state);
    if (old) zz(old, fwd ? 'z-ef' : 'z-gone');

    var url = pushUrl || urlFor(next);
    history.pushState({ view: next }, '', url);

    setTimeout(function () {
      applyState(next);
      state = next;
      setTimeout(function () { busy = false; }, 400);
    }, 60);
  }

  // Nav links — event delegation, no inline onclick
  document.querySelectorAll('.hn').forEach(function (el) {
    el.addEventListener('click', function (e) {
      e.preventDefault();
      var target = el.dataset.nav;
      if (target === 'articles') navigate('list');
      else navigate(target);
    });
  });

  var brand = document.querySelector('.brand');
  if (brand) {
    brand.addEventListener('click', function (e) {
      e.preventDefault();
      navigate('list');
    });
  }

  // Header scroll hide/show on article layer scroll
  var lastY = 0;
  if (A) {
    A.addEventListener('scroll', function () {
      var y = A.scrollTop;
      hdr.classList.toggle('away', y > lastY && y > 80);
      lastY = y;
    }, { passive: true });
  }

  // Browser back/forward
  window.addEventListener('popstate', function (e) {
    if (busy) return;
    if (e.state && e.state.view) {
      busy = true;
      applyState(e.state.view);
      state = e.state.view;
      setTimeout(function () { busy = false; }, 400);
    } else {
      var detected = detectFromUrl();
      applyState(detected);
      state = detected;
    }
  });

  function detectFromUrl() {
    var path = location.pathname.replace(/\/+$/, '') || '/';
    if (path === '/')        return 'list';
    if (path === '/about')   return 'about';
    if (path === '/contact') return 'contact';
    return 'reading';
  }

  // Init: detect state from current URL
  state = detectFromUrl();
  applyState(state);
  history.replaceState({ view: state }, '', location.pathname);

  // Expose for other scripts (e.g. hit-zone, article loader)
  window.__nav = {
    navigate: navigate,
    getState: function () { return state; },
    busy: function () { return busy; },
    zz: zz,
    ZC: ZC,
  };
})();
