'use strict';

const { escapeHtml, toDateString } = require('./render');
const { pageNav } = require('./layout');

const DEFAULT_LOCATIONS = ['Servicehus', 'Annat'];

function renderEditPage(camp, locations, apiUrl) {
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
  <title>Redigera aktivitet – ${campName}</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
${pageNav('redigera.html')}

  <div id="edit-loading" role="status">
    <p>Laddar aktivitet…</p>
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
          data-camp-end="${endDate}">

      <input type="hidden" id="f-id" name="id">

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
          <label for="f-end">Sluttid <span class="opt">(valfritt)</span></label>
          <input type="time" id="f-end" name="end">
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
        <textarea id="f-description" name="description" rows="4"></textarea>
      </div>

      <div class="field">
        <label for="f-link">Länk <span class="opt">(valfritt)</span></label>
        <input type="url" id="f-link" name="link" placeholder="https://...">
      </div>

      <div id="form-errors" class="form-errors" hidden></div>

      <div class="form-actions">
        <button type="submit" class="btn-primary">Spara ändringar →</button>
        <a href="schema.html" class="btn-secondary">Avbryt</a>
      </div>

    </form>
  </section>

  <section id="result" hidden>
    <div class="success-box">
      <h2>Aktiviteten är uppdaterad!</h2>
      <p class="intro"><strong id="result-title"></strong> uppdateras i schemat om ungefär en minut.</p>
      <div class="success-actions">
        <a href="schema.html" class="btn-primary">Gå till schemat →</a>
      </div>
    </div>
  </section>

  <script src="redigera.js"></script>
</body>
</html>
`;
}

module.exports = { renderEditPage };
