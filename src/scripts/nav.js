(function () {
  var SEQ = { list: 0, reading: 1, about: 2, contact: 3 };
  var ZC  = ['z-front', 'z-back', 'z-crisp', 'z-dim', 'z-gone', 'z-ef'];

  var L   = document.getElementById('layer-list');
  var A   = document.getElementById('layer-article');
  var AB  = document.getElementById('layer-about');
  var CO  = document.getElementById('layer-contact');
  var hz  = document.getElementById('hit-zone');
  var hdr = document.getElementById('hdr');
  var ALL = [L, A, AB, CO];

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

  function navKey(s) {
    return (s === 'list' || s === 'reading') ? 'articles' : s;
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

  // What class should a layer have at rest for a given active state?
  function restClass(el, forState) {
    if (el === elFor(forState)) return 'z-front';
    if (forState === 'reading' && el === L) return 'z-back';
    return 'z-gone';
  }

  // Instant state application (init, popstate)
  function applyState(s) {
    ALL.forEach(function (el) { zz(el, restClass(el, s)); });
    hz.classList.toggle('on', s === 'reading');
    updateNavDots(navKey(s));
  }

  function navigate(next, pushUrl) {
    if (next === state || busy) return;
    busy = true;
    var fwd = SEQ[next] > SEQ[state];
    var old = elFor(state);
    var entering = elFor(next);

    // Step 1: exit animation on old layer
    if (old) zz(old, fwd ? 'z-ef' : 'z-gone');

    var url = pushUrl || urlFor(next);
    history.pushState({ view: next }, '', url);

    // Step 2: stagger — bring new layer in without touching old
    setTimeout(function () {
      if (entering) zz(entering, 'z-front');
      ALL.forEach(function (el) {
        if (el !== old && el !== entering) zz(el, restClass(el, next));
      });
      hz.classList.toggle('on', next === 'reading');
      updateNavDots(navKey(next));
      state = next;
    }, 60);

    // Step 3: after transition completes, settle old layer and unlock
    setTimeout(function () {
      if (old) zz(old, restClass(old, next));
      busy = false;
    }, 460);
  }

  // Nav links
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
      setTimeout(function () { busy = false; }, 480);
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

  // Init
  state = detectFromUrl();
  applyState(state);
  history.replaceState({ view: state }, '', location.pathname);

  window.__nav = {
    navigate: navigate,
    getState: function () { return state; },
    busy: function () { return busy; },
    zz: zz,
    ZC: ZC,
  };
})();
