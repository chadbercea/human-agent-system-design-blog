(function () {
  var state = 'grid';
  var track = document.getElementById('track');
  if (!track) return;
  var cards = Array.prototype.slice.call(track.querySelectorAll('.card'));
  if (!cards.length) return;

  var CARD_W = 260;
  var CARD_GAP = 32;
  var STEP = CARD_W + CARD_GAP;
  var TOTAL = cards.length;

  var trackWrap = document.getElementById('track-wrap');
  var btnPrev = document.getElementById('btn-prev');
  var btnNext = document.getElementById('btn-next');
  var dotsEl = document.getElementById('dots');

  var currentIndex = 0;
  var currentOffset = 0;
  var isDragging = false;
  var dragStartX = 0;
  var dragStartOffset = 0;
  var dragMoved = false;
  var wheelTimer = null;

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
  var contactStage = contactView ? contactView.querySelector('.meta-stage') : null;
  var contactCols = contactView
    ? Array.prototype.slice.call(contactView.querySelectorAll('.contact-col'))
    : [];
  var contactTimers = [];
  var cfForm = document.getElementById('cf-form');
  var cfSubject = document.getElementById('cf-subject');
  var cfMessage = document.getElementById('cf-message');
  var cfReply = document.getElementById('cf-reply');
  var cfSubmit = document.getElementById('cf-submit');
  var cfSuccess = document.getElementById('cf-success');
  var cfBook = document.getElementById('cf-book');
  var schedSlotsEl = document.getElementById('sched-slots');
  var schedEmail = document.getElementById('sched-email');
  var selectedSlot = null;
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
    clearContactStagger();
    resetContactForm();

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
      clearContactStagger();
      resetContactForm();
      aboutView.classList.add('visible');
      staggerAboutIn();
    } else {
      aboutView.classList.remove('visible');
      clearAboutStagger();
      buildSlots();
      contactView.classList.add('visible');
      staggerContactIn();
    }

    setTimeout(function () { state = which; }, 600);
  }

  function staggerContactIn() {
    clearContactStagger();
    if (contactStage) contactStage.classList.add('in');
    contactCols.forEach(function (col, i) {
      var t = setTimeout(function () { col.classList.add('in'); }, 120 + i * 120);
      contactTimers.push(t);
    });
  }

  function clearContactStagger() {
    contactTimers.forEach(function (t) { clearTimeout(t); });
    contactTimers = [];
    if (contactStage) contactStage.classList.remove('in');
    contactCols.forEach(function (col) { col.classList.remove('in'); });
  }

  function formatSlotLabel(d) {
    var days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return days[d.getDay()] + ', ' + months[d.getMonth()] + ' ' + d.getDate() + ' \u2014 10:00 AM MT';
  }

  function computeSlots() {
    var SLOT_UTC_HOUR = 16; // 10am MT (MDT) = 16:00 UTC
    var result = [];
    var now = new Date();
    var d = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    var guard = 0;
    while (result.length < 6 && guard++ < 60) {
      var dow = d.getDay();
      if (dow === 2 || dow === 4) {
        var startUTC = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), SLOT_UTC_HOUR, 0, 0));
        if (startUTC.getTime() > now.getTime()) {
          result.push({ start: startUTC, label: formatSlotLabel(d) });
        }
      }
      d.setDate(d.getDate() + 1);
    }
    return result;
  }

  function buildSlots() {
    if (!schedSlotsEl) return;
    schedSlotsEl.innerHTML = '';
    selectedSlot = null;
    var slots = computeSlots();
    slots.forEach(function (slot) {
      var el = document.createElement('div');
      el.className = 'sched-slot';
      el.setAttribute('role', 'radio');
      el.setAttribute('aria-checked', 'false');
      el.innerHTML = '<span class="slot-radio"></span><span class="slot-label">' + slot.label + '</span>';
      el.addEventListener('click', function () { selectSlot(el, slot); });
      schedSlotsEl.appendChild(el);
    });
  }

  function selectSlot(el, slot) {
    if (!schedSlotsEl) return;
    Array.prototype.forEach.call(schedSlotsEl.querySelectorAll('.sched-slot'), function (s) {
      s.classList.remove('selected');
      s.setAttribute('aria-checked', 'false');
    });
    el.classList.add('selected');
    el.setAttribute('aria-checked', 'true');
    selectedSlot = slot;
  }

  function gcalStamp(d) {
    return d.toISOString().replace(/[-:]|\.\d{3}/g, '');
  }

  function buildCalendarURL(slot, inviteeEmail) {
    var start = slot.start;
    var end = new Date(start.getTime() + 30 * 60 * 1000);
    var params = [
      'action=TEMPLATE',
      'text=' + encodeURIComponent('30-Minute Call with Chad Bercea'),
      'dates=' + gcalStamp(start) + '/' + gcalStamp(end),
      'details=' + encodeURIComponent('30-minute conversation. Video call link will be shared in the invite.'),
      'location=' + encodeURIComponent('Google Meet')
    ];
    if (inviteeEmail) params.push('add=' + encodeURIComponent(inviteeEmail));
    return 'https://calendar.google.com/calendar/render?' + params.join('&');
  }

  function resetContactForm() {
    if (cfForm) cfForm.reset();
    if (schedEmail) schedEmail.value = '';
    if (cfSubmit) cfSubmit.classList.remove('hidden');
    if (cfSuccess) cfSuccess.classList.remove('in');
    if (schedSlotsEl) {
      Array.prototype.forEach.call(schedSlotsEl.querySelectorAll('.sched-slot'), function (s) {
        s.classList.remove('selected');
        s.setAttribute('aria-checked', 'false');
      });
    }
    selectedSlot = null;
  }

  if (cfForm) {
    cfForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var subject = (cfSubject.value || '').trim();
      var message = (cfMessage.value || '').trim();
      var reply = (cfReply.value || '').trim();
      if (!subject || !message || !reply) return;
      var body = message + '\n\n\u2014\nReply to: ' + reply;
      var href = 'mailto:chad@hasdesign.io?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
      window.location.href = href;
      cfSubmit.classList.add('hidden');
      cfSuccess.classList.add('in');
    });
  }

  if (cfBook) {
    cfBook.addEventListener('click', function () {
      if (!selectedSlot) return;
      var email = (schedEmail.value || '').trim();
      if (!email) return;
      var url = buildCalendarURL(selectedSlot, email);
      window.open(url, '_blank', 'noopener');
    });
  }

  cards.forEach(function (card) {
    card.addEventListener('mouseenter', function () {
      if (state !== 'grid' || isDragging) return;
      repel(card, 10);
    });
    card.addEventListener('mouseleave', function () {
      if (state !== 'grid' || isDragging) return;
      resetCards();
    });
    card.addEventListener('click', function () {
      if (dragMoved) return;
      if (state === 'grid') openArticle(card);
    });
  });

  function maxOffset() {
    if (!trackWrap) return 0;
    var trackW = TOTAL * CARD_W + (TOTAL - 1) * CARD_GAP;
    var wrapW = trackWrap.offsetWidth - 96;
    return Math.max(0, trackW - wrapW);
  }

  function setOffset(x, animate) {
    x = Math.max(-maxOffset(), Math.min(0, x));
    currentOffset = x;
    track.style.transition = animate
      ? 'transform 0.55s cubic-bezier(0.25,0.46,0.45,0.94)'
      : 'none';
    track.style.transform = 'translateX(' + x + 'px)';
    var idx = Math.round(-x / STEP);
    idx = Math.max(0, Math.min(TOTAL - 1, idx));
    setActiveIndex(idx);
  }

  function setActiveIndex(idx) {
    currentIndex = idx;
    if (dotsEl) {
      Array.prototype.forEach.call(dotsEl.querySelectorAll('.dot'), function (d, i) {
        d.classList.toggle('on', i === idx);
      });
    }
    if (btnPrev) btnPrev.disabled = idx === 0;
    if (btnNext) btnNext.disabled = idx >= TOTAL - 1;
  }

  function goTo(idx) {
    idx = Math.max(0, Math.min(TOTAL - 1, idx));
    setOffset(-idx * STEP, true);
    setActiveIndex(idx);
  }

  if (dotsEl) {
    dotsEl.innerHTML = '';
    for (var di = 0; di < TOTAL; di++) {
      (function (i) {
        var d = document.createElement('div');
        d.className = 'dot' + (i === 0 ? ' on' : '');
        d.addEventListener('click', function () { goTo(i); });
        dotsEl.appendChild(d);
      })(di);
    }
  }

  if (btnPrev) btnPrev.addEventListener('click', function () { goTo(currentIndex - 1); });
  if (btnNext) btnNext.addEventListener('click', function () { goTo(currentIndex + 1); });

  document.addEventListener('keydown', function (e) {
    if (state !== 'grid') return;
    var tag = (e.target && e.target.tagName) || '';
    if (tag === 'INPUT' || tag === 'TEXTAREA') return;
    if (e.key === 'ArrowLeft') goTo(currentIndex - 1);
    else if (e.key === 'ArrowRight') goTo(currentIndex + 1);
  });

  track.addEventListener('mousedown', function (e) {
    if (state !== 'grid') return;
    isDragging = true;
    dragMoved = false;
    dragStartX = e.clientX;
    dragStartOffset = currentOffset;
    track.classList.add('dragging');
    e.preventDefault();
  });

  document.addEventListener('mousemove', function (e) {
    if (!isDragging) return;
    var dx = e.clientX - dragStartX;
    if (Math.abs(dx) > 3) dragMoved = true;
    setOffset(dragStartOffset + dx, false);
  });

  document.addEventListener('mouseup', function () {
    if (!isDragging) return;
    isDragging = false;
    track.classList.remove('dragging');
    var idx = Math.round(-currentOffset / STEP);
    goTo(idx);
  });

  track.addEventListener('touchstart', function (e) {
    if (state !== 'grid') return;
    dragStartX = e.touches[0].clientX;
    dragStartOffset = currentOffset;
    dragMoved = false;
    track.classList.add('dragging');
  }, { passive: true });

  track.addEventListener('touchmove', function (e) {
    var dx = e.touches[0].clientX - dragStartX;
    if (Math.abs(dx) > 3) dragMoved = true;
    setOffset(dragStartOffset + dx, false);
  }, { passive: true });

  track.addEventListener('touchend', function () {
    track.classList.remove('dragging');
    var idx = Math.round(-currentOffset / STEP);
    goTo(idx);
  });

  if (trackWrap) {
    trackWrap.addEventListener('wheel', function (e) {
      if (state !== 'grid') return;
      e.preventDefault();
      var delta = e.deltaX || e.deltaY;
      setOffset(currentOffset - delta, false);
      if (wheelTimer) clearTimeout(wheelTimer);
      wheelTimer = setTimeout(function () {
        var idx = Math.round(-currentOffset / STEP);
        goTo(idx);
      }, 120);
    }, { passive: false });
  }

  setActiveIndex(0);

  var thumb3 = document.querySelector('.c3 .thumb');
  if (thumb3) {
    thumb3.addEventListener('mouseenter', function () {
      ['pkt1', 'pkt2', 'pkt3', 'pkt4'].forEach(function (id) {
        var el = document.getElementById(id);
        if (el) el.beginElement();
      });
    });
  }
  var thumb6 = document.querySelector('.c6 .thumb');
  if (thumb6) {
    thumb6.addEventListener('mouseenter', function () {
      var anim = document.getElementById('tracer-anim');
      if (anim) anim.beginElement();
    });
  }

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
