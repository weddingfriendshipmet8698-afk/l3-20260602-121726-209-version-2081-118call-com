(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function initMobileMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (!toggle || !panel) {
      return;
    }

    toggle.addEventListener("click", function () {
      panel.classList.toggle("is-open");
    });
  }

  function initHeroSlider() {
    var slider = document.querySelector("[data-hero-slider]");
    if (!slider) {
      return;
    }

    var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
    var prev = slider.querySelector("[data-hero-prev]");
    var next = slider.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
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

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
        start();
      });
    });

    slider.addEventListener("mouseenter", stop);
    slider.addEventListener("mouseleave", start);

    show(0);
    start();
  }

  function initSearchForms() {
    var forms = Array.prototype.slice.call(document.querySelectorAll("[data-search-form]"));
    forms.forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var input = form.querySelector("[data-search-input]");
        var query = input ? input.value.trim() : "";
        var target = "index.html#library";
        if (query) {
          target += "?q=" + encodeURIComponent(query);
        }
        window.location.href = target;
      });
    });
  }

  function applyPageFilters() {
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
    if (!cards.length) {
      return;
    }

    var searchInput = document.querySelector("[data-page-search]");
    var categorySelect = document.querySelector("[data-category-filter]");
    var sortSelect = document.querySelector("[data-year-sort]");
    var grid = document.querySelector("[data-card-grid]");
    var resultCount = document.querySelector("[data-result-count]");

    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get("q") || "";
    if (initialQuery && searchInput) {
      searchInput.value = initialQuery;
      var library = document.getElementById("library");
      if (library) {
        window.setTimeout(function () {
          library.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 80);
      }
    }

    function normalize(value) {
      return String(value || "").toLowerCase();
    }

    function filterAndSort() {
      var query = normalize(searchInput ? searchInput.value : "");
      var category = categorySelect ? categorySelect.value : "";
      var visible = 0;

      cards.forEach(function (card) {
        var text = normalize(card.getAttribute("data-search"));
        var cardCategory = card.getAttribute("data-category") || "";
        var matchedQuery = !query || text.indexOf(query) !== -1;
        var matchedCategory = !category || cardCategory === category;
        var show = matchedQuery && matchedCategory;

        card.classList.toggle("is-hidden", !show);
        if (show) {
          visible += 1;
        }
      });

      if (grid && sortSelect) {
        var direction = sortSelect.value;
        cards
          .slice()
          .sort(function (a, b) {
            var yearA = Number(a.getAttribute("data-year")) || 0;
            var yearB = Number(b.getAttribute("data-year")) || 0;
            return direction === "asc" ? yearA - yearB : yearB - yearA;
          })
          .forEach(function (card) {
            grid.appendChild(card);
          });
      }

      if (resultCount) {
        resultCount.textContent = "当前显示 " + visible + " 部影片";
      }
    }

    if (searchInput) {
      searchInput.addEventListener("input", filterAndSort);
    }

    if (categorySelect) {
      categorySelect.addEventListener("change", filterAndSort);
    }

    if (sortSelect) {
      sortSelect.addEventListener("change", filterAndSort);
    }

    filterAndSort();
  }

  function initPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
    players.forEach(function (box) {
      var video = box.querySelector("video");
      var trigger = box.querySelector("[data-play-trigger]");
      var src = box.getAttribute("data-m3u8");
      var hls = null;
      var bound = false;

      if (!video || !src) {
        return;
      }

      function bindSource() {
        if (bound) {
          return;
        }

        bound = true;

        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: false
          });

          hls.loadSource(src);
          hls.attachMedia(video);

          hls.on(window.Hls.Events.ERROR, function (eventName, data) {
            if (!data || !data.fatal) {
              return;
            }

            if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
              hls.startLoad();
            } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
              hls.recoverMediaError();
            } else {
              hls.destroy();
            }
          });
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = src;
        } else {
          video.src = src;
        }
      }

      function play() {
        bindSource();
        box.classList.add("is-playing");
        var promise = video.play();
        if (promise && typeof promise.catch === "function") {
          promise.catch(function () {});
        }
      }

      if (trigger) {
        trigger.addEventListener("click", play);
      }

      video.addEventListener("click", function () {
        if (video.paused) {
          play();
        }
      });

      video.addEventListener("play", function () {
        box.classList.add("is-playing");
      });

      window.addEventListener("beforeunload", function () {
        if (hls) {
          hls.destroy();
        }
      });
    });
  }

  ready(function () {
    initMobileMenu();
    initHeroSlider();
    initSearchForms();
    applyPageFilters();
    initPlayers();
  });
})();
