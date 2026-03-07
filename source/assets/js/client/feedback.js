(function () {
  'use strict';

  var btn = document.querySelector('.feedback-btn');
  if (!btn) return;

  var apiUrl = btn.dataset.apiUrl || '/feedback';

  // ── Build modal ─────────────────────────────────────────────────────────

  var modal = document.createElement('div');
  modal.id = 'feedback-modal';
  modal.hidden = true;
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.setAttribute('aria-labelledby', 'feedback-heading');
  modal.innerHTML =
    '<div class="feedback-backdrop"></div>' +
    '<div class="feedback-dialog">' +
      '<button type="button" class="feedback-close" aria-label="Stäng">&times;</button>' +
      '<h2 id="feedback-heading" tabindex="-1">Ge oss feedback</h2>' +
      '<div id="feedback-content"></div>' +
    '</div>';
  document.body.appendChild(modal);

  var backdrop  = modal.querySelector('.feedback-backdrop');
  var closeBtn  = modal.querySelector('.feedback-close');
  var heading   = document.getElementById('feedback-heading');
  var contentEl = document.getElementById('feedback-content');
  var preFocusEl = null;

  // ── Focus trap ──────────────────────────────────────────────────────────

  function getFocusable() {
    return Array.from(modal.querySelectorAll(
      'input:not([tabindex="-1"]), textarea, button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])',
    ));
  }

  function trapFocus(e) {
    if (e.key !== 'Tab') return;
    var f = getFocusable();
    if (!f.length) return;
    if (e.shiftKey) {
      if (document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
    } else {
      if (document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
    }
  }

  function openModal() {
    preFocusEl = document.activeElement;
    modal.hidden = false;
    document.body.classList.add('modal-open');
    modal.addEventListener('keydown', trapFocus);
    showForm();
  }

  function closeModal() {
    modal.hidden = true;
    document.body.classList.remove('modal-open');
    modal.removeEventListener('keydown', trapFocus);
    if (preFocusEl) preFocusEl.focus();
  }

  btn.addEventListener('click', openModal);
  closeBtn.addEventListener('click', closeModal);
  backdrop.addEventListener('click', closeModal);
  modal.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeModal(); });

  // ── Helpers ─────────────────────────────────────────────────────────────

  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function focusFirst() {
    var f = getFocusable();
    if (f.length) f[0].focus();
  }

  // ── Form view ───────────────────────────────────────────────────────────

  var savedForm = { category: 'suggestion', title: '', description: '', name: '' };

  function showForm() {
    heading.textContent = 'Ge oss feedback';
    contentEl.innerHTML =
      '<form id="feedback-form" novalidate>' +
        '<fieldset>' +
          '<legend class="feedback-legend">Vad gäller det?</legend>' +
          '<div class="feedback-categories">' +
            '<label class="feedback-cat"><input type="radio" name="category" value="bug"' + (savedForm.category === 'bug' ? ' checked' : '') + '> Bugg</label>' +
            '<label class="feedback-cat"><input type="radio" name="category" value="suggestion"' + (savedForm.category === 'suggestion' ? ' checked' : '') + '> Förslag</label>' +
            '<label class="feedback-cat"><input type="radio" name="category" value="question"' + (savedForm.category === 'question' ? ' checked' : '') + '> Fråga</label>' +
          '</div>' +
        '</fieldset>' +
        '<div class="field">' +
          '<label for="fb-title">Rubrik <span aria-hidden="true">*</span></label>' +
          '<input type="text" id="fb-title" name="title" required aria-required="true" maxlength="200" value="' + esc(savedForm.title) + '">' +
          '<span class="field-error" id="err-fb-title" hidden></span>' +
        '</div>' +
        '<div class="field">' +
          '<label for="fb-description">Beskriv <span aria-hidden="true">*</span></label>' +
          '<textarea id="fb-description" name="description" required aria-required="true" maxlength="2000" rows="5">' + esc(savedForm.description) + '</textarea>' +
          '<span class="field-error" id="err-fb-description" hidden></span>' +
        '</div>' +
        '<div class="field">' +
          '<label for="fb-name">Namn eller kontaktuppgift (valfritt)</label>' +
          '<input type="text" id="fb-name" name="name" maxlength="200" value="' + esc(savedForm.name) + '">' +
        '</div>' +
        '<div style="position:absolute;left:-9999px" aria-hidden="true">' +
          '<label for="fb-website">Website</label>' +
          '<input type="text" id="fb-website" name="website" tabindex="-1" autocomplete="off">' +
        '</div>' +
        '<button type="submit" class="btn-primary feedback-submit" disabled>Skicka feedback</button>' +
      '</form>';
    bindForm();
    heading.focus();
  }

  function bindForm() {
    var form      = document.getElementById('feedback-form');
    var submitBtn = form.querySelector('.feedback-submit');
    var titleIn   = document.getElementById('fb-title');
    var descIn    = document.getElementById('fb-description');

    function updateSubmit() {
      submitBtn.disabled = !(titleIn.value.trim() && descIn.value.trim());
    }

    function setErr(id, msg) {
      var span = document.getElementById('err-' + id);
      if (!span) return;
      span.textContent = msg || '';
      span.hidden = !msg;
    }

    titleIn.addEventListener('input', function () { updateSubmit(); setErr('fb-title', null); });
    descIn.addEventListener('input', function () { updateSubmit(); setErr('fb-description', null); });
    titleIn.addEventListener('blur', function () {
      if (!titleIn.value.trim()) setErr('fb-title', 'Rubrik är obligatoriskt.');
    });
    descIn.addEventListener('blur', function () {
      if (!descIn.value.trim()) setErr('fb-description', 'Beskrivning är obligatoriskt.');
    });

    // Sync button state on init (matters when restoring saved values)
    updateSubmit();

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var title = titleIn.value.trim();
      var desc  = descIn.value.trim();
      if (!title || !desc) return;

      var catEl = form.querySelector('input[name="category"]:checked');
      var cat   = catEl ? catEl.value : 'suggestion';
      var name  = (document.getElementById('fb-name') || {}).value || '';

      // Save form values so they survive error → retry
      savedForm = { category: cat, title: title, description: desc, name: name };

      submitFeedback({
        category:    cat,
        title:       title,
        description: desc,
        name:        name,
        website:     (document.getElementById('fb-website') || {}).value || '',
        url:         window.location.href,
        viewport:    window.innerWidth + 'x' + window.innerHeight,
        userAgent:   navigator.userAgent,
        timestamp:   new Date().toISOString(),
      });
    });
  }

  // ── Progress view ───────────────────────────────────────────────────────

  var STEPS = [
    { text: 'Skickar\u2026', delay: 0 },
    { text: 'Skapar feedback\u2026', delay: 500 },
    { text: 'Sparar\u2026', delay: 2000 },
  ];
  var timers = [];

  function showProgress() {
    heading.textContent = 'Skickar\u2026';
    var html = '<ul class="submit-progress" role="status" aria-live="polite">';
    for (var i = 0; i < STEPS.length; i++) {
      html += '<li class="progress-step" id="fb-step-' + i + '">' +
        '<span class="step-icon" aria-hidden="true">\u25CB</span> ' +
        '<span class="step-text">' + STEPS[i].text + '</span></li>';
    }
    contentEl.innerHTML = html + '</ul>';

    // Activate first step
    activate(0);
    for (var j = 1; j < STEPS.length; j++) {
      (function (prev, curr, delay) {
        timers.push(setTimeout(function () { complete(prev); activate(curr); }, delay));
      })(j - 1, j, STEPS[j].delay);
    }
  }

  function activate(i) {
    var el = document.getElementById('fb-step-' + i);
    if (!el) return;
    el.classList.add('step-active');
    el.querySelector('.step-icon').textContent = '\u25C9';
  }

  function complete(i) {
    var el = document.getElementById('fb-step-' + i);
    if (!el) return;
    el.classList.remove('step-active');
    el.classList.add('step-done');
    el.querySelector('.step-icon').textContent = '\u2713';
  }

  function completeAll() {
    for (var i = 0; i < STEPS.length; i++) complete(i);
  }

  function clearTimers() {
    for (var i = 0; i < timers.length; i++) clearTimeout(timers[i]);
    timers = [];
  }

  // ── Submit ──────────────────────────────────────────────────────────────

  function submitFeedback(payload) {
    showProgress();

    fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
      .then(function (r) { return r.json(); })
      .then(function (json) {
        clearTimers();
        completeAll();
        if (!json.success) {
          showError(json.error || 'Något gick fel. Försök igen.');
          return;
        }
        showSuccess(json.issueUrl);
      })
      .catch(function () {
        clearTimers();
        showError('Något gick fel. Kontrollera din internetanslutning och försök igen.');
      });
  }

  // ── Success view ────────────────────────────────────────────────────────

  function showSuccess(issueUrl) {
    savedForm = { category: 'suggestion', title: '', description: '', name: '' };
    heading.textContent = 'Tack för din feedback!';
    var linkHtml = issueUrl
      ? '<p><a href="' + esc(issueUrl) + '" target="_blank" rel="noopener">Se din feedback på GitHub →</a></p>'
      : '';
    contentEl.innerHTML = linkHtml +
      '<button type="button" class="btn-primary" id="fb-done">Stäng</button>';
    focusFirst();
    document.getElementById('fb-done').addEventListener('click', function () {
      closeModal();
    });
  }

  // ── Error view ──────────────────────────────────────────────────────────

  function showError(msg) {
    heading.textContent = 'Något gick fel';
    contentEl.innerHTML =
      '<p class="form-error-msg">' + esc(msg) + '</p>' +
      '<button type="button" class="btn-primary" id="fb-retry">Försök igen</button>';
    focusFirst();
    document.getElementById('fb-retry').addEventListener('click', showForm);
  }
})();
