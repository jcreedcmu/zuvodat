import { Dispatch } from "./action";
import { AppState } from "./state";

export type Effect =
  | { t: 'sendUpdate' }
  ;

export function doEffect(state: AppState, dispatch: Dispatch, effect: Effect): void {
  switch (effect.t) {
    case 'sendUpdate': {
      if (!(state.t == 'server' || state.t == 'client')) {
        console.error(`invariant violation: effect sendUpdate`);
        return;
      }
      state.conn.send(state.game);
    } break;
  }
}
