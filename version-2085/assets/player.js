(function () {
  var boxes = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));

  boxes.forEach(function (box) {
    var video = box.querySelector('video');
    var overlay = box.querySelector('[data-player-overlay]');
    var playButton = box.querySelector('[data-play-button]');
    var muteButton = box.querySelector('[data-mute-button]');
    var fullButton = box.querySelector('[data-full-button]');
    var source = box.getAttribute('data-source');
    var hlsInstance = null;

    if (!video || !source) {
      return;
    }

    function loadSource() {
      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else {
        video.src = source;
      }
    }

    function playOrPause() {
      if (video.paused) {
        var playPromise = video.play();
        if (playPromise && playPromise.catch) {
          playPromise.catch(function () {});
        }
      } else {
        video.pause();
      }
    }

    function toggleOverlay() {
      if (!overlay) {
        return;
      }
      overlay.classList.toggle('hidden', !video.paused);
    }

    if (playButton) {
      playButton.addEventListener('click', playOrPause);
    }

    video.addEventListener('click', playOrPause);
    video.addEventListener('play', toggleOverlay);
    video.addEventListener('pause', toggleOverlay);
    video.addEventListener('ended', toggleOverlay);

    if (muteButton) {
      muteButton.addEventListener('click', function () {
        video.muted = !video.muted;
        muteButton.textContent = video.muted ? '🔇' : '🔊';
      });
    }

    if (fullButton) {
      fullButton.addEventListener('click', function () {
        if (document.fullscreenElement) {
          document.exitFullscreen();
        } else if (box.requestFullscreen) {
          box.requestFullscreen();
        }
      });
    }

    loadSource();
  });
})();
