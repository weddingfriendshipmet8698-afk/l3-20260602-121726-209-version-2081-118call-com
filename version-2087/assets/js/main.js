(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function initNavigation() {
    var toggle = document.querySelector(".nav-toggle");
    var mobileNav = document.querySelector(".mobile-nav");
    if (!toggle || !mobileNav) {
      return;
    }
    toggle.addEventListener("click", function () {
      var opened = mobileNav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", opened ? "true" : "false");
    });
  }

  function initHero() {
    var hero = document.querySelector(".hero-carousel");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
    var prev = hero.querySelector(".hero-arrow.prev");
    var next = hero.querySelector(".hero-arrow.next");
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
        start();
      });
    });
    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    start();
  }

  function valueOf(selector) {
    var el = document.querySelector(selector);
    return el ? el.value.trim().toLowerCase() : "";
  }

  function initFilters() {
    var inputs = Array.prototype.slice.call(document.querySelectorAll(".js-search, .js-region-filter, .js-type-filter"));
    var scopes = Array.prototype.slice.call(document.querySelectorAll(".js-card-scope"));
    if (!inputs.length || !scopes.length) {
      return;
    }

    function apply() {
      var keyword = valueOf(".js-search");
      var region = valueOf(".js-region-filter");
      var type = valueOf(".js-type-filter");
      scopes.forEach(function (scope) {
        var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card, .ranking-item"));
        var visible = 0;
        cards.forEach(function (card) {
          var haystack = [
            card.getAttribute("data-title"),
            card.getAttribute("data-region"),
            card.getAttribute("data-year"),
            card.getAttribute("data-type"),
            card.getAttribute("data-genre"),
            card.getAttribute("data-tags"),
            card.getAttribute("data-category")
          ].join(" ").toLowerCase();
          var okKeyword = !keyword || haystack.indexOf(keyword) !== -1;
          var okRegion = !region || String(card.getAttribute("data-region") || "").toLowerCase() === region;
          var okType = !type || String(card.getAttribute("data-type") || "").toLowerCase() === type;
          var ok = okKeyword && okRegion && okType;
          card.classList.toggle("is-hidden", !ok);
          if (ok) {
            visible += 1;
          }
        });
        var empty = scope.parentElement ? scope.parentElement.querySelector(".empty-state") : null;
        if (empty) {
          empty.classList.toggle("is-visible", visible === 0);
        }
      });
    }

    inputs.forEach(function (input) {
      input.addEventListener("input", apply);
      input.addEventListener("change", apply);
    });
  }

  function initPlayer() {
    var video = document.getElementById("videoPlayer");
    if (!video) {
      return;
    }
    var sourceElement = video.querySelector("source");
    var source = sourceElement ? sourceElement.getAttribute("src") : "";
    var cover = document.querySelector(".play-cover");

    if (source) {
      if (window.Hls && window.Hls.isSupported() && source.indexOf(".m3u8") !== -1) {
        var hls = new window.Hls({
          enableWorker: true,
          maxBufferLength: 90
        });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else {
        video.src = source;
      }
    }

    function playVideo() {
      if (cover) {
        cover.classList.add("is-hidden");
      }
      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {
          if (cover) {
            cover.classList.remove("is-hidden");
          }
        });
      }
    }

    if (cover) {
      cover.addEventListener("click", playVideo);
    }
    video.addEventListener("play", function () {
      if (cover) {
        cover.classList.add("is-hidden");
      }
    });
    video.addEventListener("ended", function () {
      if (cover) {
        cover.classList.remove("is-hidden");
      }
    });
  }

  ready(function () {
    initNavigation();
    initHero();
    initFilters();
    initPlayer();
  });
})();
