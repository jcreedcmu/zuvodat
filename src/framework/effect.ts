import { Dispatch } from "./action";
import { AppState } from "./state";

export type Effect =
  | { t: 'send', message: any } // XXX deprecated
  | { t: 'sendUpdate' }
  ;

export function doEffect(state: AppState, dispatch: Dispatch, effect: Effect): void {
  switch (effect.t) {
    case 'send': {
      if (!(state.t == 'server' || state.t == 'client')) {
        console.error(`invariant violation: effect send`);
        return;
      }
      state.conn.send(effect.message);
    } break;
    case 'sendUpdate': {
      if (!(state.t == 'server' || state.t == 'client')) {
        console.error(`invariant violation: effect sendUpdate`);
        return;
      }
      state.conn.send(state.game);
    } break;
  }
}
