/* eslint-env node */
const imported = require( '@vlsergey/eslint-config' );
module.exports = {
  ...imported,
  extends: [
    ...imported.extends,
    'plugin:flowtype/recommended',
  ],
  plugins: [ ...imported.plugins, 'flowtype' ],
  env: {
    node: true,
    es6: true,
    jest: true,
  },
  rules: {
    ...imported.rules,
    'import/no-unused-modules': 0,
  },
};
