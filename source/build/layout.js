'use strict';

/**
 * Generates the shared <nav class="page-nav"> HTML.
 *
 * @param {string} activeHref  - href of the currently active page, e.g. 'schema.html'
 * @param {object} [options]
 * @param {boolean} [options.includeIdag=true] - whether to include the "Idag" link
 *   (the index page omits it; all other pages include it)
 */
function pageNav(activeHref, { includeIdag = true } = {}) {
  const links = [
    { href: 'index.html',      label: 'Hem' },
    { href: 'schema.html',     label: 'Schema' },
    ...(includeIdag ? [{ href: 'idag.html', label: 'Idag' }] : []),
    { href: 'lagg-till.html',  label: 'Lägg till aktivitet' },
  ];

  const items = links
    .map(({ href, label }) => {
      const active = href === activeHref ? ' active' : '';
      return `    <a class="nav-link${active}" href="${href}">${label}</a>`;
    })
    .join('\n');

  return `  <nav class="page-nav">\n${items}\n  </nav>`;
}

module.exports = { pageNav };
