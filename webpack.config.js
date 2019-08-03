const path = require('path');
const webpack = require('webpack');

module.exports = {
  devtool: 'source-map',
  mode: 'development',
  context: path.join(__dirname, 'src'),
  entry: [
    './index',
  ],
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: [ '.tsx', '.ts', '.js' ]
  },
  output: {
    path: path.join(__dirname, 'public'),
    filename: 'js/bundle.js',
    publicPath: '/',
  },
  plugins: [
  ],
  // This has no effect?
  devServer: {
    proxy: {
      '^/': {
        target: 'ws://localhost:4000',
        ws: true,
        changeOrigin: true
      },
	 }
  }
};
