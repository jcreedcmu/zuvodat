import { Effect } from "./effect";
import { DataConnection, Peer } from "peerjs";
import { GameState } from '../game/state';

export type AppState =
  | {
    t: 'initializing',
    effects: Effect[],
    id: string,
  }
  | {
    t: 'server_waiting_for_client',
    peer: Peer,
    effects: Effect[],
    id: string,
  }
  | {
    t: 'server',
    id: string,
    peer: Peer,
    conn: DataConnection,
    game: GameState,
    effects: Effect[],
    log: string[],
  }
  | {
    t: 'client',
    id: string,
    serverId: string,
    peer: Peer,
    conn: DataConnection,
    game: GameState,
    effects: Effect[],
    log: string[],
  }
  ;

export function mkState(): AppState {
  const idKey = 'id';
  if (localStorage[idKey] == undefined) {
    localStorage[idKey] = crypto.randomUUID();
  }
  const id = localStorage[idKey];
  return { t: 'initializing', effects: [], id };
}
