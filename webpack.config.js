const slsw = require("serverless-webpack");
const nodeExternals = require("webpack-node-externals");
const CopyWebpackPlugin = require('copy-webpack-plugin');

const plugins = [
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
  plugins,
  // Generate sourcemaps for proper error messages
  devtool: 'source-map',
  // Since 'aws-sdk' is not compatible with webpack,
  // we exclude all node dependencies
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