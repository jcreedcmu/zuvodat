import { State, Screen, Event, reduce } from "./state";
import { Point } from './types';

export class Model {
  state: State;

  constructor(state: State) {
    this.state = state;
  }

  handle_event(e: Event): boolean {
    const newstate = reduce(this.state, e);
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
