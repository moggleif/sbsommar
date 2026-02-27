'use strict';

const { escapeHtml, toDateString } = require('./render');
const { pageNav, pageFooter } = require('./layout');
const { addOneDay } = require('../api/time-gate');

const DEFAULT_LOCATIONS = ['Servicehus', 'Annat'];

// Derive the edit-event API URL from the add-event API URL.
// Replaces a trailing /add-event segment with /edit-event.
// Falls back to '/edit-event' when no URL is supplied.
function editApiUrl(addUrl) {
  if (!addUrl) return '/edit-event';
  return addUrl.replace(/\/add-event$/, '/edit-event');
}

function renderEditPage(camp, locations, apiUrl, footerHtml = '', navSections = []) {
  const campName = escapeHtml(camp.name);
  const startDate = toDateString(camp.start_date);
  const endDate = toDateString(camp.end_date);
  const opensDate = toDateString(camp.opens_for_editing || startDate);
  const closesDate = addOneDay(endDate);

  // "Annat" always last; deduplicate
  const locList = [
    ...(locations || DEFAULT_LOCATIONS).filter((l) => l !== 'Annat'),
    'Annat',
  ];

  const locationOptions = locList
    .map((l) => `          <option value="${escapeHtml(l)}">${escapeHtml(l)}</option>`)
    .join('\n');

  return `<!DOCTYPE html>
<html lang="sv">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="robots" content="noindex, nofollow">
  <title>Redigera aktivitet – ${campName}</title>
  <link rel="stylesheet" href="style.css">
  <link rel="icon" type="image/webp" href="images/RFSBsommarLogo.webp">
</head>
<body>
${pageNav('redigera.html', navSections)}

  <div id="edit-loading" role="status">
    <p>Laddar aktivitet…</p>
  </div>

  <div id="edit-no-session" hidden>
    <h1>Redigera aktivitet</h1>
    <p class="intro">Den här sidan är till för att redigera aktiviteter du har lagt till. För att det ska fungera behöver du tillåta cookie när du <a href="lagg-till.html">lägger till en aktivitet</a>.</p>
  </div>

  <div id="edit-my-events" hidden>
    <h1>Mina aktiviteter</h1>
    <p class="intro" id="my-events-empty">Här dyker dina redigerbara aktiviteter upp.</p>
    <ul id="my-events-list"></ul>
  </div>

  <div id="edit-error" hidden>
    <p class="form-error-msg" id="edit-error-msg">Aktiviteten kunde inte laddas.</p>
    <a href="schema.html">Tillbaka till schemat</a>
  </div>

  <section id="edit-section" hidden>
    <h1>Redigera aktivitet</h1>

    <form id="edit-form" class="event-form" novalidate
          data-api-url="${escapeHtml(apiUrl || '/edit-event')}"
          data-camp-start="${startDate}"
          data-camp-end="${endDate}"
          data-opens="${opensDate}"
          data-closes="${closesDate}">

      <input type="hidden" id="f-id" name="id">

      <fieldset>

        <div class="field">
          <label for="f-title">Rubrik <span class="req">*</span></label>
          <input type="text" id="f-title" name="title" autocomplete="off" required aria-describedby="err-title">
          <span class="field-error" id="err-title" hidden></span>
        </div>

        <div class="field-row">
          <div class="field">
            <label for="f-date">Datum <span class="req">*</span></label>
            <input type="date" id="f-date" name="date" min="${startDate}" max="${endDate}" required aria-describedby="err-date">
            <span class="field-error" id="err-date" hidden></span>
          </div>
          <div class="field">
            <label for="f-start">Starttid <span class="req">*</span></label>
            <input type="time" id="f-start" name="start" required aria-describedby="err-start">
            <span class="field-error" id="err-start" hidden></span>
          </div>
          <div class="field">
            <label for="f-end">Sluttid <span class="req">*</span></label>
            <input type="time" id="f-end" name="end" required aria-describedby="err-end">
            <span class="field-error" id="err-end" hidden></span>
          </div>
        </div>

        <div class="field-row">
          <div class="field">
            <label for="f-location">Plats <span class="req">*</span></label>
            <select id="f-location" name="location" required aria-describedby="err-location">
              <option value="">Välj plats...</option>
${locationOptions}
            </select>
            <span class="field-error" id="err-location" hidden></span>
          </div>
          <div class="field">
            <label for="f-responsible">Ansvarig <span class="req">*</span></label>
            <input type="text" id="f-responsible" name="responsible" autocomplete="off" required aria-describedby="err-responsible">
            <span class="field-error" id="err-responsible" hidden></span>
          </div>
        </div>

        <div class="field">
          <label for="f-description">Beskrivning <span class="opt">(valfritt)</span></label>
          <textarea id="f-description" name="description" rows="4"></textarea>
        </div>

        <div class="field">
          <label for="f-link">Länk <span class="opt">(valfritt)</span></label>
          <input type="url" id="f-link" name="link" placeholder="https://...">
        </div>

      </fieldset>

      <div class="form-actions">
        <button type="submit" class="btn-primary">Spara ändringar →</button>
        <a href="schema.html" class="btn-secondary">Avbryt</a>
      </div>

    </form>
  </section>

  <div id="submit-modal" class="submit-modal" role="dialog" aria-modal="true" aria-labelledby="modal-heading" hidden>
    <div class="modal-backdrop"></div>
    <div class="modal-box">
      <h2 id="modal-heading" class="modal-heading" tabindex="-1"></h2>
      <div id="modal-content" class="modal-content"></div>
    </div>
  </div>

  <script src="redigera.js"></script>
  <script src="nav.js" defer></script>
${pageFooter(footerHtml)}
</body>
</html>
`;
}

module.exports = { renderEditPage, editApiUrl };
