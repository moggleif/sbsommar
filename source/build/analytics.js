'use strict';

/**
 * Returns the GoatCounter script tag HTML, or empty string if no code is provided.
 *
 * @param {string} [goatcounterCode=''] - The GoatCounter site code (e.g. 'sbsommar')
 * @returns {string} HTML script tag or empty string
 */
function goatcounterScript(goatcounterCode) {
  if (!goatcounterCode) return '';
  const safe = goatcounterCode.replace(/[^a-zA-Z0-9_-]/g, '');
  return `\n  <script data-goatcounter="https://${safe}.goatcounter.com/count" async src="//gc.zgo.at/count.js"></script>`;
}

module.exports = { goatcounterScript };
