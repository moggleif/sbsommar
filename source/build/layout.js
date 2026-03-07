'use strict';

/**
 * Generates the shared <nav class="page-nav"> HTML.
 *
 * Renders two tiers:
 *   1. Page links – the five main site pages, with the current page marked active.
 *   2. Section links – anchor links to index page sections (only when navSections
 *      is non-empty). On non-index pages these point to index.html#id; on the
 *      index page they use bare anchors (#id).
 *
 * A hamburger <button class="nav-toggle"> is included for mobile; CSS hides it
 * on wide viewports. The toggle state is managed by nav.js.
 *
 * @param {string}   activeHref   - href of the currently active page, e.g. 'schema.html'
 * @param {Array<{id: string, navLabel: string}>} [navSections=[]]
 *   - sections to render as anchor links; defaults to [] (no section row)
 */
// Module-level config — set by build.js before rendering.
let _feedbackUrl = '';
function setFeedbackUrl(url) { _feedbackUrl = url || ''; }

function pageNav(activeHref, navSections = []) {
  const pageLinks = [
    { href: 'index.html',     label: 'Hem' },
    { href: 'schema.html',    label: 'Schema' },
    { href: 'idag.html',      label: 'Idag' },
    { href: 'lagg-till.html', label: 'Lägg till aktivitet' },
    { href: 'arkiv.html',     label: 'Arkiv' },
  ];

  const pageItems = pageLinks
    .map(({ href, label }) => {
      const active = href === activeHref ? ' active' : '';
      return `      <a class="nav-link${active}" href="${href}">${label}</a>`;
    })
    .join('\n');

  const onIndex = activeHref === 'index.html';
  let sectionRow = '';
  if (navSections.length > 0) {
    const sectionItems = navSections
      .map(({ id, navLabel }) => {
        const href = onIndex ? `#${id}` : `index.html#${id}`;
        return `      <a class="nav-link nav-link--section" href="${href}">${navLabel}</a>`;
      })
      .join('\n');
    sectionRow = `\n    <div class="nav-sections">\n${sectionItems}\n    </div>`;
  }

  const topLink = '\n    <a class="nav-link nav-link--top" href="#">Till toppen &uarr;</a>';

  const fbUrlAttr = _feedbackUrl ? ` data-api-url="${_feedbackUrl}"` : '';
  const feedbackBtn = `    <button type="button" class="feedback-btn" aria-label="Ge feedback"${fbUrlAttr}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    </button>`;

  return `  <nav class="page-nav" aria-label="Sidnavigation">
    <button type="button" class="nav-toggle" aria-expanded="false" aria-controls="nav-menu" aria-label="Öppna meny">
      <span class="nav-toggle-bar"></span>
      <span class="nav-toggle-bar"></span>
      <span class="nav-toggle-bar"></span>
    </button>
${feedbackBtn}
    <div class="nav-menu" id="nav-menu">
      <div class="nav-pages">
${pageItems}
      </div>${sectionRow}${topLink}
    </div>
  </nav>
  <button type="button" class="scroll-top" aria-label="Till toppen" hidden>&#x2B06;</button>`;
}

/**
 * Wraps pre-converted footer HTML in a <footer> element.
 * Returns an empty string when footerHtml is empty (file missing fallback).
 *
 * @param {string} footerHtml - HTML produced by convertMarkdown from footer.md
 */
function pageFooter(footerHtml) {
  const trimmed = (footerHtml || '').trim();
  if (!trimmed) return '';
  return `  <footer class="site-footer">\n${trimmed}\n  </footer>`;
}

module.exports = { pageNav, pageFooter, setFeedbackUrl };
