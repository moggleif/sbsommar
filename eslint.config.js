'use strict';

const js = require('@eslint/js');
const globals = require('globals');

module.exports = [
  { ignores: ['node_modules/**', 'public/**'] },

  js.configs.recommended,

  // 🔵 Default = Node (serverkod)
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'commonjs',
      globals: { ...globals.node },
    },
    rules: {
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'no-console': 'off',
    },
  },

  // 🟢 Endast client-filen = Browser
  {
    files: ['source/assets/js/client/lagg-till.js'],
    languageOptions: {
      globals: { ...globals.browser },
    },
  },
];