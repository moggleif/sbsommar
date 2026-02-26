'use strict';

const { Marked } = require('marked');
const { pageNav, pageFooter } = require('./layout');
const { toDateString, escapeHtml } = require('./utils');

/**
 * Converts inline Markdown (images, links, bold) to HTML using marked.
 * Content files are author-controlled so no HTML escaping is applied.
 */
function inlineHtml(text) {
  const md = new Marked();
  md.use({
    renderer: {
      image({ href, text: alt }) {
        return `<img src="${href}" alt="${alt || ''}" class="content-img" loading="lazy">`;
      },
    },
  });
  return md.parseInline(text);
}

/**
 * Finds the first image in a markdown string, removes it, and returns both.
 * Used to hoist the hero image out of the body content.
 */
function extractHeroImage(md) {
  const match = md.match(/!\[([^\]]*)\]\(([^)]+)\)/);
  if (!match) return { heroSrc: null, heroAlt: null, md };
  const remaining = md
    .replace(match[0], '')
    .replace(/\n{3,}/g, '\n\n')
    .trimStart();
  return { heroSrc: match[2], heroAlt: match[1], md: remaining };
}

/**
 * Extracts the text of the first # heading in a markdown string.
 */
function extractH1(md) {
  const match = md.match(/^# (.+)$/m);
  return match ? match[1].trim() : null;
}

/**
 * Creates a configured Marked instance with heading offset and image class.
 */
function createMarked(headingOffset) {
  const md = new Marked();
  md.use({
    renderer: {
      heading({ tokens, depth }) {
        const level = Math.min(depth + headingOffset, 6);
        const text = this.parser.parseInline(tokens);
        return `<h${level}>${text}</h${level}>\n`;
      },
      image({ href, text: alt }) {
        return `<img src="${href}" alt="${alt || ''}" class="content-img" loading="lazy">`;
      },
    },
  });
  return md;
}

/**
 * Converts Markdown to HTML using the marked library.
 *
 * headingOffset shifts all heading levels down (pass 1 for non-primary sections).
 *
 * collapsible: when true, wraps each ##-level section in
 * <details class="accordion"><summary>…</summary>…</details>.
 * Closed by default. Add `collapsible: true` in sections.yaml to enable.
 */
function convertMarkdown(input, headingOffset = 0, collapsible = false) {
  if (!input || !input.trim()) return '';

  const md = createMarked(headingOffset);
  const html = md.parse(input).trim();

  if (!collapsible) return html;

  // Post-process: split on the ## heading level (after offset) to build accordions.
  const splitLevel = 2 + headingOffset;
  const splitTag = `<h${splitLevel}>`;
  const splitCloseTag = `</h${splitLevel}>`;

  // Split the HTML into segments at the target heading level.
  const escapedTag = splitTag.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const parts = html.split(new RegExp(`(?=${escapedTag})`));

  if (parts.length <= 1) return html;

  return parts
    .map((part) => {
      if (!part.startsWith(splitTag)) return part;

      // Extract the summary text from the heading.
      const headingEnd = part.indexOf(splitCloseTag);
      const summaryHtml = part.slice(splitTag.length, headingEnd);
      const body = part.slice(headingEnd + splitCloseTag.length).trim();

      const indented = body.split('\n').map((l) => (l ? '    ' + l : '')).join('\n');
      return [
        '<details class="accordion">',
        `  <summary>${summaryHtml}</summary>`,
        '  <div class="accordion-body">',
        indented,
        '  </div>',
        '</details>',
      ].join('\n');
    })
    .join('\n');
}

/**
 * Renders the full index.html.
 *
 * @param {object} opts
 * @param {string|null} opts.heroSrc  - path to hero image
 * @param {string|null} opts.heroAlt  - alt text for hero image
 * @param {string|null} opts.discordUrl  - URL for Discord link
 * @param {string|null} opts.facebookUrl - URL for Facebook link
 * @param {string|null} opts.countdownTarget - YYYY-MM-DD date for countdown
 * @param {Array<{id: string, navLabel: string, html: string}>} opts.sections
 */
function renderIndexPage({ heroSrc, heroAlt, sections, discordUrl, facebookUrl, countdownTarget }, footerHtml = '', navSections = []) {
  const countdownHtml = countdownTarget
    ? `\n      <div class="hero-countdown" data-target="${countdownTarget}">\n        <span class="hero-countdown-number">00</span>\n        <span class="hero-countdown-label">Dagar kvar</span>\n      </div>`
    : '';

  const sidebarHtml = (discordUrl || facebookUrl || countdownTarget)
    ? `\n    <div class="hero-sidebar">${
      discordUrl ? `\n      <a href="${discordUrl}" class="hero-social-link" target="_blank" rel="noopener noreferrer">\n        <img src="images/DiscordLogo.webp" alt="Discord">\n      </a>` : ''
    }${
      facebookUrl ? `\n      <a href="${facebookUrl}" class="hero-social-link" target="_blank" rel="noopener noreferrer">\n        <img src="images/social-facebook-button-blue-icon-small.webp" alt="Facebook">\n      </a>` : ''
    }${countdownHtml}\n    </div>`
    : '';

  const heroHtml = heroSrc
    ? `\n  <div class="hero">\n    <div class="hero-main">\n      <h1 class="hero-title">Sommarläger i Sysslebäck</h1>\n      <img src="${heroSrc}" alt="${heroAlt || ''}" class="hero-img" fetchpriority="high">\n    </div>${sidebarHtml}\n  </div>`
    : '';

  const contentSections = sections
    .map((s, i) => {
      // First section is above the fold — don't lazy-load its images
      // (the RFSB logo there is the LCP element on mobile).
      const sectionHtml = i === 0
        ? s.html.replace(/ loading="lazy"/g, '')
        : s.html;
      const inner = sectionHtml
        .split('\n')
        .map((l) => (l ? '      ' + l : ''))
        .join('\n');
      const cls = i === 0 ? ' class="section-first"' : '';
      return `    <section id="${s.id}"${cls}>\n${inner}\n    </section>`;
    })
    .join('\n\n');

  const preloadHtml = heroSrc
    ? `\n  <link rel="preload" as="image" href="${heroSrc}">`
    : '';

  return `<!DOCTYPE html>
<html lang="sv">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="robots" content="noindex, nofollow">
  <title>SB Sommar</title>
  <link rel="stylesheet" href="style.css">${preloadHtml}
</head>
<body>
${pageNav('index.html', navSections)}${heroHtml}
  <div class="content">
${contentSections}
  </div>
  <script src="nav.js" defer></script>${countdownTarget ? `
  <script>
  (function () {
    var el = document.querySelector('.hero-countdown[data-target]');
    if (!el) return;
    var target = el.getAttribute('data-target');
    var today = new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Stockholm' });
    var diff = Math.ceil((new Date(target + 'T00:00:00') - new Date(today + 'T00:00:00')) / 86400000);
    if (diff < 0) { el.hidden = true; return; }
    el.querySelector('.hero-countdown-number').textContent = diff < 10 ? '0' + diff : String(diff);
  })();
  </script>` : ''}
${pageFooter(footerHtml)}
</body>
</html>
`;
}

const MONTHS_SV_SHORT = [
  'jan', 'feb', 'mar', 'apr', 'maj', 'jun',
  'jul', 'aug', 'sep', 'okt', 'nov', 'dec',
];

function formatShortDate(dateStr) {
  const d = new Date(toDateString(dateStr) + 'T12:00:00');
  return `${d.getDate()} ${MONTHS_SV_SHORT[d.getMonth()]}`;
}

function formatCampDateRange(startStr, endStr) {
  const end = new Date(toDateString(endStr) + 'T12:00:00');
  return `${formatShortDate(startStr)} – ${formatShortDate(endStr)} ${end.getFullYear()}`;
}

/**
 * Renders the "Kommande läger" section HTML from camps.yaml data.
 *
 * @param {Array} allCamps  - full camps array from camps.yaml
 * @param {number} currentYear - the year to use for filtering (e.g. 2026)
 * @returns {string} HTML string, or empty string if no camps match
 */
function renderUpcomingCampsHtml(allCamps, currentYear) {
  const camps = allCamps
    .filter((c) => {
      if (c.archived !== true) return true;
      const year = new Date(toDateString(c.start_date) + 'T12:00:00').getFullYear();
      return year === currentYear;
    })
    .sort((a, b) => toDateString(a.start_date).localeCompare(toDateString(b.start_date)));

  if (camps.length === 0) return '';

  const items = camps.map((camp) => {
    const name = escapeHtml(camp.name || '');
    const location = escapeHtml(camp.location || '');
    const dateRange = escapeHtml(formatCampDateRange(camp.start_date, camp.end_date));
    const endDate = toDateString(camp.end_date);
    const link = (camp.link || '').trim();

    const nameHtml = link
      ? `<a href="${escapeHtml(link)}" target="_blank" rel="noopener noreferrer">${name}</a>`
      : name;

    return `    <li class="camp-item" data-end="${endDate}">
      <span class="camp-icon" aria-hidden="true"></span>
      <span class="camp-name">${nameHtml}</span>
      <span class="camp-meta">${location} · ${dateRange}</span>
    </li>`;
  }).join('\n');

  return `<ul class="upcoming-camps">
${items}
</ul>
<script>
(function () {
  var today = new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Stockholm' });
  document.querySelectorAll('.camp-item[data-end]').forEach(function (el) {
    if (el.getAttribute('data-end') < today) el.classList.add('camp-past');
  });
})();
</script>`;
}

/**
 * Renders location data from local.yaml as individual accordion items.
 *
 * @param {Array<{id: string, name: string, information: string, image_path: string|string[]}>} locations
 * @returns {string} HTML string of accordion elements
 */
function renderLocationAccordions(locations) {
  if (!locations || locations.length === 0) return '';

  return locations.map((loc) => {
    const name = escapeHtml(loc.name || '');
    const info = (loc.information || '').trim();
    const paths = Array.isArray(loc.image_path)
      ? loc.image_path.filter((p) => p)
      : (loc.image_path ? [loc.image_path] : []);

    const bodyParts = [];
    if (info) {
      bodyParts.push(`<p>${inlineHtml(info)}</p>`);
    }
    for (const imgPath of paths) {
      bodyParts.push(`<img src="${escapeHtml(imgPath)}" alt="${name}" class="content-img" loading="lazy">`);
    }

    const bodyHtml = bodyParts.length > 0
      ? bodyParts.map((l) => '    ' + l).join('\n')
      : '';

    return [
      '<details class="accordion">',
      `  <summary>${name}</summary>`,
      '  <div class="accordion-body">',
      bodyHtml,
      '  </div>',
      '</details>',
    ].join('\n');
  }).join('\n');
}

module.exports = { renderIndexPage, convertMarkdown, extractHeroImage, extractH1, renderUpcomingCampsHtml, renderLocationAccordions };
