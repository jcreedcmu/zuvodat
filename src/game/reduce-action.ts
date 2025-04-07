import { produce } from 'immer';
import { Point } from '../framework/lib/types';
import { GameState } from './state';

export type Action =
  | { t: 'mouseDown', p_in_canvas: Point }
  ;

export function reduce(state: GameState, action: Action): GameState {
  return produce(state, s => { s.stones[0][1][5] = 2; s.cur_player = 1 - state.cur_player; });
}
