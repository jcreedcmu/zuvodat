export type Dict<T> = { [k: string]: T };
export type Point = { x: number, y: number };
export type Color = { r: number, g: number, b: number, a: number };
export type Rect = { p: Point, sz: Point };
export type Ctx = CanvasRenderingContext2D;

export type WidgetPoint =
  | { t: 'World', p: Point };

// export type TileType = 'empty' | 'one' | 'two' | 'three';

export enum TileType {
  empty = 'empty',
  w_one = 'w_one',
  w_two = 'w_two',
  w_three = 'w_three',
  w_four = 'w_four',
  w_five_plus = 'w_five_plus',
  w_five_cross = 'w_five_cross',

  b_one = 'b_one',
  b_two = 'b_two',
  b_three = 'b_three',
  b_four = 'b_four',
  b_five_plus = 'b_five_plus',
  b_five_cross = 'b_five_cross',

  w_nine = 'w_nine',
  b_nine = 'b_nine',
  m_nine_1 = 'm_nine_1',
  m_nine_2 = 'm_nine_2',
  m_nine_3 = 'm_nine_3',
  m_nine_4 = 'm_nine_4',
  m_nine_5 = 'm_nine_5',
  m_nine_6 = 'm_nine_6',

  w_big_circle = 'w_big_circle',
  g_big_circle = 'g_big_circle',
  w_big_square = 'w_big_square',
  w_small_square = 'w_small_square',
  w_big_triangle = 'w_big_triangle',
  w_small_triangle = 'w_small_triangle',
  w_big_sugira = 'w_big_sugira',
  w_small_sugira = 'w_small_sugira',
}

//  | 'empty' | 'one' | 'two' | 'three';
export type TileData = { active: boolean, tt: TileType };
export type Sprite = { t: 'shadow' } | { t: 'tile', d: TileData } | { t: 'dir_indicator', dir: Dir };

export const TERM = 'TERM';

export type Dir = 'n' | 's' | 'w' | 'e';
