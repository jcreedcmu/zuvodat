import { Dispatch } from "./action";
import { AppState } from "./state";

export type Effect =
  | { t: 'send', message: any }
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
  }
}
