import { start } from './core-server';
import * as WebpackDevMiddleware from 'webpack-dev-middleware';
import * as webpack from 'webpack';
const config: webpack.Configuration = require('./webpack.config.js');

start(app => {
  app.use(
    WebpackDevMiddleware(webpack(config), {
      publicPath: '/',
      filename: 'bundle.js',
    })
  );
});
