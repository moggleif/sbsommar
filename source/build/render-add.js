'use strict';

const { escapeHtml, toDateString } = require('./render');
const { pageNav } = require('./layout');

const DEFAULT_LOCATIONS = ['Servicehus', 'Annat'];

function renderAddPage(camp, locations, apiUrl) {
  const campName = escapeHtml(camp.name);
  const startDate = toDateString(camp.start_date);
  const endDate = toDateString(camp.end_date);

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
  <title>Lägg till aktivitet – ${campName}</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
${pageNav('lagg-till.html')}

  <h1>Lägg till aktivitet</h1>
  <p class="intro">Kolla gärna <a href="schema.html">schemat</a> innan du lägger till din aktivitet – välj en tid som inte krockar med något annat.</p>
  <p class="intro">Behöver du material eller ingredienser till din aktivitet? Kontakta Andreas i förväg så ordnar han det.</p>

  <form id="event-form" class="event-form" novalidate data-api-url="${escapeHtml(apiUrl || '/add-event')}">

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

    <div class="field">
      <label for="f-owner">Ditt namn <span class="opt">(valfritt – för framtida redigering)</span></label>
      <input type="text" id="f-owner" name="ownerName" autocomplete="name">
    </div>

    <div id="form-errors" class="form-errors" hidden></div>

    <button type="submit" class="btn-primary">Skicka →</button>

  </form>

  <section id="result" hidden>
    <div class="success-box">
      <h2>Aktiviteten är tillagd!</h2>
      <p class="intro"><strong id="result-title"></strong> syns i schemat om ungefär en minut.</p>
      <div class="success-actions">
        <a href="schema.html" class="btn-primary">Gå till schemat →</a>
        <button id="new-btn" class="btn-secondary">Lägg till en till</button>
      </div>
    </div>
  </section>

  <script src="lagg-till.js"></script>
</body>
</html>
`;
}

module.exports = { renderAddPage };
