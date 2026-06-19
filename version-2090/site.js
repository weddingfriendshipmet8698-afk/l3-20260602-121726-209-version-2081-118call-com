(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileMenu = document.querySelector('[data-mobile-menu]');

  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', function () {
      mobileMenu.classList.toggle('open');
    });
  }

  document.querySelectorAll('[data-hero]').forEach(function (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var previous = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var active = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }

      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, current) {
        slide.classList.toggle('active', current === active);
      });
      dots.forEach(function (dot, current) {
        dot.classList.toggle('active', current === active);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(active + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (previous) {
      previous.addEventListener('click', function () {
        show(active - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(active + 1);
        start();
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
        start();
      });
    });

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  });

  function readText(element) {
    return (element || '').toString().trim().toLowerCase();
  }

  document.querySelectorAll('[data-filter-form]').forEach(function (form) {
    var queryInput = form.querySelector('[data-filter-query]');
    var typeSelect = form.querySelector('[data-filter-type]');
    var yearSelect = form.querySelector('[data-filter-year]');
    var section = form.closest('section') || document;
    var cards = Array.prototype.slice.call(section.querySelectorAll('.filter-card'));
    var empty = section.querySelector('[data-empty-state]');
    var params = new URLSearchParams(window.location.search);
    var q = params.get('q');

    if (q && queryInput) {
      queryInput.value = q;
    }

    function applyFilter() {
      var query = readText(queryInput ? queryInput.value : '');
      var type = readText(typeSelect ? typeSelect.value : '');
      var year = readText(yearSelect ? yearSelect.value : '');
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = readText(card.getAttribute('data-search'));
        var cardType = readText(card.getAttribute('data-type'));
        var cardYear = readText(card.getAttribute('data-year'));
        var matched = true;

        if (query && haystack.indexOf(query) === -1) {
          matched = false;
        }

        if (type && cardType !== type) {
          matched = false;
        }

        if (year && cardYear !== year) {
          matched = false;
        }

        card.classList.toggle('is-hidden-by-filter', !matched);
        if (matched) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('show', visible === 0);
      }
    }

    form.addEventListener('input', applyFilter);
    form.addEventListener('change', applyFilter);
    applyFilter();
  });

  document.querySelectorAll('[data-player]').forEach(function (player) {
    var video = player.querySelector('video');
    var overlay = player.querySelector('[data-play]');
    var stream = player.getAttribute('data-stream');
    var loaded = false;
    var waitingPlay = false;
    var hlsInstance = null;

    function startPlayback() {
      if (!video) {
        return;
      }

      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {});
      }
    }

    function attachStream(autoplay) {
      if (!video || !stream || loaded) {
        return;
      }

      waitingPlay = Boolean(autoplay);

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.on(window.Hls.Events.MEDIA_ATTACHED, function () {
          hlsInstance.loadSource(stream);
        });
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
          if (waitingPlay) {
            waitingPlay = false;
            startPlayback();
          }
        });
        hlsInstance.attachMedia(video);
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
        video.addEventListener('loadedmetadata', function onLoadedMetadata() {
          video.removeEventListener('loadedmetadata', onLoadedMetadata);
          if (waitingPlay) {
            waitingPlay = false;
            startPlayback();
          }
        });
      } else {
        video.src = stream;
        startPlayback();
      }

      loaded = true;
    }

    function playVideo() {
      if (overlay) {
        overlay.classList.add('is-hidden');
      }

      if (!loaded) {
        attachStream(true);
      } else {
        startPlayback();
      }
    }

    if (overlay) {
      overlay.addEventListener('click', playVideo);
    }

    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          playVideo();
        }
      });
      video.addEventListener('play', function () {
        if (overlay) {
          overlay.classList.add('is-hidden');
        }
      });
      window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    }
  });
})();
