import { Effect } from "./effect";
import { Point } from "./lib/types";
import { AppState } from "./state";
import { DataConnection } from "peerjs";

export type Action =
  | { t: 'connect' }
  | { t: 'mouseDown', p_in_canvas: Point }
  | { t: 'effect', effect: Effect }
  | { t: 'setAppState', state: AppState }
  | { t: 'serverGetConn', conn: DataConnection }
  | { t: 'rxMessage', message: any }
  ;

export type Dispatch = (action: Action) => void;
