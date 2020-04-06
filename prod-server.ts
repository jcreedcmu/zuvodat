import { start } from './core-server';
import * as express from 'express';

start(app => {
  app.use('/js/bundle.js', express.static(__dirname + '/public/js/bundle.js'));
});
