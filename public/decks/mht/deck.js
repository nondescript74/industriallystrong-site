const slides = document.querySelectorAll('.slide');
const counter = document.getElementById('counter');
const progress = document.getElementById('progress');
const btnPause = document.getElementById('btnPause');
const TOTAL = slides.length;
const AUTO_MS = 9000;
let current = 0;
let paused = false;
let timer = null;

function goTo(n) {
  slides[current].classList.remove('active');
  current = (n + TOTAL) % TOTAL;
  slides[current].classList.add('active');
  counter.textContent = String(current + 1).padStart(2, '0') + ' / ' + String(TOTAL).padStart(2, '0');
  progress.style.width = ((current + 1) / TOTAL) * 100 + '%';
}

function changeSlide(dir) {
  goTo(current + dir);
  if (!paused) resetTimer();
}

function resetTimer() {
  clearTimeout(timer);
  timer = setTimeout(function() { changeSlide(1); }, AUTO_MS);
}

function togglePause() {
  paused = !paused;
  btnPause.textContent = paused ? 'PLAY' : 'PAUSE';
  if (paused) {
    clearTimeout(timer);
  } else {
    resetTimer();
  }
}

// Button handlers (replaces inline onclick)
document.getElementById('btnPrev').addEventListener('click', function() { changeSlide(-1); });
document.getElementById('btnPause').addEventListener('click', togglePause);
document.getElementById('btnNext').addEventListener('click', function() { changeSlide(1); });

// Keyboard navigation
document.addEventListener('keydown', function(e) {
  if (e.key === 'ArrowRight') changeSlide(1);
  if (e.key === 'ArrowLeft') changeSlide(-1);
  if (e.key === ' ') {
    e.preventDefault();
    togglePause();
  }
});

// Tooltip system
var globalTooltip = document.getElementById('globalTooltip');
var globalTooltipTitle = document.getElementById('globalTooltipTitle');
var globalTooltipText = document.getElementById('globalTooltipText');

function positionTooltip(e) {
  var pad = 18;
  var rect = globalTooltip.getBoundingClientRect();
  var x = e.clientX + 18;
  var y = e.clientY + 18;

  if (x + rect.width + pad > window.innerWidth) {
    x = window.innerWidth - rect.width - pad;
  }
  if (y + rect.height + pad > window.innerHeight) {
    y = e.clientY - rect.height - 18;
  }
  if (y < pad) y = pad;
  if (x < pad) x = pad;

  globalTooltip.style.left = x + 'px';
  globalTooltip.style.top = y + 'px';
}

document.querySelectorAll('.help-target').forEach(function(el) {
  el.addEventListener('mouseenter', function(e) {
    globalTooltipTitle.textContent = el.dataset.tipTitle || '';
    globalTooltipText.textContent = el.dataset.tipText || '';
    globalTooltip.classList.add('show');
    positionTooltip(e);
  });

  el.addEventListener('mousemove', function(e) {
    positionTooltip(e);
  });

  el.addEventListener('mouseleave', function() {
    globalTooltip.classList.remove('show');
  });
});

goTo(0);
resetTimer();
