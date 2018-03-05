const slsw = require("serverless-webpack");
const nodeExternals = require("webpack-node-externals");
const CopyWebpackPlugin = require('copy-webpack-plugin');

const plugins = [
  // XXX Find a way to add those folders only for the server function
  new CopyWebpackPlugin([
    {
      from: '.next/**',
    },
    {
      from: 'static/**',
    },
  ])
];

module.exports = {
  entry: slsw.lib.entries,
  target: "node",

  // Necessary for __dirname and __filename to work correctly when bundling with Webpack for the dev environment.
  // XXX See https://github.com/webpack/webpack/issues/1599
  node: {
    __dirname: true,
    __filename: true,
  },
  plugins,
  // Generate sourcemaps for proper error messages
  devtool: 'source-map',
  // We use webpack-node-externals to excludes all node deps. (like aws-sdk)
  // You can manually set the externals too.
  externals: [nodeExternals()],
  // Run babel on all .js files and skip those in node_modules
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: "babel-loader",
        include: __dirname,
        exclude: /node_modules/
      }
    ]
  },
};
