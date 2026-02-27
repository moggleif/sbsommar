'use strict';

const { toDateString } = require('./utils');

/**
 * Escapes text for use in iCalendar content lines (RFC 5545 §3.3.11).
 * Backslashes, semicolons, and commas are escaped with a backslash prefix.
 * Newlines are encoded as literal \n.
 */
function escapeIcal(str) {
  if (str == null) return '';
  return String(str)
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

/**
 * Formats a date string (YYYY-MM-DD) and time string (HH:MM) as iCalendar
 * floating local datetime: YYYYMMDDTHHMMSS (no Z suffix, no TZID).
 */
function toIcalDatetime(dateStr, timeStr) {
  const d = toDateString(dateStr).replace(/-/g, '');
  const t = String(timeStr).replace(':', '') + '00';
  return `${d}T${t}`;
}

/**
 * Extracts the hostname from a URL string.
 */
function extractHostname(url) {
  try {
    return new URL(url).hostname;
  } catch {
    return 'sbsommar.se';
  }
}

/**
 * Builds the DESCRIPTION value for a VEVENT.
 * Format: "Ansvarig: {responsible}" followed by description if set.
 */
function buildDescription(event) {
  const parts = [`Ansvarig: ${event.responsible}`];
  if (event.description) {
    parts.push(event.description.trim());
  }
  return parts.join('\n');
}

/**
 * Renders the VEVENT lines for a single event.
 */
function renderVevent(event, siteUrl) {
  const hostname = extractHostname(siteUrl);
  const lines = [
    'BEGIN:VEVENT',
    `DTSTART:${toIcalDatetime(event.date, event.start)}`,
  ];
  if (event.end) {
    lines.push(`DTEND:${toIcalDatetime(event.date, event.end)}`);
  }
  lines.push(
    `SUMMARY:${escapeIcal(event.title)}`,
    `LOCATION:${escapeIcal(event.location)}`,
    `DESCRIPTION:${escapeIcal(buildDescription(event))}`,
    `URL:${siteUrl}/schema/${event.id}/`,
    `UID:${event.id}@${hostname}`,
    'END:VEVENT',
  );
  return lines.join('\r\n');
}

/**
 * Renders a single-event .ics file (VCALENDAR with one VEVENT).
 *
 * @param {object} event - Event object
 * @param {object} camp - Camp object
 * @param {string} siteUrl - Base URL
 * @returns {string} iCalendar string
 */
function renderEventIcal(event, camp, siteUrl) {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//SB Sommar//Schema//SV',
    `X-WR-CALNAME:${escapeIcal(camp.name)}`,
    'METHOD:PUBLISH',
    renderVevent(event, siteUrl),
    'END:VCALENDAR',
    '',
  ];
  return lines.join('\r\n');
}

/**
 * Renders a full-camp .ics file (VCALENDAR with one VEVENT per event).
 *
 * @param {object} camp - Camp object
 * @param {Array}  events - Array of event objects
 * @param {string} siteUrl - Base URL
 * @returns {string} iCalendar string
 */
function renderIcalFeed(camp, events, siteUrl) {
  const vevents = events.map((e) => renderVevent(e, siteUrl)).join('\r\n');
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//SB Sommar//Schema//SV',
    `X-WR-CALNAME:Schema – ${escapeIcal(camp.name)}`,
    'METHOD:PUBLISH',
  ];
  if (vevents) {
    lines.push(vevents);
  }
  lines.push('END:VCALENDAR', '');
  return lines.join('\r\n');
}

module.exports = { escapeIcal, renderEventIcal, renderIcalFeed };
