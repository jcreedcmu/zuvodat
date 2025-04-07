import { produce } from 'immer';
import { AppState } from './state';
import { Action } from './action';
import { init_state } from '../game/state';
import { reduce as reduceMove } from '../game/reduce-move';
import { do_hit_test, ViewData } from '../game/view';

export const nullVd: ViewData = {
  origin: { x: 0, y: 0 },
  wsize: { x: 0, y: 0 },
};

export function reduce(state: AppState, action: Action): AppState {
  switch (action.t) {
    case 'connect': {
      return state;
    }
    case 'mouseDown': {
      if (state.t == 'server') {
        if (state.game.cur_player == 0) {
          const move = do_hit_test(state.viewData, state.game, action.p_in_canvas, 0);
          if (move == null) return state;
          const newGameState = reduceMove(state.game, move, 0);
          return produce(state, s => { s.game = newGameState; s.effects.push({ t: 'sendUpdate' }); });
        }
        else return state;
      }
      else if (state.t == 'client') {
        if (state.game.cur_player == 1) {
          const move = do_hit_test(state.viewData, state.game, action.p_in_canvas, 1);
          if (move == null) return state;
          const newGameState = reduceMove(state.game, move, 1);
          return produce(state, s => { s.game = newGameState; s.effects.push({ t: 'sendUpdate' }); });
        }
        else return state;
      }
      else {
        console.error(`Invariant violation: action mousedown`);
        return state;
      }
    }
    case 'effect': {
      return produce(state, s => {
        s.effects.push(action.effect);
      });
    }
    case 'setAppState': {
      return action.state;
    }
    case 'serverGetConn': {
      if (state.t != 'server_waiting_for_client') {
        console.error(`invariant violation: action serverGetConn`);
        return state;
      }
      return {
        t: 'server',
        id: state.id,
        effects: [],
        game: init_state,
        viewData: nullVd,
        conn: action.conn,
        peer: state.peer,
        log: [],
      }
    }
    case 'rxMessage': {
      if (!(state.t == 'server' || state.t == 'client')) {
        console.error(`invariant violation: action rxMessage`);
        return state;
      }
      return produce(state, s => {
        s.game = action.message; // assumes message is new game state
      });
    }
    case 'resize': {
      if ((state.t == 'server' || state.t == 'client')) {
        return produce(state, s => {
          s.viewData = action.vd;
        });
      }
      else return state;
    }
  }
}
