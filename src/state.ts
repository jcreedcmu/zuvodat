import { PLAY_SIZE } from './constants';
import { Point, Dict, Rect, Dir, Move } from './types';
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


export type State = {
  ball: Point,
  victory: boolean,
  cur_player: number,
  stones: { [player: number]: { [side: number]: number[] } },
  moves: Move[],
  screen: Screen,
  eph: EphemeralState,
};

class UnknownLevelError extends Error {
}


export const init_state: State = {
  stones: { 0: { 0: [], 1: [] }, 1: { 0: [], 1: [] } },
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
  | { t: 'mousedown', p: Point }
  | { t: 'mouseup', p: Point }
  | { t: 'mousemove', p: Point };

export function reduce_action(state: State, action: Action): State {
  return state;
}

export function reduce(state: State, event: Event): State {
  return state;
}
