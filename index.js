var WebSocketServer = require("ws").Server
var http = require("http")
var express = require("express")
var app = express()


var State = require('./public/state5.js');
var _ = require('underscore');

//app.set('port', (process.env.PORT || 5000));
//app.use(express.static(__dirname + '/public'));

var port = process.env.PORT || 5000

var table = [];
for (var i = 0; i < 26; i++) {
  table.push(String.fromCharCode(97 + i));
}
for (var i = 0; i < 10; i++) {
  table.push(String.fromCharCode(48 + i));
}


app.use("/b/:board", express.static(__dirname + "/public"));
app.use("/b/:board/id.js", function(req, res) {
  var board_id = req.param('board');
  if (board_id.match(/^[a-z0-9]{8}$/))
    res.send('board_id = "' + board_id + '";');
  else
    res.status(400).send("bad board id " + board_id);
});

app.use("/", function(req, res, next) {
  if (req.path != '/') {
    next();
    return;
  }
  var s = "";
  _.times(8, function() {
    s += table[Math.floor(table.length * Math.random())];
  });
  res.redirect("/b/" + s);
});

var server = http.createServer(app)
server.listen(port)


console.log("http server listening on %d", port)

var boards = {};
var qu = [];

app.get('/b/:board/move', function(req, resp) {
  var board_id = req.param('board');
  if (!board_id.match(/^[a-z0-9]{8}$/)) {
    res.status(400).send("bad board id " + board_id);
  }
  var board = boards[board_id];

  if (req.query.move == null)
    throw 'no move';
  var move;
  var step_res;

  try {
    move = JSON.parse(req.query.move);
  }
  catch (e) {
    resp.status(400).json({err: 'json parse failure', move: req.query.move, exn: e.toString()});
    return;
  }

  try {
    step_res = board.state.step(move);
  }
  catch (e) {
    resp.status(400).json({err: 'state evaluation failure', move: req.query.move, exn: e.toString()});
    return;
  }

  if (step_res == null) {
     resp.status(400).json({err: 'step_res null'});
    return;
  }

  if (step_res.err) {
    console.log(step_res);
    resp.status(400).json(step_res);
    return;
  }
  else {
    board.state = step_res;
    // broadcast
    resp.json("ok");
    _.each(board.conns, function(ws) {
      ws.send(JSON.stringify(board.state));
    });
  }
});


var wss = new WebSocketServer({server: server})
console.log("websocket server created")

wss.on("connection", function(ws) {
//  require('fs').writeFileSync('/tmp/foo.txt', JSON.stringify(ws, null, 4));
  var board_id = ws.upgradeReq.url.replace(/^\//, '');
  if (!board_id.match(/^[a-z0-9]{8}$/)) {
    console.log("bad board_id " + board_id);
    ws.close();
    return;
  }
  var board = boards[board_id];
  if (board == null) {
    board = {
      conns: {},
      conn_counter: 0,
      state: new State(),
    };
    boards[board_id] = board;
  }
  ws.conn_id = board.conn_counter++;
  board.conns[ws.conn_id] = ws;
  console.log("opening connection #" + ws.conn_id);
  ws.send(JSON.stringify(board.state));
  ws.on("close", function() {
    console.log("closing connection #" + this.conn_id);
    delete board.conns[this.conn_id];
  });
});
