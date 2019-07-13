import { PLAY_SIZE } from './constants';
import { Point, Dict, Rect, Dir, Move, Player, Side } from './types';
import { nope, inrect, vminus, vplus } from './util';
import * as u from './util';
import { produce } from 'immer';

import { match } from './matcher';



export type Position =
  | { t: 'vcent', x: number }
  | { t: 'vcent_right', x: number }
  | { t: 'hcent', y: number }
  | { t: 'hcent_bot', y: number };

export type Screen = { t: 'title' };
export type Action =
  | { t: 'init' };

export type MouseEphState =
  | { t: 'button', id: string | null, origId: string }
  | { t: 'tile', id: string, pt: Point, origPt: Point }
  | { t: 'up', id: string | null }
  | { t: 'down', id: string | null };

export type EphemeralState = {
  mouse: MouseEphState
}

export interface MapI<T, U> {
  get(k: T): U;
  set(k: T, u: U): void;
}

export type Stones = { [player: number]: { [side: number]: number[] } };

export type State = {
  ball: Point,
  victory: boolean,
  cur_player: number,
  stones: Stones,
  moves: Move[],
  screen: Screen,
  eph: EphemeralState,
};

class UnknownLevelError extends Error {
}


function init_stones(): Stones {
  const rv: Stones = { 0: { 0: [], 1: [] }, 1: { 0: [], 1: [] } };
  [0, 1].forEach((player: Player) => {
    [0, 1].forEach((side: Side) => {
      for (let i = 0; i < 11; i++)
        rv[player][side][i] = 0;
    });
  });
  return rv;
};
export const init_state: State = {
  stones: init_stones(),
  moves: [],
  ball: { x: 5, y: 5 },
  victory: false,
  cur_player: 0,
  screen: { t: 'title' },
  eph: {
    mouse: { t: 'up', id: null },
  }
};

export type Event =
  | { t: 'mousedown', p: Point, move: Move | null }
  | { t: 'mouseup', p: Point }
  | { t: 'mousemove', p: Point };

export function reduce_action(state: State, action: Action): State {
  return state;
}

export function reduce(state: State, event: Event): State {
  return state;
}
