'use strict';

const fs = require('fs');
const { imageSize } = require('image-size');

/**
 * Returns { width, height } for the image at filePath, or null if
 * the file cannot be read or parsed.
 *
 * Reads only the first 512 bytes — enough for image-size to parse
 * the header without decoding the full image.
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
