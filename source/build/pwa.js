'use strict';

/**
 * Returns the PWA-related HTML tags for <head>.
 * Called by every render function to ensure consistent PWA support.
 *
 * Includes: manifest link, theme-color, Apple-specific meta tags,
 * and apple-touch-icon.
 *
 * Theme color uses Terracotta (#C76D48) from 07-DESIGN.md §2.1.
 */
function pwaHeadTags() {
  return `  <link rel="manifest" href="app.webmanifest">
  <meta name="theme-color" content="#C76D48">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="default">
  <link rel="apple-touch-icon" href="images/icon-192.png">`;
}

module.exports = { pwaHeadTags };
