'use strict';

const fs = require('fs');
const { imageSize } = require('image-size');

/**
 * Returns { width, height } for the image at filePath, or null if
 * the file cannot be read or parsed.
 *
 * Uses image-size which parses only the image header — no pixel
 * decoding or decompression.
 */
function getImageDimensions(filePath) {
  try {
    const buf = fs.readFileSync(filePath);
    const { width, height } = imageSize(new Uint8Array(buf));
    if (typeof width === 'number' && typeof height === 'number') {
      return { width, height };
    }
    return null;
  } catch {
    return null;
  }
}

module.exports = { getImageDimensions };
