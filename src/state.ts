import { PLAY_SIZE } from './constants';
import { Point, WidgetPoint, Dict, TileType, Rect, Dir } from './types';
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
  screen: Screen,
  eph: EphemeralState,
};

class UnknownLevelError extends Error {
}


export const init_state: State = {
  screen: { t: 'title' },
  eph: {
    mouse: { t: 'up', id: null },
  }
};

export type Event =
  | { t: 'mousedown', p: WidgetPoint }
  | { t: 'mouseup', p: WidgetPoint }
  | { t: 'mousemove', p: WidgetPoint };

export function reduce_action(state: State, action: Action): State {
  return state;
}

export function reduce(state: State, event: Event): State {
  return state;
}
