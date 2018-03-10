// const { PHASE_DEVELOPMENT_SERVER } = require('next/constants');

module.exports = (phase, {defaultConfig}) => {
  return {
    webpack: (config, { buildId, dev, isServer, defaultLoaders }) => {
      // XXX https://github.com/evanw/node-source-map-support/issues/155
      config.node = {
        fs: 'empty',
        module: "empty",
      };
      return config;
    },
  };
};
