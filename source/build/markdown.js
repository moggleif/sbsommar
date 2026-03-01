'use strict';

const { Marked } = require('marked');

/**
 * Pattern matching dangerous HTML tags (with optional whitespace before >).
 * Matches opening, closing, and self-closing forms of script, iframe, object, embed.
 */
const DANGEROUS_TAG_RE = /<\/?\s*(script|iframe|object|embed)\b[^>]*>/gi;

/**
 * Pattern matching on* event handler attributes.
 */
const EVENT_HANDLER_RE = /\s+on\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]*)/gi;

/**
 * Pattern matching javascript: URIs in href/src attributes.
 */
const JS_URI_RE = /(href|src)\s*=\s*(["'])javascript:[^"']*\2/gi;

/**
 * Sanitizes HTML output by removing dangerous tags and attributes.
 * Strips: <script>, <iframe>, <object>, <embed>, on* event handlers,
 * and javascript: URIs. Runs in a loop to handle nested/reconstructed
 * patterns (e.g. `<scr<script>ipt>`).
 */
function sanitizeHtml(html) {
  let result = html;
  let prev;
  do {
    prev = result;
    result = result
      .replace(DANGEROUS_TAG_RE, '')
      .replace(EVENT_HANDLER_RE, '')
      .replace(JS_URI_RE, '$1=""');
  } while (result !== prev);
  return result;
}

/**
 * Converts a Markdown description string to sanitized HTML.
 * Returns empty string for null/empty input.
 *
 * @param {string|null} text - Markdown text
 * @returns {string} Sanitized HTML
 */
function renderDescriptionHtml(text) {
  if (!text || !text.trim()) return '';
  const md = new Marked();
  const html = md.parse(text).trim();
  return sanitizeHtml(html);
}

/**
 * Strips Markdown syntax from text, returning plain text.
 * Used for RSS and iCal where HTML is not appropriate.
 *
 * @param {string|null} text - Markdown text
 * @returns {string} Plain text without Markdown syntax
 */
function stripMarkdown(text) {
  if (!text || !text.trim()) return '';
  return text
    // Remove images: ![alt](url)
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1')
    // Remove links: [text](url)
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    // Remove bold: **text** or __text__
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/__(.+?)__/g, '$1')
    // Remove italic: *text* or _text_
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/_(.+?)_/g, '$1')
    // Remove heading markers: # ## ### etc.
    .replace(/^#{1,6}\s+/gm, '')
    // Remove unordered list markers: - or *
    .replace(/^[\s]*[-*]\s+/gm, '')
    // Remove ordered list markers: 1. 2. etc.
    .replace(/^[\s]*\d+\.\s+/gm, '')
    // Remove horizontal rules
    .replace(/^[-*_]{3,}\s*$/gm, '')
    // Remove inline code backticks
    .replace(/`([^`]+)`/g, '$1')
    // Remove blockquote markers
    .replace(/^>\s+/gm, '')
    // Collapse multiple blank lines
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

module.exports = { renderDescriptionHtml, stripMarkdown };
