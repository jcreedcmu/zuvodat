import { State } from "./state";

export type Dict<T> = { [k: string]: T };
export type Point = { x: number, y: number };
export type Color = { r: number, g: number, b: number, a: number };
export type Rect = { p: Point, sz: Point };
export type Ctx = CanvasRenderingContext2D;

export const TERM = 'TERM';

export type Dir = 'n' | 's' | 'w' | 'e';

export type WsMsg =
  | { t: 'join' }
  | { t: 'new-state', state: State }
  | { t: 'init-state', state: State };

export type ClientMsg =
  | { t: 'join' } & JoinClientMsg
  | { t: 'move' } & MoveClientMsg;

export type JoinClientMsg = {
  board_id: string,
};

export type MoveClientMsg = {
  board_id: string,
  move: Move,
};

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

export type PartInfo = Move;
export type Sprite = { src: Point }; // position on sprite sheet
export type Part = { t: 'sprite', sprite: Sprite, rect: Rect, info: PartInfo }
  | { t: 'blot', rect: Rect };
export type Player = 0 | 1;
export type Side = 0 | 1;
