// Generated using webpack-cli https://github.com/webpack/webpack-cli
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const config = {
  mode: 'development',
  entry: './src/siteview-sdk.js',
  output: {
    path: __dirname + '/dist',
    filename: 'siteview-sdk.js',
    libraryTarget: 'umd'
  },
  devServer: {
    open: true,
    host: 'localhost',
    hot: false,
    port: 8081
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html',
      inject: false
    }),
    new CopyWebpackPlugin({
      patterns: [
        { from: './playground/playground.js', to: './playground.js' }
      ]
    })
  ],
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/i,
        exclude: /node_modules/,
        loader: 'babel-loader'
      }
    ]
  }
};

module.exports = config;
