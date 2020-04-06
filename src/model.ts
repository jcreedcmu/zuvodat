import { State, Screen } from "./state";
import { Side } from "./types";

export type GameState = {
  state: State,
  started: boolean,
  whoami: 0 | 1,
  other: string,
};

export class Model {
  gstate: GameState;

  constructor(state: State, whoami: Side, other: string) {
    this.gstate = { state, started: whoami === 1, whoami, other };
  }

  set_started(): void {
    this.gstate.started = true;
  }

  set_state(newstate: State): boolean {
    // XXX better check than this??
    if (JSON.stringify(this.gstate.state) != JSON.stringify(newstate)) {
      this.gstate.state = newstate;
      return true;
    }
    return false;
  }
}
