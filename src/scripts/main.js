(function () {
  var state = 'grid';
  var grid = document.getElementById('grid');
  if (!grid) return;
  var cards = Array.prototype.slice.call(grid.querySelectorAll('.card'));
  if (!cards.length) return;

  var articleView = document.getElementById('article-view');
  var gridView = document.getElementById('grid-view');
  var articleMain = document.getElementById('article-main');
  var headerImg = document.getElementById('article-header-img');
  var artTitle = document.getElementById('art-title');
  var artDate = document.getElementById('art-date');
  var artTags = document.getElementById('art-tags');
  var artBody = document.getElementById('article-body');
  var artFooter = document.getElementById('article-footer');
  var sidebarItems = Array.prototype.slice.call(document.querySelectorAll('.sidebar-item'));
  var aboutView = document.getElementById('about-view');
  var contactView = document.getElementById('contact-view');
  var aboutStage = aboutView ? aboutView.querySelector('.meta-stage') : null;
  var aboutFields = aboutView
    ? Array.prototype.slice.call(aboutView.querySelectorAll('.meta-field'))
    : [];
  var aboutTimers = [];
  var hnArticles = document.getElementById('hn-articles');
  var hnAbout = document.getElementById('hn-about');
  var hnContact = document.getElementById('hn-contact');
  var brandBtn = document.getElementById('brandBtn');
  var backBtn = document.getElementById('back-btn');

  var metaScript = document.getElementById('article-meta');
  var articleData = [];
  try {
    articleData = JSON.parse(metaScript.textContent || '[]');
  } catch (e) {
    articleData = [];
  }

  function center(rect) {
    return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
  }

  function setActiveNav(key) {
    ['articles', 'about', 'contact'].forEach(function (k) {
      var el = document.getElementById('hn-' + k);
      if (el) el.classList.toggle('on', k === key);
    });
  }

  function repel(source, distance) {
    var srcRect = source.getBoundingClientRect();
    var src = center(srcRect);
    cards.forEach(function (card) {
      if (card === source) {
        card.style.transform = 'translate(0px, 0px)';
        card.style.opacity = '1';
        return;
      }
      var r = card.getBoundingClientRect();
      var c = center(r);
      var dx = c.x - src.x;
      var dy = c.y - src.y;
      var mag = Math.sqrt(dx * dx + dy * dy) || 1;
      card.style.transform = 'translate(' + (dx / mag * distance) + 'px, ' + (dy / mag * distance) + 'px)';
      card.classList.add('repelled');
    });
  }

  function resetCards() {
    cards.forEach(function (card) {
      card.classList.remove('repelled');
      card.style.transform = '';
      card.style.opacity = '';
    });
    setTimeout(function () {
      if (state === 'grid') {
        cards.forEach(function (card) { card.classList.remove('exiting'); });
      }
    }, 720);
  }

  function exitOtherCards(card) {
    var viewport = Math.max(window.innerWidth, window.innerHeight);
    var distance = 1.8 * viewport;
    var srcRect = card.getBoundingClientRect();
    var src = center(srcRect);

    cards.forEach(function (c) { c.classList.add('exiting'); });

    cards.forEach(function (other) {
      if (other === card) {
        other.style.transform = 'translate(0px, 0px)';
        other.style.opacity = '1';
        other.classList.remove('repelled');
        return;
      }
      var r = other.getBoundingClientRect();
      var cc = center(r);
      var dx = cc.x - src.x;
      var dy = cc.y - src.y;
      var mag = Math.sqrt(dx * dx + dy * dy) || 1;
      other.style.transform = 'translate(' + ((dx / mag) * distance) + 'px, ' + ((dy / mag) * distance) + 'px)';
      other.style.opacity = '0';
      other.classList.remove('repelled');
    });
  }

  function exitCardsFromPoint(srcX, srcY) {
    var viewport = Math.max(window.innerWidth, window.innerHeight);
    var distance = 1.8 * viewport;
    cards.forEach(function (card) { card.classList.add('exiting'); });
    cards.forEach(function (card) {
      var r = card.getBoundingClientRect();
      var cc = center(r);
      var dx = cc.x - srcX;
      var dy = cc.y - srcY;
      var mag = Math.sqrt(dx * dx + dy * dy) || 1;
      card.style.transform = 'translate(' + ((dx / mag) * distance) + 'px, ' + ((dy / mag) * distance) + 'px)';
      card.style.opacity = '0';
      card.classList.remove('repelled');
    });
  }

  function renderFooter(index) {
    var prev = index > 0 ? articleData[index - 1] : null;
    var next = index < articleData.length - 1 ? articleData[index + 1] : null;
    var html = '';
    if (prev) {
      html += '<div class="article-nav-item prev" data-index="' + prev.index + '" data-slug="' + prev.slug + '">'
        + '<span class="nav-dir">\u2190 Previous</span>'
        + '<span class="nav-title">' + prev.title + '</span>'
        + '</div>';
    } else {
      html += '<div class="article-nav-item"></div>';
    }
    if (next) {
      html += '<div class="article-nav-item next" data-index="' + next.index + '" data-slug="' + next.slug + '">'
        + '<span class="nav-dir">Next \u2192</span>'
        + '<span class="nav-title">' + next.title + '</span>'
        + '</div>';
    } else {
      html += '<div class="article-nav-item"></div>';
    }
    artFooter.innerHTML = html;
  }

  function highlightSidebar(index) {
    sidebarItems.forEach(function (li) {
      li.classList.toggle('active', parseInt(li.dataset.index, 10) === index);
    });
  }

  function loadArticle(slug, index) {
    var data = articleData[index];
    if (!data) return;

    headerImg.className = 'article-header-img c' + data.colorIdx;

    artTitle.textContent = data.title;
    artDate.textContent = data.date;
    artTags.innerHTML = (data.tags || [])
      .map(function (t) { return '<span class="tag">' + t + '</span>'; })
      .join('');

    var src = document.getElementById('body-' + slug);
    artBody.innerHTML = src ? src.innerHTML : '';

    renderFooter(index);
    highlightSidebar(index);
    articleMain.scrollTop = 0;
  }

  function staggerSidebarIn() {
    sidebarItems.forEach(function (li, i) {
      setTimeout(function () { li.classList.add('visible'); }, i * 60);
    });
  }

  function clearSidebarStagger() {
    sidebarItems.forEach(function (li) { li.classList.remove('visible'); });
  }

  function resetHeaderFlip() {
    headerImg.style.transition = 'none';
    headerImg.style.transform = '';
  }

  function openArticle(card) {
    if (state !== 'grid') return;
    state = 'busy';
    setActiveNav('articles');

    var graphicEl = card.querySelector('.graphic');
    var index = parseInt(card.dataset.index, 10);
    var slug = card.dataset.slug;

    exitOtherCards(card);

    var first = graphicEl.getBoundingClientRect();

    articleView.classList.add('visible');
    loadArticle(slug, index);

    var last = headerImg.getBoundingClientRect();
    var scaleX = first.width / last.width;
    var scaleY = first.height / last.height;
    var tx = first.left - last.left;
    var ty = first.top - last.top;

    headerImg.style.transition = 'none';
    headerImg.style.transformOrigin = 'top left';
    headerImg.style.transform =
      'translate(' + tx + 'px, ' + ty + 'px) scale(' + scaleX + ', ' + scaleY + ')';
    void headerImg.getBoundingClientRect();
    headerImg.style.transition = 'transform var(--dur) var(--ease)';
    headerImg.style.transform = '';

    setTimeout(function () {
      articleView.classList.add('sidebar-in');
      staggerSidebarIn();
    }, 200);

    setTimeout(function () {
      articleView.classList.add('meta-in');
    }, 350);

    setTimeout(function () {
      articleView.classList.add('body-in');
      gridView.classList.add('hidden');
      state = 'article';
    }, 550);
  }

  function switchArticle(slug, index) {
    if (state !== 'article') return;
    var data = articleData[index];
    if (!data) return;
    state = 'busy';
    articleMain.style.transition = 'opacity 200ms var(--ease)';
    articleMain.style.opacity = '0';
    setTimeout(function () {
      loadArticle(slug, index);
      articleMain.style.opacity = '1';
      setTimeout(function () {
        articleMain.style.transition = '';
        state = 'article';
      }, 220);
    }, 210);
  }

  function goBack() {
    if (state === 'grid' || state === 'busy') return;
    var prev = state;
    state = 'busy';
    setActiveNav('articles');

    aboutView.classList.remove('visible');
    contactView.classList.remove('visible');
    clearAboutStagger();

    if (prev === 'article') {
      articleView.classList.remove('body-in', 'meta-in');
      setTimeout(function () {
        articleView.classList.remove('sidebar-in');
        clearSidebarStagger();
      }, 60);
      setTimeout(function () {
        articleView.classList.remove('visible');
        resetHeaderFlip();
        gridView.classList.remove('hidden');
        resetCards();
      }, 280);
      setTimeout(function () { state = 'grid'; }, 1000);
    } else {
      gridView.classList.remove('hidden');
      resetCards();
      setTimeout(function () { state = 'grid'; }, 900);
    }
  }

  function staggerAboutIn() {
    if (!aboutStage) return;
    clearAboutStagger();
    aboutStage.classList.add('in');
    aboutFields.forEach(function (f, i) {
      var t = setTimeout(function () { f.classList.add('in'); }, 200 + i * 70);
      aboutTimers.push(t);
    });
  }

  function clearAboutStagger() {
    aboutTimers.forEach(function (t) { clearTimeout(t); });
    aboutTimers = [];
    if (aboutStage) aboutStage.classList.remove('in');
    aboutFields.forEach(function (f) { f.classList.remove('in'); });
  }

  function openMeta(which, navEl) {
    if (state === which || state === 'busy') return;
    var prev = state;
    state = 'busy';
    setActiveNav(which);

    if (prev === 'article') {
      articleView.classList.remove('body-in', 'meta-in', 'sidebar-in');
      clearSidebarStagger();
      setTimeout(function () {
        articleView.classList.remove('visible');
        resetHeaderFlip();
      }, 260);
    }

    var navRect = navEl.getBoundingClientRect();
    var c = center(navRect);
    exitCardsFromPoint(c.x, c.y);

    if (which === 'about') {
      contactView.classList.remove('visible');
      aboutView.classList.add('visible');
      staggerAboutIn();
    } else {
      aboutView.classList.remove('visible');
      contactView.classList.add('visible');
      clearAboutStagger();
    }

    setTimeout(function () { state = which; }, 600);
  }

  cards.forEach(function (card) {
    card.addEventListener('mouseenter', function () {
      if (state !== 'grid') return;
      repel(card, 10);
    });
    card.addEventListener('mouseleave', function () {
      if (state !== 'grid') return;
      resetCards();
    });
    card.addEventListener('click', function () {
      if (state === 'grid') openArticle(card);
    });
  });

  sidebarItems.forEach(function (li) {
    li.addEventListener('click', function () {
      var idx = parseInt(li.dataset.index, 10);
      switchArticle(li.dataset.slug, idx);
    });
  });

  artFooter.addEventListener('click', function (e) {
    var item = e.target.closest('.article-nav-item');
    if (!item || !item.dataset.slug) return;
    var idx = parseInt(item.dataset.index, 10);
    switchArticle(item.dataset.slug, idx);
  });

  if (backBtn) backBtn.addEventListener('click', goBack);

  if (brandBtn) brandBtn.addEventListener('click', function (e) {
    e.preventDefault();
    goBack();
  });

  if (hnArticles) hnArticles.addEventListener('click', function (e) {
    e.preventDefault();
    goBack();
  });

  if (hnAbout) hnAbout.addEventListener('click', function (e) {
    e.preventDefault();
    openMeta('about', hnAbout);
  });

  if (hnContact) hnContact.addEventListener('click', function (e) {
    e.preventDefault();
    openMeta('contact', hnContact);
  });
})();
