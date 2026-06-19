(function () {
    function qs(selector, scope) {
        return (scope || document).querySelector(selector);
    }

    function qsa(selector, scope) {
        return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
    }

    function normalize(value) {
        return String(value || "").trim().toLowerCase();
    }

    function initMenu() {
        var toggle = qs("[data-menu-toggle]");
        var nav = qs("[data-mobile-nav]");
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener("click", function () {
            nav.classList.toggle("is-open");
        });
    }

    function initHero() {
        var hero = qs("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = qsa("[data-hero-slide]", hero);
        var dots = qsa("[data-hero-dot]", hero);
        var prev = qs("[data-hero-prev]", hero);
        var next = qs("[data-hero-next]", hero);
        var index = 0;
        var timer;

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

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-hero-dot")) || 0);
                start();
            });
        });

        hero.addEventListener("mouseenter", stop);
        hero.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function initFilters() {
        var panel = qs("[data-filter-panel]");
        var grid = qs("[data-card-grid]");
        if (!panel || !grid) {
            return;
        }
        var cards = qsa(".movie-card", grid);
        var input = qs("[data-search-input]", panel);
        var typeSelect = qs("[data-filter-type]", panel);
        var yearSelect = qs("[data-filter-year]", panel);
        var categorySelect = qs("[data-filter-category]", panel);
        var empty = qs("[data-filter-empty]");
        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get("q") || "";

        if (input && initialQuery) {
            input.value = initialQuery;
        }

        function apply() {
            var query = normalize(input && input.value);
            var typeValue = normalize(typeSelect && typeSelect.value);
            var yearValue = normalize(yearSelect && yearSelect.value);
            var categoryValue = normalize(categorySelect && categorySelect.value);
            var visible = 0;

            cards.forEach(function (card) {
                var text = normalize(card.getAttribute("data-search"));
                var type = normalize(card.getAttribute("data-type"));
                var year = normalize(card.getAttribute("data-year"));
                var category = normalize(card.getAttribute("data-category"));
                var match = true;

                if (query && text.indexOf(query) === -1) {
                    match = false;
                }
                if (typeValue && type !== typeValue) {
                    match = false;
                }
                if (yearValue && year !== yearValue) {
                    match = false;
                }
                if (categoryValue && category !== categoryValue) {
                    match = false;
                }

                card.hidden = !match;
                if (match) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.hidden = visible !== 0;
            }
        }

        [input, typeSelect, yearSelect, categorySelect].forEach(function (control) {
            if (control) {
                control.addEventListener("input", apply);
                control.addEventListener("change", apply);
            }
        });

        apply();
    }

    function initPlayers() {
        qsa(".player-card[data-play-url]").forEach(function (card) {
            var video = qs("video", card);
            var button = qs(".play-cover", card);
            var source = card.getAttribute("data-play-url");
            var ready = false;
            var hls;

            if (!video || !source) {
                return;
            }

            function load() {
                if (!ready) {
                    if (video.canPlayType("application/vnd.apple.mpegurl")) {
                        video.src = source;
                    } else if (window.Hls && window.Hls.isSupported()) {
                        hls = new window.Hls({ enableWorker: true });
                        hls.loadSource(source);
                        hls.attachMedia(video);
                    } else {
                        video.src = source;
                    }
                    ready = true;
                }
                card.classList.add("is-playing");
                video.controls = true;
                var attempt = video.play();
                if (attempt && typeof attempt.catch === "function") {
                    attempt.catch(function () {});
                }
            }

            if (button) {
                button.addEventListener("click", load);
            }

            video.addEventListener("click", function () {
                if (video.paused) {
                    load();
                }
            });

            window.addEventListener("beforeunload", function () {
                if (hls && typeof hls.destroy === "function") {
                    hls.destroy();
                }
            });
        });
    }

    document.addEventListener("DOMContentLoaded", function () {
        initMenu();
        initHero();
        initFilters();
        initPlayers();
    });
})();
