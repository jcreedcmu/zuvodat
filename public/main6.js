SCALE = 3;
BOARD_SIZE = 169;
AVATAR_OFF = 151;
AVATAR_SIZE = 17;
BGCOLOR = '#ddc492';
STONE_SIZE = 7;
STONE_START = 26;
STONE_SPACE = 11;
TRI_START = 25;
TRI_SIZE_X = 9;
TRI_OFFSET = 9;
TRI_SIZE_Y = 5;
TOP_ROW_Y = 8;
STONE_SIZE = 7;
BOTTOM_ROW_Y = 154;
BLOT_SIZE = {x: 119, y: 15};

var ld = new Loader();
ld.add(image('game.png', 'game'));
ld.done(go);

class View {
  constructor(state) {
    this.state = state;
  }

  set_state(state) {
    this.state = state;
  }

  render(d) {
    var st = this.state;
    var g = ld.img.game;
    var hit_test = d.hit_test != null;
    var hit = {};

    if (!hit_test) {
      d.save();
      d.webkitImageSmoothingEnabled = false;
      d.fillStyle = BGCOLOR;
      d.fillRect(0,0,w,h);
      d.translate(int((w - BOARD_SIZE * SCALE) / 2),
		  int((h - BOARD_SIZE * SCALE) / 2));
      d.scale(SCALE,SCALE);

      d.drawImage(g, 0, 0, BOARD_SIZE, BOARD_SIZE, 0, 0, BOARD_SIZE, BOARD_SIZE);
      d.fillStyle = BGCOLOR;
      d.fillRect(AVATAR_OFF, 1, AVATAR_SIZE, AVATAR_SIZE);
      d.fillRect(1, AVATAR_OFF, AVATAR_SIZE, AVATAR_SIZE);

      d.drawImage(g, BOARD_SIZE + 14, 0, STONE_SIZE, STONE_SIZE,
		  STONE_START + st.ball.x * STONE_SPACE,
		  STONE_START + st.ball.y * STONE_SPACE,
		  STONE_SIZE, STONE_SIZE);

      // victory cleanup
      if (st.victory) {
	_.each([0,1], player => {
	  _.each([0,1], side => {
	    var blot = {x: TRI_START, y: player == 0 ? 0 : BOTTOM_ROW_Y};
	    var blot_size = BLOT_SIZE;
	    if (side) {
	      blot = vswap(blot);
	      blot_size = vswap(blot_size);
	    }
	    d.fillStyle = BGCOLOR;
	    d.fillRect(blot.x, blot.y, blot_size.x, blot_size.y);
	  });
	});

	if (st.cur_player == 0) {
	  d.drawImage(g, AVATAR_OFF, 1, AVATAR_SIZE, AVATAR_SIZE, 1, 1, AVATAR_SIZE, AVATAR_SIZE);
	}
	else {
	  d.drawImage(g, 1, AVATAR_OFF, AVATAR_SIZE, AVATAR_SIZE, AVATAR_OFF, AVATAR_OFF, AVATAR_SIZE, AVATAR_SIZE);
	}
      }
    }
    else {
      hit.x = (d.x - int((w - BOARD_SIZE * SCALE) / 2)) / SCALE;
      hit.y = (d.y - int((h - BOARD_SIZE * SCALE) / 2)) / SCALE;
    }



    var blit = (src, dst, size, data) => {
      if (hit_test) {
	if (hit.x > dst.x && hit.x <= dst.x + size.x &&
	    hit.y > dst.y && hit.y <= dst.y + size.y) {
	  throw data;
	}
      }
      else {
	d.drawImage(g, src.x, src.y, size.x, size.y, dst.x, dst.y, size.x, size.y);
      }
    }

    var draw_stones = (player, side) => {
      return (num, ix) => {

	// coordinates and activeness of stone counter
	var inactive = player != st.cur_player || num == MAX_STONES;
	var px = STONE_START + ix * STONE_SPACE;
	var py = player == 0 ? TOP_ROW_Y : BOTTOM_ROW_Y;
	if (side) {
	  var t = px;
	  px = py;
	  py = t;
	}
	let data = {player, side, ix, action: 'add', active: !inactive};
	blit({x: BOARD_SIZE + inactive * STONE_SIZE,
	      y: num * STONE_SIZE + (1 - player) * STONE_SIZE * (MAX_STONES + 1)},
	     {x: px, y: py},
	     {x: STONE_SIZE, y: STONE_SIZE},
	     data);

	var active = player == st.cur_player && st.stones[player][side][ix] > 0 && (ix == (side ? st.ball.y : st.ball.x));
	var ty = player == 0 ? 0 : 164;
	var ARROW_TYPE = 1;
	if (active) {
	  ARROW_TYPE = 0;
	}
	else if (st.moves.length > 0) {
	  var last_move = _.last(st.moves);
	  if (last_move.action == "kick"
	      && last_move.ix == ix
	      && last_move.side == side
	      && last_move.player == player) {
	    ARROW_TYPE = 2;
	  }
	}
	var src = {x: TRI_START + STONE_SPACE * ARROW_TYPE, y: ty};
	var dst = {x: TRI_START + STONE_SPACE * ix, y: ty};
	var size = {x: TRI_SIZE_X, y: TRI_SIZE_Y};
	if (side) {
	  src = vswap(src);
	  dst = vswap(dst);
	  size = vswap(size);
	}
	data = {player, side, ix, action: 'kick', active: active};
	blit(src, dst, size, data);
      };
    }

    if (!st.victory) {
      _.each([0,1], player => {
	_.each([0,1], side => {
	  _.each(st.stones[player][side], draw_stones(player, side));
	});
      });


      if (st.moves.length > 0) {
	var last_move = _.last(st.moves);
	var blot, blot_size;
	if (last_move.action == 'add') {
	  // blot = {x: -1 + TRI_START + last_move.ix * STONE_SPACE,
	  // 	  y: last_move.player == 0 ? -1 : BOTTOM_ROW_Y + TRI_OFFSET};
	  // blot_size = {x: TRI_SIZE_X + 2, y: TRI_SIZE_Y + 2};
	  blot = {x: TRI_START + last_move.ix * STONE_SPACE,
		  y: last_move.player == 0 ? TRI_SIZE_Y + 2 : BOTTOM_ROW_Y - 1};
	  blot_size = {x: STONE_SIZE + 2, y: STONE_SIZE + 2};
	  if (last_move.side) {
	    blot = vswap(blot);
	    blot_size = vswap(blot_size);
	  }
	  d.strokeStyle = 'rgba(255,255,128,0.7)';
	  d.strokeRect(blot.x - 0.5, blot.y - 0.5, blot_size.x + 1, blot_size.y + 1);
	}
      }
    }

    if (!hit_test) {
      d.restore();
    }
  }

  do_mouse(e) {
    var st = this.state;
    var p = relpos(e, c);
    p.hit_test = true;
    try {
      this.render(p);
      return st;
    } catch (move) {
      if (move.active) {
	delete move.active;
	return move;
      }
      else {
	return null;
      }
    }
  }
}

class Lookahead {

  constructor(opts) {
    this.depth = 3;
    this.width = 1;
    if (opts != null)
      _.extend(this, opts);
    console.log(this.width);
  }

  cand_moves(st) {
    var rv = [];
    var player = st.cur_player;
    for(let sd = 0; sd < 2; sd++) {
      let dir = ['x', 'y'][sd];
      var bix = st.ball[dir];
      if (st.stones[player][sd][bix] > 0) {
	rv.push({player, action: 'kick', side: sd, ix: bix});
      }
      for (let bbix = bix - this.width; bbix <= bix + this.width; bbix++) {
	if (bbix > 0 && bbix < MAX_STONES-1 && st.stones[player][sd][bbix] < 11)
	  rv.push({player, action: 'add', side: sd, ix: bbix});
      }
    }
    return rv;
  }

  eval(st, depth) {
    var player = st.cur_player;
    if (st.victory) {
      return -1e9;
    }

    if (depth == 0) {
      var relstone = { me: [st.stones[player][0], st.stones[player][1]],
		       them: [st.stones[1-player][0], st.stones[1-player][1]] };
      var bstone = {
	me:
	[st.stones[player][0][st.ball.x],
	 st.stones[player][1][st.ball.y]],
	them:
	[st.stones[1-player][0][st.ball.x],
	 st.stones[1-player][1][st.ball.y]],
      };
      var ballgood = {x: st.ball.x - 5, y: st.ball.y - 5};
      if (player == 1)
	ballgood = vscale(-1, ballgood);

      let v = bstone.me[0] + bstone.me[1] +
	sum(relstone.me[0]) + sum(relstone.me[1])
	- sum(relstone.them[0]) - sum(relstone.them[1]) +
	5 * (ballgood.x + ballgood.y);
      return v;
    }
    else {
      var moves = this.cand_moves(st);
      return -_.min(_.map(moves, move => this.eval(st.step(move), depth-1)));
    }
  }

  best_move(st) {
    var moves = this.cand_moves(st);
    return _.min(moves, move => this.eval(st.step(move), this.depth));
  }
}

class Simple {

  best_move(state) {
    var player = state.cur_player;

    var obstone = [
      [state.stones[player][0][state.ball.x],
       state.stones[player][1][state.ball.y]],
      [state.stones[1-player][0][state.ball.x],
       state.stones[1-player][1][state.ball.y]],
    ];

    var goaldist = player ?
      [state.ball.x + 1, state.ball.y + 1] :
      [11 - state.ball.x, 11 - state.ball.y];

    for(let sd = 0; sd < 2; sd++) {
      let dir = ['x', 'y'][sd];
      if (obstone[0][sd] >= goaldist[1-sd]) {
	return {player, action: 'kick', side: sd, ix: state.ball[dir]};
      }
    }

    for(let sd = 0; sd < 2; sd++) {
      let dir = ['x', 'y'][sd];
      if (obstone[0][sd] > 0 && obstone[1][sd] > 0) {
	return {player, action: 'kick', side: sd, ix: state.ball[dir]};
      }
    }

    var side = Math.random() > 0.5 ? 1 : 0;

    function do_side(side) {
      var sxy = side ? 'y' : 'x';
      var kickprob = 0;
      if (state.stones[player][side][state.ball[sxy]] >= 1 && Math.random() < 0.4) {
	return {player, action: 'kick', side, ix: state.ball[sxy]};
      }
      if (state.stones[player][side][state.ball[sxy]] >= 2 && Math.random() < 0.8) {
	return {player, action: 'kick', side, ix: state.ball[sxy]};
      }
      return {player, action: 'add', side, ix: state.ball[sxy]};
    }

    var rv = do_side(side);
    if (rv.action == 'add' && obstone[1][side] > 0) {
      return do_side(1-side);
    }
    else return rv;
  }
}

function do_ai(state, strat) {
  var move = strat.best_move(state);
  return move;
  // var newstate = state.step(move);
  // if (newstate != "illegal") {
  //   return newstate;
  // }
  // else {
  //   console.log('ai tried to make illegal move', move, state);
  //   return state;
  // }
}

function open_ws(view) {
  var host = location.origin.replace(/^http/, 'ws') + '/' + board_id;
  console.log(host);
  var ws = new WebSocket(host);
  ws.addEventListener('message', function (event) {
    view.set_state(_.extend(new State(), JSON.parse(event.data)));
    view.render(d);
  });
  ws.addEventListener('close', function () {
    console.log('closing, trying to reopen');
    setTimeout(function () { open_ws(view); }, 1000);
  });
}

function make_move(move) {
  $.ajax({url:'move', data: {move: JSON.stringify(move)}});
}

function go() {
  fullscreen();

  view = new View(new State());

  open_ws(view);
  $(c).on('mousedown', e => {
    var move = view.do_mouse(e);
    if (move != null) {
      make_move(move);
    }
    e.preventDefault();
  });

  $('body').on('keydown', e => {
    if (e.keyCode == 32) {
      make_move(do_ai(view.state, new Simple()));
      e.preventDefault();
    }
    if (e.keyCode == 72) { // 'h'
      make_move(do_ai(view.state, new Lookahead({width: 1})));
      e.preventDefault();
    }
    if (e.keyCode == 74) { // 'j'
      make_move(do_ai(view.state, new Lookahead({width: 2})));
      e.preventDefault();
    }
  });
}
