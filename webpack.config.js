// Generated using webpack-cli https://github.com/webpack/webpack-cli

const path = require('path');
const TerserJSPlugin = require('terser-webpack-plugin');

const isProduction = process.env.NODE_ENV == 'production';

const defaultConfig = {
  optimization: {
    minimize: true,
    minimizer: [
      new TerserJSPlugin({
        include: /\.min\.js$/
      })
    ]
  },
  devServer: {
    open: true,
    host: 'localhost'
  },
  plugins: [],
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/i,
        loader: 'babel-loader'
      },
      {
        test: /\.(eot|svg|ttf|woff|woff2|png|jpg|gif)$/i,
        type: 'asset'
      }
    ]
  }
};

const config = {
  ...defaultConfig,
  entry: {
    'umd/siteview-sdk': path.resolve(__dirname, 'src/siteview-sdk.js'),
    'umd/siteview-sdk.min': path.resolve(__dirname, 'src/siteview-sdk.js')
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    libraryTarget: 'umd'
  },
  plugins: []
};

const cjsConfig = {
  ...defaultConfig,
  entry: {
    'cjs/siteview-sdk': path.resolve(__dirname, 'src/siteview-sdk.js'),
    'cjs/siteview-sdk.min': path.resolve(__dirname, 'src/siteview-sdk.js')
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    libraryTarget: 'umd'
  }
};

const esmConfig = {
  ...defaultConfig,
  entry: {
    'esm/siteview-sdk': path.resolve(__dirname, 'src/siteview-sdk.js'),
    'esm/siteview-sdk.min': path.resolve(__dirname, 'src/siteview-sdk.js')
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    libraryTarget: 'module'
  },
  experiments: {
    outputModule: true
  }
};

const configs = [config, cjsConfig, esmConfig];

module.exports = () => {
  configs.forEach((it) => {
    if (isProduction) {
      it.mode = 'production';
    } else {
      it.mode = 'development';
    }
  });
  return configs;
};
