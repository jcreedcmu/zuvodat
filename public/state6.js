var _ = require('underscore');

MAX_STONES = 11;

function vplus(a, b) {
  return {x: a.x + b.x, y: a.y + b.y};
}

function vscale(s, b) {
  return {x: s * b.x, y: s * b.y};
}

function vswap(v) {
  return {x: v.y, y: v.x};
}

class State {
  constructor() {
    // player ::= 0 blue or 1 red
    // side ::= 0 horiz or 1 vert
    // stones[player][side][ix]
    this.stones = [[],[]];
    this.moves = [];
    this.stones[0][0] = _.times(11, () => 0);
    this.stones[0][1] = _.times(11, () => 0);
    this.stones[1][0] = _.times(11, () => 0);
    this.stones[1][1] = _.times(11, () => 0);
//    this.stones[1][0][6] = 1;
//  this.stones[0][1][6] = 2;
    this.cur_player = 0;
    this.ball = {x: 5, y: 5};
    this.victory = 0;
  }

  // actual game logic here
  step(move) {
    if (move == null) {
      return {err: 'move is null'};
    }
    if (this.victory) {
//      return {err: 'game over'};
      return new State();
    }
    var player = move.player;
    if (player != this.cur_player) {
      return {err: 'not current player'};
    }
    var side = move.side;
    var ix = move.ix;
    var stones = this.stones[player][side][ix];
    var other_stones = this.stones[1-player][side][ix];
    if (move.action == 'add' && stones < MAX_STONES) {
      let ns = this.clone();
      ns.moves.push(move);
      ns.stones[player][side][ix]++;
      ns.cur_player = 1 - ns.cur_player;
      return ns;
    } else if (move.action == 'kick' && stones > 0) {
      let ns = this.clone();
      ns.moves.push(move);
      var vel = {x: stones, y: 0};
      ns.stones[1-player][side][ix] = Math.max(0, other_stones - stones);
      ns.stones[player][side][ix] = 0;
      if (player) {
	vel = vscale(-1, vel);
      }
      if (!side) {
	vel = vswap(vel);
      }
      ns.ball = vplus(this.ball, vel);
      ns.ball.x = Math.min(MAX_STONES, Math.max(-1, ns.ball.x));
      ns.ball.y = Math.min(MAX_STONES, Math.max(-1, ns.ball.y));
      if (ns.ball.x == -1 || ns.ball.x == MAX_STONES ||
	  ns.ball.y == -1 || ns.ball.y == MAX_STONES) {
	ns.victory = 1;
      }
      else {
	ns.cur_player = 1 - ns.cur_player;
      }
      return ns;
    }
    else {
      return {err: 'bad action or invariant violation'};
    }
  }

  clone() {
    var ns = new State();
    _.extend(ns, JSON.parse(JSON.stringify(this)));
    return ns;
  }
}

module.exports = State;
