'use strict';

const { escapeHtml } = require('./utils');
const { pageNav, pageFooter } = require('./layout');

/**
 * Renders the calendar tips page at /kalender.html.
 *
 * @param {object} camp - Camp object (for page title)
 * @param {string} siteUrl - Base URL (used for webcal link)
 * @param {string} [footerHtml=''] - Pre-rendered footer HTML
 * @param {Array}  [navSections=[]] - Navigation sections
 * @returns {string} Full HTML page
 */
function renderKalenderPage(camp, siteUrl, footerHtml = '', navSections = []) {
  const campName = escapeHtml(camp.name);
  const webcalUrl = siteUrl.replace(/^https?:\/\//, 'webcal://') + '/schema.ics';
  const icsUrl = escapeHtml(siteUrl + '/schema.ics');

  return `<!DOCTYPE html>
<html lang="sv">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="robots" content="noindex, nofollow">
  <title>Kalendersynk – ${campName}</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
${pageNav('kalender.html', navSections)}
  <h1>Synka schemat till din kalender</h1>
  <div class="kalender-tips">
    <p>Du kan prenumerera på hela lägerschemat så att alla aktiviteter dyker upp
    i din kalenderapp — och uppdateras automatiskt om schemat ändras.</p>

    <p>Du kan också ladda ner enskilda aktiviteter som engångsimport från varje
    aktivitets detaljsida.</p>

    <h2>Prenumerera på hela schemat</h2>
    <p>Kopiera den här länken och lägg till den som en kalenderprenumeration:</p>
    <p class="ical-url"><code>${escapeHtml(webcalUrl)}</code></p>
    <p><a href="${escapeHtml(webcalUrl)}">Öppna direkt i kalenderappen →</a></p>
    <p>Alternativt kan du ladda ner hela schemat som en fil:
    <a href="schema.ics">Ladda ner schema.ics</a></p>

    <h2>Så här gör du</h2>

    <h3>iPhone / iPad (iOS Kalender)</h3>
    <ol>
      <li>Tryck på länken ovan — "Öppna direkt i kalenderappen".</li>
      <li>iOS frågar om du vill prenumerera. Tryck <strong>Prenumerera</strong>.</li>
      <li>Klart! Schemat dyker upp som en egen kalender och uppdateras automatiskt.</li>
    </ol>

    <h3>Android (Google Kalender)</h3>
    <ol>
      <li>Öppna <a href="https://calendar.google.com" target="_blank" rel="noopener noreferrer">Google Kalender</a> i en webbläsare (inte appen).</li>
      <li>Klicka på <strong>+</strong> bredvid "Andra kalendrar" i vänstermenyn.</li>
      <li>Välj <strong>Från webbadress</strong>.</li>
      <li>Klistra in: <code>${icsUrl}</code></li>
      <li>Klicka <strong>Lägg till kalender</strong>. Det kan ta några minuter innan den synkas till appen.</li>
    </ol>

    <h3>Gmail (webbversion)</h3>
    <ol>
      <li>Samma steg som Android ovan — Google Kalender på webben hanterar prenumerationer.</li>
    </ol>

    <h3>Outlook</h3>
    <ol>
      <li>Öppna Outlook (app eller <a href="https://outlook.live.com/calendar" target="_blank" rel="noopener noreferrer">webben</a>).</li>
      <li>Gå till Kalender-vyn.</li>
      <li>Klicka <strong>Lägg till kalender</strong> → <strong>Prenumerera från webben</strong>.</li>
      <li>Klistra in: <code>${icsUrl}</code></li>
      <li>Ge kalendern ett namn och klicka <strong>Importera</strong>.</li>
    </ol>

    <h2>Prenumeration vs. engångsimport</h2>
    <p><strong>Prenumeration</strong> (webcal) — din kalenderapp hämtar schemat automatiskt
    med jämna mellanrum. Om en aktivitet läggs till eller ändras ser du det utan att
    göra något. Det här är det rekommenderade sättet.</p>
    <p><strong>Engångsimport</strong> (.ics-fil) — du laddar ner en aktivitet och lägger till
    den i kalendern en gång. Ändringar i schemat syns inte automatiskt. Bra om du bara
    vill ha en enstaka aktivitet.</p>
  </div>
  <script src="nav.js" defer></script>
${pageFooter(footerHtml)}
</body>
</html>
`;
}

module.exports = { renderKalenderPage };
