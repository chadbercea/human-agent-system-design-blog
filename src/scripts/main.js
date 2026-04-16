(function () {
  var state = 'grid';
  var grid = document.getElementById('grid');
  if (!grid) return;
  var cards = Array.prototype.slice.call(grid.querySelectorAll('.card'));
  if (!cards.length) return;

  function center(rect) {
    return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
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
      var nx = dx / mag;
      var ny = dy / mag;
      card.style.transform = 'translate(' + (nx * distance) + 'px, ' + (ny * distance) + 'px)';
      card.classList.add('repelled');
    });
  }

  function resetCards() {
    cards.forEach(function (card) {
      card.style.transform = 'translate(0px, 0px)';
      card.style.opacity = '';
      card.classList.remove('repelled');
    });
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
      if (state !== 'grid') return;
      state = 'busy';
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
        var nx = dx / mag;
        var ny = dy / mag;
        other.style.transform = 'translate(' + (nx * distance) + 'px, ' + (ny * distance) + 'px)';
        other.style.opacity = '0';
        other.classList.remove('repelled');
      });
    });
  });
})();
