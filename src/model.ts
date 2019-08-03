import { State, Screen } from "./state";

export class Model {
  state: State;

  constructor(state: State) {
    this.state = state;
  }

  set_state(newstate: State): boolean {
    // XXX better check than this??
    if (JSON.stringify(this.state) != JSON.stringify(newstate)) {
      this.state = newstate;
      return true;
    }
    else {
      return false;
    }
  }
}
