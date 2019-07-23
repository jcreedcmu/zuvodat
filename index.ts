import { Server as WebSocketServer } from 'ws';
import * as WebSocket from 'ws';
import * as http from 'http';
import * as express from 'express';
import { State, init_state, reduce_move } from './src/state';

import * as WebpackDevServer from 'webpack-dev-server';
import * as webpack from 'webpack';
const config = require('./webpack.config.js');
import * as path from 'path';
import * as fs from 'fs';

const app = express();

function times(n: number, f: () => void) {
  for (let i = 0; i < n; i++)
    f();
}



const table: string[] = [];
for (let i = 0; i < 26; i++) {
  table.push(String.fromCharCode(97 + i));
}
for (let i = 0; i < 10; i++) {
  table.push(String.fromCharCode(48 + i));
}


app.use('/b/:board', express.static(__dirname + '/public'));
app.use('/b/:board/id.js', function(req, res) {
  const board_id = req.param('board');
  if (board_id.match(/^[a-z0-9]{8}$/))
    res.send(`board_id = ${board_id};`);
  else
    res.status(400).send('bad board id ' + board_id);
});

app.use('/', function(req, res, next) {
  if (req.path != '/') {
    next();
    return;
  }
  let s = '';
  times(8, function() {
    s += table[Math.floor(table.length * Math.random())];
  });
  res.redirect('/b/' + s);
});


const server = new WebpackDevServer(webpack(config), {
  contentBase: 'public',
  hot: true,
  filename: 'bundle.js',
  publicPath: '/',
  stats: {
    colors: true,
  },
});
const port = process.env.PORT == null ? 5000 : parseInt(process.env.PORT);
server.listen(port)
console.log('http server listening on %d', port)

type Connection = {
  sock: WebSocket,
  conn_id: number,
};
type Board = {
  conns: { [k: string]: Connection },
  conn_counter: number,
  state: State,
};

const boards: { [k: string]: Board } = {};
const qu = [];

app.get('/b/:board/move', (req, res) => {
  const board_id = req.param('board');
  if (!board_id.match(/^[a-z0-9]{8}$/)) {
    res.status(400).send('bad board id ' + board_id);
  }
  const board = boards[board_id];

  if (req.query.move == null)
    throw 'no move';
  let move;
  try {
    move = JSON.parse(req.query.move);
  }
  catch (e) {
    res.status(400).json({ err: 'json parse failure', move: req.query.move, exn: e.toString() });
    return;
  }

  const step_res = reduce_move(board.state, move);

  if (step_res == null) {
    res.status(400).json({ err: 'step_res null' });
    return;
  }

  if ('err' in step_res) {
    console.log(step_res);
    res.status(400).json(step_res);
    return;
  }
  else {
    board.state = step_res;
    // broadcast
    res.json('ok');
    Object.values(board.conns).forEach(ws => {
      ws.sock.send(JSON.stringify(board.state));
    });
  }
});


const wss = new WebSocketServer({ host: 'localhost', port: 4000 });
console.log('websocket server created');

wss.on('connection', sock => {
  const board_id = sock.url.replace(/^\//, '');
  console.log('board_id', board_id);
  if (!board_id.match(/^[a-z0-9]{8}$/)) {
    console.log('bad board_id ' + board_id);
    sock.close();
    return;
  }
  let board = boards[board_id];
  if (board == null) {
    board = {
      conns: {},
      conn_counter: 0,
      state: init_state,
    };
    boards[board_id] = board;
  }
  const conn_id = board.conn_counter++;
  const conn: Connection = { sock, conn_id };
  board.conns[conn.conn_id] = conn;
  console.log('opening connection #' + conn_id);
  sock.send(JSON.stringify(board.state));
  sock.on('close', () => {
    console.log('closing connection #' + conn_id);
    delete board.conns[conn_id];
  });
});
