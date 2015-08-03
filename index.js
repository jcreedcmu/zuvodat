var WebSocketServer = require("ws").Server;
var http = require("http");
var express = require("express");
var fs = require("fs");
var app = express();

var State = require('./public/state5.js');
var _ = require('underscore');

var port = process.env.PORT || 10000;
var state_file = process.env.STATE_FILE || "/tmp/state";

app.use("/b/", express.static(__dirname + "/public"));

app.get("/", function(req, res, next) {
  console.log(">  " + req.path);
  res.redirect("b/");
});

var server = http.createServer(app)
server.listen(port)

console.log("http server listening on %d", port)

var board = {
  conns: {},
  conn_counter: 0,
  state: new State(),
};

if (fs.existsSync(state_file)) {
  _.extend(board.state, JSON.parse(fs.readFileSync(state_file, "utf8")));
}

var qu = [];

app.get('/b/move', function(req, resp) {
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
    fs.writeFileSync(state_file, JSON.stringify(board.state), "utf8");

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
  ws.conn_id = board.conn_counter++;
  board.conns[ws.conn_id] = ws;
  console.log("opening connection #" + ws.conn_id);
  ws.send(JSON.stringify(board.state));
  ws.on("close", function() {
    console.log("closing connection #" + this.conn_id);
    delete board.conns[this.conn_id];
  });
});
