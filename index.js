var WebSocketServer = require("ws").Server
var http = require("http")
var express = require("express")
var app = express()


var State = require('./public/state5.js');
var _ = require('underscore');

//app.set('port', (process.env.PORT || 5000));
//app.use(express.static(__dirname + '/public'));

var port = process.env.PORT || 5000
app.use(express.static(__dirname + "/public"))
var server = http.createServer(app)
server.listen(port)


console.log("http server listening on %d", port)

var state = new State();
var qu = [];

app.get('/move', function(req, resp) {
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
    step_res = state.step(move);
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
    state = step_res;
    // broadcast
    resp.json("ok");
    _.each(conns, function(ws) {
      ws.send(JSON.stringify(state));
    });
  }
});


var wss = new WebSocketServer({server: server})
console.log("websocket server created")

var conns = {};
var conn_counter = 0;
wss.on("connection", function(ws) {
  ws.conn_id = conn_counter++;
  conns[ws.conn_id] = ws;
  console.log("opening connection #" + ws.conn_id);
  ws.send(JSON.stringify(state));
  ws.on("close", function() {
    console.log("closing connection #" + this.conn_id);
    delete conns[this.conn_id];
  });
});
