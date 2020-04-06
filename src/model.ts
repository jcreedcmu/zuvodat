import { State, Screen } from "./state";

export type GameState = {
  state: State,
  started: boolean,
  whoami: 0 | 1,
};

export class Model {
  gstate: GameState;

  constructor(state: State, whoami: 0 | 1) {
    this.gstate = { state, started: false, whoami };
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
    else {
      return false;
    }
  }
}
