import { Server as WebSocketServer } from 'ws';
import * as WebSocket from 'ws';
import * as http from 'http';
import * as express from 'express';
import { State, init_state, reduce_move } from './src/state';

import * as path from 'path';
import * as fs from 'fs';
import { Move, JoinClientMsg, MoveClientMsg, ClientMsg, Side } from './src/types';

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

function rand_id(): string {
  let s = '';
  times(8, function() {
    s += table[Math.floor(table.length * Math.random())];
  });
  return s;
}

type Connection = {
  sock: WebSocket,
  conn_id: number,
};

type Board = {
  conns: { [k: string]: Connection },
  conn_counter: number,
  state: State,
};

type BoardInfo = {
  board: Board,
  side: Side,
  other: string,
};

const boards: { [k: string]: BoardInfo } = {};

function handle_move(msg: MoveClientMsg, res: express.Response) {
  const { board_id, move } = msg;

  if (move === null) {
    throw new Error('no move');
  }

  if (!board_id.match(/^[a-z0-9]{8}$/)) {
    res.status(400).send('bad board id ' + board_id);
  }
  const binfo = boards[board_id];

  if (binfo === null) {
    throw new Error(`no such board ${board_id}`);
  }

  const { board } = binfo;
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
}

function handle_join(msg: JoinClientMsg, res: express.Response) {
  const { board_id } = msg;

  if (!board_id.match(/^[a-z0-9]{8}$/)) {
    res.status(400).send('bad board id ' + board_id);
  }
  const binfo = boards[board_id];

  if (binfo === null) {
    throw new Error(`no such board ${board_id}`);
  }

  const { board } = binfo;

  // broadcast
  res.json('ok');
  Object.values(board.conns).forEach(ws => {
    ws.sock.send(JSON.stringify(board.state));
  });


}

export function start(k: (app: express.Express) => void) {
  const app = express();
  const server = http.createServer(app);
  k(app);

  app.use('/b/:board', express.static(__dirname + '/public'));
  app.use('/b/:board/id.js', function(req, res) {
    const board_id = req.params.board;
    if (board_id.match(/^[a-z0-9]{8}$/)) {
      const binfo = boards[board_id];
      if (binfo === null) {
        throw new Error(`no such board ${board_id}`);
      }
      res.send(`
board_id = ${JSON.stringify(board_id)};
whoami = ${JSON.stringify(binfo.side)};
other = ${JSON.stringify(binfo.other)};
`);
    }
    else {
      res.status(400).send('bad board id ' + board_id);
    }
  });

  app.use('/', function(req, res, next) {
    if (req.path != '/') {
      next();
      return;
    }
    const player0 = rand_id();
    const player1 = rand_id();
    const board: Board = {
      conns: {},
      conn_counter: 0,
      state: init_state,
    };
    boards[player0] = { board, other: player1, side: 0 };
    boards[player1] = { board, other: player0, side: 1 };
    res.redirect(`/b/${player0}`);
  });

  const port = process.env.PORT == null ? 5000 : parseInt(process.env.PORT);
  server.listen(port)
  console.log('http server listening on %d', port)



  app.use(express.json());
  app.post('/b/:board/move', (req, res) => {
    const msg: ClientMsg = req.body;
    switch (msg.t) {
      case 'move': handle_move(msg, res);
      case 'join': handle_join(msg, res);
    }
  });

  const wss = new WebSocketServer({ server: server });
  console.log('websocket server created');

  wss.on('connection', (sock, req) => {
    try {
      if (req.url == undefined) {
        throw new Error('Tried to make websocket connection with undefined request url');
      }
      const board_id = req.url.replace(/^\//, '');
      console.log('board_id', board_id);
      if (!board_id.match(/^[a-z0-9]{8}$/)) {
        console.log('bad board_id ' + board_id);
        sock.close();
        return;
      }
      const binfo = boards[board_id];
      if (binfo == null) {
        throw new Error(`no such board ${board_id}`);
      }
      const { board } = binfo;
      const conn_id = board.conn_counter++;
      const conn: Connection = { sock, conn_id };
      board.conns[conn.conn_id] = conn;
      console.log('opening connection #' + conn_id);
      sock.send(JSON.stringify(board.state));
      sock.on('close', () => {
        console.log('closing connection #' + conn_id);
        delete board.conns[conn_id];
      });
    }
    catch (e) {
      console.log(e);
    }
  });
}
