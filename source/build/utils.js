'use strict';

// js-yaml may parse unquoted YYYY-MM-DD values as Date objects.
function toDateString(val) {
  if (val instanceof Date) return val.toISOString().slice(0, 10);
  return String(val);
}

function escapeHtml(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Swedish weekday + date formatting without locale dependency
const WEEKDAYS_SV = ['söndag', 'måndag', 'tisdag', 'onsdag', 'torsdag', 'fredag', 'lördag'];
const MONTHS_SV = [
  'januari',
  'februari',
  'mars',
  'april',
  'maj',
  'juni',
  'juli',
  'augusti',
  'september',
  'oktober',
  'november',
  'december',
];

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T12:00:00');
  const weekday = WEEKDAYS_SV[d.getDay()];
  const day = d.getDate();
  const month = MONTHS_SV[d.getMonth()];
  const year = d.getFullYear();
  return `${weekday} ${day} ${month} ${year}`;
}

const WEEKDAYS_SHORT_SV = ['Sön', 'Mån', 'Tis', 'Ons', 'Tor', 'Fre', 'Lör'];

/**
 * Generate an array of { isoDate, label } for each day in the range [start, end].
 * label = "Mån 28/7" style.
 */
function campDayButtons(startDate, endDate) {
  const days = [];
  const start = new Date(toDateString(startDate) + 'T12:00:00');
  const end = new Date(toDateString(endDate) + 'T12:00:00');
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const iso = d.toISOString().slice(0, 10);
    const weekday = WEEKDAYS_SHORT_SV[d.getDay()];
    const day = d.getDate();
    const month = d.getMonth() + 1;
    days.push({ isoDate: iso, label: `${weekday}<br>${day}/${month}` });
  }
  return days;
}

module.exports = { toDateString, escapeHtml, formatDate, campDayButtons };
