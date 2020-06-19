/* eslint-env node */
const imported = require( '@vlsergey/babel-config' );
module.exports = api => {
  const original = imported( api );
  return {
    ...original,
    plugins: process.env.NODE_ENV === 'development'
      ? original.plugins
      : original.plugins.filter( p => p !== 'flow-runtime' ),
  };
};
