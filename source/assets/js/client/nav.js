'use strict';

(function () {
  var toggle = document.querySelector('.nav-toggle');
  var menu = document.getElementById('nav-menu');

  if (!toggle || !menu) return;

  toggle.addEventListener('click', function () {
    var expanded = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!expanded));
    menu.classList.toggle('is-open', !expanded);
  });

  document.addEventListener('click', function (e) {
    if (!toggle.contains(e.target) && !menu.contains(e.target)) {
      toggle.setAttribute('aria-expanded', 'false');
      menu.classList.remove('is-open');
    }
  });

  menu.addEventListener('click', function (e) {
    if (e.target.closest('a')) {
      toggle.setAttribute('aria-expanded', 'false');
      menu.classList.remove('is-open');
    }
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && menu.classList.contains('is-open')) {
      toggle.setAttribute('aria-expanded', 'false');
      menu.classList.remove('is-open');
      toggle.focus();
    }
  });
}());

/* Scroll-to-top button – show after scrolling down */
(function () {
  var btn = document.querySelector('.scroll-top');
  if (!btn) return;

  var wasHidden = true;
  window.addEventListener('scroll', function () {
    var shouldHide = window.scrollY < 300;
    if (shouldHide !== wasHidden) {
      btn.hidden = shouldHide;
      wasHidden = shouldHide;
    }
  });

  btn.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}());
