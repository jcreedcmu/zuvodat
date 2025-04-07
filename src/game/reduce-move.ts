import { produce } from 'immer';
import { GameState as State, init_state, Move, Player } from './state';
import { MAX_STONES } from './constants';
import { vadd, vscale, vswap } from '../framework/lib/vutil';

type Err = { err: string };

export function reduce_move(state: State, move: Move | null, issuing_player: Player): State | Err {

  if (state.victory) {
    return init_state;
  }
  if (move == null) {
    return { err: 'move is null' };
  }
  const player = move.player;
  if (player != state.cur_player) {
    return { err: 'not current player' };
  }
  if (issuing_player != state.cur_player) {
    return { err: 'issuing player is not current player' };
  }

  const side = move.side;
  const ix = move.ix;
  const stones = state.stones[player][side][ix];
  const other_stones = state.stones[1 - player][side][ix];
  if (move.action == 'add' && stones < MAX_STONES) {
    return produce(state, ns => {
      ns.moves.push(move);
      ns.stones[player][side][ix]++;
      ns.cur_player = 1 - ns.cur_player;
    });
  } else if (move.action == 'kick' && stones > 0) {
    return produce(state, ns => {
      ns.moves.push(move);
      let vel = { x: stones, y: 0 };
      ns.stones[1 - player][side][ix] = Math.max(0, other_stones - stones);
      ns.stones[player][side][ix] = 0;
      if (player) {
        vel = vscale(vel, -1);
      }
      if (!side) {
        vel = vswap(vel);
      }
      ns.ball = vadd(state.ball, vel);
      ns.ball.x = Math.min(MAX_STONES, Math.max(-1, ns.ball.x));
      ns.ball.y = Math.min(MAX_STONES, Math.max(-1, ns.ball.y));
      if (ns.ball.x == -1 || ns.ball.x == MAX_STONES ||
        ns.ball.y == -1 || ns.ball.y == MAX_STONES) {
        ns.victory = true;
      }
      else {
        ns.cur_player = 1 - ns.cur_player;
      }
    });
  }
  else {
    return { err: 'bad action or invariant violation' };
  }
}

export function reduce(state: State, move: Move, issuing_player: Player): State {
  const state_or_err = reduce_move(state, move, issuing_player);
  if ('err' in state_or_err) {
    console.log(state_or_err);
    return state;
  }
  else {
    return state_or_err;
  }
}
