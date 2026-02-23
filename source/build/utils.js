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

module.exports = { toDateString, escapeHtml, formatDate };
