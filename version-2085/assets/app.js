(function () {
  var menuButton = document.querySelector('[data-menu-button]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var current = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    current = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('active', slideIndex === current);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('active', dotIndex === current);
    });
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      showSlide(index);
    });
  });

  if (slides.length > 1) {
    setInterval(function () {
      showSlide(current + 1);
    }, 5200);
  }

  var filterInput = document.querySelector('[data-filter-input]');
  var yearSelect = document.querySelector('[data-year-select]');
  var genreSelect = document.querySelector('[data-genre-select]');
  var filterCards = Array.prototype.slice.call(document.querySelectorAll('[data-title]'));

  function matchCard(card) {
    var keyword = filterInput ? filterInput.value.trim().toLowerCase() : '';
    var year = yearSelect ? yearSelect.value : '';
    var genre = genreSelect ? genreSelect.value : '';
    var haystack = [
      card.getAttribute('data-title'),
      card.getAttribute('data-region'),
      card.getAttribute('data-genre')
    ].join(' ').toLowerCase();

    var keywordOk = !keyword || haystack.indexOf(keyword) !== -1;
    var yearOk = !year || card.getAttribute('data-year') === year;
    var genreOk = !genre || (card.getAttribute('data-genre') || '').indexOf(genre) !== -1;

    return keywordOk && yearOk && genreOk;
  }

  function applyFilters() {
    filterCards.forEach(function (card) {
      card.style.display = matchCard(card) ? '' : 'none';
    });
  }

  [filterInput, yearSelect, genreSelect].forEach(function (control) {
    if (control) {
      control.addEventListener('input', applyFilters);
      control.addEventListener('change', applyFilters);
    }
  });

  var searchInput = document.querySelector('[data-global-search]');
  var searchResults = document.querySelector('[data-search-results]');

  function renderSearchResults(items) {
    if (!searchResults) {
      return;
    }

    searchResults.innerHTML = items.map(function (item) {
      var tags = item.tags.slice(0, 3).map(function (tag) {
        return '<span>' + tag + '</span>';
      }).join('');

      return '' +
        '<a class="movie-card" href="' + item.url + '" data-title="' + item.title + '" data-year="' + item.year + '" data-region="' + item.region + '" data-genre="' + item.genre + '">' +
          '<div class="poster-frame">' +
            '<img src="' + item.cover + '" alt="' + item.title + '" loading="lazy" onerror="this.remove()">' +
            '<div class="poster-shade"></div>' +
            '<span class="play-badge">▶</span>' +
          '</div>' +
          '<div class="card-body">' +
            '<h3>' + item.title + '</h3>' +
            '<p>' + item.oneLine + '</p>' +
            '<div class="meta-line"><span>' + item.region + '</span><span>' + item.year + '</span><span>' + item.type + '</span></div>' +
            '<div class="tag-row">' + tags + '</div>' +
          '</div>' +
        '</a>';
    }).join('');
  }

  function applyGlobalSearch() {
    if (!searchInput || !window.SEARCH_MOVIES) {
      return;
    }

    var keyword = searchInput.value.trim().toLowerCase();
    var results = window.SEARCH_MOVIES.filter(function (item) {
      var haystack = [item.title, item.region, item.type, item.genre, item.tags.join(' '), item.oneLine].join(' ').toLowerCase();
      return !keyword || haystack.indexOf(keyword) !== -1;
    }).slice(0, 80);

    renderSearchResults(results);
  }

  if (searchInput && window.SEARCH_MOVIES) {
    renderSearchResults(window.SEARCH_MOVIES.slice(0, 48));
    searchInput.addEventListener('input', applyGlobalSearch);
  }
})();
