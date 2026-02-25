'use strict';

(function () {
  var buttons = document.querySelectorAll('.timeline-header');

  buttons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var isExpanded = btn.getAttribute('aria-expanded') === 'true';
      var panelId = btn.getAttribute('aria-controls');
      var panel = document.getElementById(panelId);

      // Close all other open panels and deactivate their dots
      buttons.forEach(function (otherBtn) {
        if (otherBtn !== btn) {
          otherBtn.setAttribute('aria-expanded', 'false');
          var otherId = otherBtn.getAttribute('aria-controls');
          var otherPanel = document.getElementById(otherId);
          if (otherPanel) otherPanel.hidden = true;
          var otherDot = otherBtn.closest('.timeline-item').querySelector('.timeline-dot');
          if (otherDot) otherDot.classList.remove('active');
        }
      });

      // Toggle this panel and dot
      var opening = !isExpanded;
      btn.setAttribute('aria-expanded', String(opening));
      if (panel) panel.hidden = !opening;

      var dot = btn.closest('.timeline-item').querySelector('.timeline-dot');
      if (dot) {
        if (opening) {
          dot.classList.add('active');
        } else {
          dot.classList.remove('active');
        }
      }
    });
  });
}());
