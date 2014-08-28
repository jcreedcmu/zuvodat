var express = require('express')
var app = express();
var State = require('./public/state5.js');
var _ = require('underscore');

app.set('port', (process.env.PORT || 5000));
app.use(express.static(__dirname + '/public'));


var state = new State();
var qu = [];

app.get('/state', function(req, resp) {
  resp.json(state);
});

app.get('/poll', function(req, resp) {
  qu.push(resp);
});


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
    _.each(qu, function(poll_resp) {
      poll_resp.json(state);
    });
    qu = [];
  }
});



app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'))
})
