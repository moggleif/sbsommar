'use strict';

const { Marked } = require('marked');

/**
 * Sanitizes HTML output by removing dangerous tags and attributes.
 * Strips: <script>, <iframe>, <object>, <embed>, on* event handlers,
 * and javascript: URIs.
 */
function sanitizeHtml(html) {
  return html
    // Remove <script>...</script> (including content)
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
    // Remove self-closing or unclosed dangerous tags
    .replace(/<\/?(script|iframe|object|embed)\b[^>]*>/gi, '')
    // Remove on* event handler attributes
    .replace(/\s+on\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]*)/gi, '')
    // Remove javascript: URIs in href/src attributes
    .replace(/(href|src)\s*=\s*"javascript:[^"]*"/gi, '$1=""')
    .replace(/(href|src)\s*=\s*'javascript:[^']*'/gi, "$1=''");
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
