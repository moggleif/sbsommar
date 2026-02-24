'use strict';

(function () {
  const buttons = document.querySelectorAll('.timeline-header');

  buttons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      const isExpanded = btn.getAttribute('aria-expanded') === 'true';
      const panelId = btn.getAttribute('aria-controls');
      const panel = document.getElementById(panelId);

      // Close all other open panels first
      buttons.forEach(function (otherBtn) {
        if (otherBtn !== btn) {
          otherBtn.setAttribute('aria-expanded', 'false');
          const otherId = otherBtn.getAttribute('aria-controls');
          const otherPanel = document.getElementById(otherId);
          if (otherPanel) otherPanel.hidden = true;
        }
      });

      // Toggle this panel
      const opening = !isExpanded;
      btn.setAttribute('aria-expanded', String(opening));
      if (panel) panel.hidden = !opening;
    });
  });
}());
