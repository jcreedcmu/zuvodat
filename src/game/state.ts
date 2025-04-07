import { Point } from '../framework/lib/types';

export type Stones = { [player: number]: { [side: number]: number[] } };

export type Player = 0 | 1;
export type Side = 0 | 1;
export const players: Player[] = [0, 1];
export const sides: Side[] = [0, 1];

export type AddMove = {
  action: 'add',
  player: Player,
  side: Side,
  ix: number,
  active: boolean
};

export type KickMove = {
  action: 'kick',
  player: Player,
  side: Side,
  ix: number,
  active: boolean
};

export type Move = AddMove | KickMove;

export type GameState = {
  ball: Point,
  victory: boolean,
  cur_player: number,
  stones: Stones,
  moves: Move[],
};

function init_stones(): Stones {
  const rv: Stones = { 0: { 0: [], 1: [] }, 1: { 0: [], 1: [] } };
  players.forEach(player => {
    sides.forEach(side => {
      for (let i = 0; i < 11; i++)
        rv[player][side][i] = 0;
    });
  });
  return rv;
};

export const init_state: GameState = {
  stones: init_stones(),
  moves: [],
  ball: { x: 5, y: 5 },
  victory: false,
  cur_player: 0,
};
