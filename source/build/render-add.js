'use strict';

const { escapeHtml, toDateString } = require('./render');
const { pageNav, pageFooter } = require('./layout');

const DEFAULT_LOCATIONS = ['Servicehus', 'Annat'];

function renderAddPage(camp, locations, apiUrl, footerHtml = '', navSections = []) {
  const campName = escapeHtml(camp.name);
  const startDate = toDateString(camp.start_date);
  const endDate = toDateString(camp.end_date);

  // "Annat" always last; deduplicate
  const locList = [
    ...(locations || DEFAULT_LOCATIONS).filter((l) => l !== 'Annat'),
    'Annat',
  ];

  const locationOptions = locList
    .map((l) => `            <option value="${escapeHtml(l)}">${escapeHtml(l)}</option>`)
    .join('\n');

  return `<!DOCTYPE html>
<html lang="sv">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Lägg till aktivitet – ${campName}</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
${pageNav('lagg-till.html', navSections)}

  <h1>Lägg till aktivitet</h1>
  <p class="intro">Kolla gärna <a href="schema.html">schemat</a> innan du lägger till din aktivitet – välj en tid som inte krockar med något annat.</p>
  <p class="intro">Behöver du material eller ingredienser till din aktivitet? Kontakta Andreas i förväg så ordnar han det.</p>
  <p class="intro">När du skickat in kan du redigera din aktivitet efteråt – vi frågar om lov att spara ett tillfälligt ID i webbläsaren så att vi vet att aktiviteten är din. ID:t försvinner automatiskt efter 7 dagar.</p>

  <form id="event-form" class="event-form" novalidate data-api-url="${escapeHtml(apiUrl || '/add-event')}">

    <fieldset>

      <div class="field">
        <label for="f-title">Rubrik <span class="req">*</span></label>
        <input type="text" id="f-title" name="title" autocomplete="off" required>
      </div>

      <div class="field-row">
        <div class="field">
          <label for="f-date">Datum <span class="req">*</span></label>
          <input type="date" id="f-date" name="date" min="${startDate}" max="${endDate}" required>
        </div>
        <div class="field">
          <label for="f-start">Starttid <span class="req">*</span></label>
          <input type="time" id="f-start" name="start" required>
        </div>
        <div class="field">
          <label for="f-end">Sluttid <span class="req">*</span></label>
          <input type="time" id="f-end" name="end" required>
        </div>
      </div>

      <div class="field-row">
        <div class="field">
          <label for="f-location">Plats <span class="req">*</span></label>
          <select id="f-location" name="location" required>
            <option value="">Välj plats...</option>
${locationOptions}
          </select>
        </div>
        <div class="field">
          <label for="f-responsible">Ansvarig <span class="req">*</span></label>
          <input type="text" id="f-responsible" name="responsible" autocomplete="off" required>
        </div>
      </div>

      <div class="field">
        <label for="f-description">Beskrivning <span class="opt">(valfritt)</span></label>
        <textarea id="f-description" name="description" rows="4" placeholder="Beskriv aktiviteten, vad behövs, vad händer..."></textarea>
      </div>

      <div class="field">
        <label for="f-link">Länk <span class="opt">(valfritt)</span></label>
        <input type="url" id="f-link" name="link" placeholder="https://...">
      </div>

      <div id="form-errors" class="form-errors" hidden></div>

    </fieldset>

    <button type="submit" class="btn-primary">Skicka →</button>

  </form>

  <div id="submit-modal" class="submit-modal" role="dialog" aria-modal="true" aria-labelledby="modal-heading" hidden>
    <div class="modal-backdrop"></div>
    <div class="modal-box">
      <h2 id="modal-heading" class="modal-heading" tabindex="-1"></h2>
      <div id="modal-content" class="modal-content"></div>
    </div>
  </div>

  <script src="cookie-consent.js"></script>
  <script src="lagg-till.js"></script>
  <script src="nav.js"></script>
${pageFooter(footerHtml)}
</body>
</html>
`;
}

module.exports = { renderAddPage };
