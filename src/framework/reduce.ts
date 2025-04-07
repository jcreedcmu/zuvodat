import { produce } from 'immer';
import { AppState } from './state';
import { Action } from './action';
import { init_state } from '../game/state';
import { reduce as reduceAction } from '../game/reduce-action';

export function reduce(state: AppState, action: Action): AppState {
  switch (action.t) {
    case 'connect': {
      return state;
    }
    case 'mouseDown': {
      if (state.t == 'server') {
        if (state.game.cur_player == 0) {
          const newGameState = reduceAction(state.game, action);
          return produce(state, s => { s.game = newGameState; s.effects.push({ t: 'sendUpdate' }); });
        }
        else return state;
      }
      else if (state.t == 'client') {
        if (state.game.cur_player == 1) {
          const newGameState = reduceAction(state.game, action);
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
  }
}
