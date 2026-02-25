'use strict';

const { pageNav, pageFooter } = require('./layout');
const { toDateString, escapeHtml } = require('./utils');

/**
 * Converts inline Markdown (images, links, bold) to HTML.
 * Content files are author-controlled so no HTML escaping is applied.
 */
function inlineHtml(text) {
  return text
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="content-img" loading="lazy">')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
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

function renderBlock(b) {
  switch (b.type) {
    case 'h':         return `<h${b.level}>${inlineHtml(b.text)}</h${b.level}>`;
    case 'blockquote': return `<blockquote>${inlineHtml(b.text)}</blockquote>`;
    case 'hr':        return '<hr>';
    case 'ul':
      return `<ul>\n${b.items.map((it) => `  <li>${inlineHtml(it)}</li>`).join('\n')}\n</ul>`;
    case 'p':         return `<p>${inlineHtml(b.text)}</p>`;
    default:          return '';
  }
}

/**
 * Converts a Markdown subset to HTML.
 * Handles: headings (h1–h3), blockquotes, hr, unordered lists, paragraphs.
 *
 * headingOffset shifts all heading levels down (pass 1 for non-primary sections).
 *
 * collapsible: when true, wraps each ## section (after offset) in
 * <details class="accordion"><summary>…</summary>…</details>.
 * Closed by default. Add `collapsible: true` in sections.yaml to enable.
 */
function convertMarkdown(md, headingOffset = 0, collapsible = false) {
  const lines = md.split('\n');
  const blocks = [];
  let paraLines = [];

  function flushPara() {
    const text = paraLines.join(' ').trim();
    if (text) blocks.push({ type: 'p', text });
    paraLines = [];
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.startsWith('### ')) {
      flushPara();
      blocks.push({ type: 'h', level: Math.min(3 + headingOffset, 6), text: line.slice(4).trim() });
    } else if (line.startsWith('## ')) {
      flushPara();
      blocks.push({ type: 'h', level: Math.min(2 + headingOffset, 6), text: line.slice(3).trim() });
    } else if (line.startsWith('# ')) {
      flushPara();
      blocks.push({ type: 'h', level: Math.min(1 + headingOffset, 6), text: line.slice(2).trim() });
    } else if (line.startsWith('> ')) {
      flushPara();
      blocks.push({ type: 'blockquote', text: line.slice(2) });
    } else if (line.trim() === '---') {
      flushPara();
      blocks.push({ type: 'hr' });
    } else if (line.startsWith('- ')) {
      flushPara();
      const items = [];
      while (i < lines.length && lines[i].startsWith('- ')) {
        items.push(lines[i].slice(2));
        i++;
      }
      i--;
      blocks.push({ type: 'ul', items });
    } else if (line.trim() === '') {
      flushPara();
    } else {
      paraLines.push(line);
    }
  }
  flushPara();

  if (!collapsible) {
    return blocks.map(renderBlock).join('\n');
  }

  // Group content by the ## heading level (= 2 + headingOffset after rendering).
  // Each group becomes a <details> accordion. Content before the first ## is
  // rendered normally (e.g. the section h1/h2 title stays visible).
  const splitLevel = 2 + headingOffset;
  const groups = [];
  let current = { accordion: false, summary: null, blocks: [] };

  for (const block of blocks) {
    if (block.type === 'h' && block.level === splitLevel) {
      groups.push(current);
      current = { accordion: true, summary: block.text, blocks: [] };
    } else {
      current.blocks.push(block);
    }
  }
  groups.push(current);

  return groups
    .map((g) => {
      const inner = g.blocks.map(renderBlock).join('\n');
      if (!g.accordion) return inner;
      const indented = inner.split('\n').map((l) => (l ? '    ' + l : '')).join('\n');
      return [
        '<details class="accordion">',
        `  <summary>${inlineHtml(g.summary)}</summary>`,
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
      discordUrl ? `\n      <a href="${discordUrl}" class="hero-social-link" target="_blank" rel="noopener noreferrer">\n        <img src="images/discord_group.webp" alt="Discord">\n      </a>` : ''
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
    const info = (camp.information || '').trim();
    const link = (camp.link || '').trim();

    const nameHtml = link
      ? `<a href="${escapeHtml(link)}" target="_blank" rel="noopener noreferrer">${name}</a>`
      : name;

    const infoHtml = info
      ? `\n      <p class="camp-info">${escapeHtml(info)}</p>`
      : '';

    return `    <li class="camp-item" data-end="${endDate}">
      <span class="camp-check" aria-hidden="true"></span>
      <div class="camp-body">
        <span class="camp-name">${nameHtml}</span>
        <span class="camp-meta">${location} · ${dateRange}</span>${infoHtml}
      </div>
    </li>`;
  }).join('\n');

  return `<h2>Kommande läger</h2>
<ul class="upcoming-camps">
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

module.exports = { renderIndexPage, convertMarkdown, extractHeroImage, extractH1, renderUpcomingCampsHtml };
