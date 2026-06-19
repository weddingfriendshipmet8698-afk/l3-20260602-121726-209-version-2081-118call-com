(function () {
  function selectAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function initImageFallbacks() {
    selectAll('img').forEach(function (image) {
      image.addEventListener('error', function () {
        var frame = image.closest('.poster-frame, .detail-poster');
        if (frame) {
          frame.classList.add('no-image');
        }
        image.remove();
      });
    });
  }

  function initFilters() {
    var input = document.querySelector('[data-filter-input]');
    if (!input) {
      return;
    }

    var scope = document.querySelector('[data-filter-scope]') || document;
    var cards = selectAll('[data-filter-card]', scope);

    input.addEventListener('input', function () {
      var keyword = input.value.trim().toLowerCase();
      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute('data-title'),
          card.getAttribute('data-year'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-region'),
          card.textContent
        ].join(' ').toLowerCase();

        card.classList.toggle('is-hidden', keyword && haystack.indexOf(keyword) === -1);
      });
    });
  }

  function initHeroCarousel() {
    var slides = selectAll('[data-hero-slide]');
    var dots = selectAll('[data-hero-dot]');
    if (slides.length <= 1) {
      return;
    }

    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });

    var carousel = document.querySelector('[data-hero-carousel]');
    if (carousel) {
      carousel.addEventListener('mouseenter', stop);
      carousel.addEventListener('mouseleave', start);
    }

    start();
  }

  function initPlayer() {
    var video = document.querySelector('[data-player]');
    if (!video) {
      return;
    }

    var button = document.querySelector('[data-play-button]');
    var status = document.querySelector('[data-player-status]');
    var source = video.getAttribute('data-video-src');
    var hlsInstance = null;

    function setStatus(message) {
      if (status) {
        status.textContent = message;
      }
    }

    function loadAndPlay() {
      if (!source) {
        setStatus('未检测到播放源。');
        return;
      }

      if (button) {
        button.classList.add('is-hidden');
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        setStatus('正在加载原生 HLS 播放源。');
        video.play().catch(function () {
          setStatus('浏览器已阻止自动播放，请再次点击播放器。');
        });
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
          setStatus('播放源加载完成。');
          video.play().catch(function () {
            setStatus('请点击播放器继续播放。');
          });
        });
        hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            setStatus('播放源加载失败，请检查网络或 m3u8 地址。');
            hlsInstance.destroy();
            hlsInstance = null;
          }
        });
        return;
      }

      setStatus('当前浏览器需要 HLS 支持，请确认播放器脚本可以正常加载。');
    }

    if (button) {
      button.addEventListener('click', loadAndPlay);
    }
    video.addEventListener('play', function () {
      if (button) {
        button.classList.add('is-hidden');
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initImageFallbacks();
    initFilters();
    initHeroCarousel();
    initPlayer();
  });
})();
