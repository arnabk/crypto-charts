const WebpackBar = require('webpackbar');
const path = require('path');

module.exports = function require(config, env) {
  const { resolve } = config;
  resolve.alias = {
    ...resolve.alias,
    '@root': path.resolve(__dirname, 'src/'),
  };
  config.plugins.push(new WebpackBar());
  return config;
};
