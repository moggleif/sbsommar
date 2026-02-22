'use strict';

const { escapeHtml, toDateString } = require('./render');

const DEFAULT_LOCATIONS = ['Servicehus', 'Annat'];

function renderAddPage(camp, locations) {
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
  <nav class="page-nav">
    <a class="nav-link" href="schema.html">← Schema</a>
  </nav>

  <h1>Lägg till aktivitet</h1>
  <p class="intro">Fyll i formuläret och klicka "Skicka". Du får då en rad att kopiera och skicka till en administratör via Discord eller mejl – de lägger in den i schemat.</p>

  <form id="event-form" class="event-form" novalidate>

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
    <h2>Klar!</h2>
    <p class="intro">Kopiera texten nedan och skicka den till en administratör (Discord, mejl eller liknande) så lägger de in aktiviteten i schemat.</p>
    <div class="yaml-block">
      <button id="copy-btn" class="btn-secondary copy-btn">Kopiera</button>
      <pre id="yaml-output"></pre>
    </div>
    <p><button id="new-btn" class="btn-secondary">Lägg till en till aktivitet</button></p>
  </section>

  <script src="lagg-till.js"></script>
</body>
</html>
`;
}

module.exports = { renderAddPage };
