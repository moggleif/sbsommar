'use strict';

const { toDateString, escapeHtml, formatDate } = require('./utils');
const { stripMarkdown } = require('./markdown');

const WEEKDAYS_RFC822 = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS_RFC822 = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

/**
 * Formats a date string (YYYY-MM-DD) and time string (HH:MM) as RFC 822.
 * Example: "Mon, 29 Jun 2026 14:00:00 +0000"
 */
function toRfc822(dateStr, timeStr) {
  const d = new Date(`${dateStr}T${timeStr}:00Z`);
  const day = WEEKDAYS_RFC822[d.getUTCDay()];
  const dd = String(d.getUTCDate()).padStart(2, '0');
  const mon = MONTHS_RFC822[d.getUTCMonth()];
  const yyyy = d.getUTCFullYear();
  const hh = String(d.getUTCHours()).padStart(2, '0');
  const mm = String(d.getUTCMinutes()).padStart(2, '0');
  return `${day}, ${dd} ${mon} ${yyyy} ${hh}:${mm}:00 +0000`;
}

/**
 * Escapes text for use inside XML CDATA-free elements.
 * Reuses escapeHtml which covers &, <, >, " — and adds ' for XML.
 */
function escapeXml(str) {
  return escapeHtml(str).replace(/'/g, '&apos;');
}

/**
 * Builds a structured multi-line description for an RSS item.
 *
 * Line 1: formatted date, start–end (no labels)
 * Line 2: Plats: {location} · Ansvarig: {responsible}
 * Line 3: description (only if set)
 * Line 4: link (only if set)
 */
function buildDescription(event) {
  const lines = [];
  const timeStr = event.end
    ? `${event.start}–${event.end}`
    : String(event.start);
  lines.push(`${formatDate(toDateString(event.date))}, ${timeStr}`);
  lines.push(`Plats: ${event.location} · Ansvarig: ${event.responsible}`);
  if (event.description) {
    lines.push(stripMarkdown(event.description));
  }
  if (event.link) {
    lines.push(event.link);
  }
  return lines.join('\n');
}

/**
 * Renders an RSS 2.0 XML feed for the active camp's events.
 *
 * @param {object} camp - Camp object with name, id, etc.
 * @param {Array}  events - Array of event objects
 * @param {string} siteUrl - Base URL (no trailing slash)
 * @returns {string} RSS 2.0 XML string
 */
function renderRssFeed(camp, events, siteUrl) {
  // Sort events chronologically: by date, then by start time
  const sorted = [...events].sort((a, b) => {
    const dateA = toDateString(a.date);
    const dateB = toDateString(b.date);
    if (dateA !== dateB) return dateA.localeCompare(dateB);
    return String(a.start).localeCompare(String(b.start));
  });

  const safeSiteUrl = escapeXml(siteUrl);

  const items = sorted.map((e) => {
    const eventUrl = `${safeSiteUrl}/schema/${escapeXml(String(e.id))}/`;
    const desc = escapeXml(buildDescription(e));
    const pubDate = toRfc822(toDateString(e.date), String(e.start));

    return `    <item>
      <title>${escapeXml(e.title)}</title>
      <link>${eventUrl}</link>
      <guid isPermaLink="true">${eventUrl}</guid>
      <description>${desc}</description>
      <pubDate>${pubDate}</pubDate>
    </item>`;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Schema – ${escapeXml(camp.name)}</title>
    <link>${safeSiteUrl}/schema.html</link>
    <description>Aktivitetsschema för ${escapeXml(camp.name)}</description>
    <language>sv</language>
${items}
  </channel>
</rss>
`;
}

module.exports = { renderRssFeed, toRfc822 };
