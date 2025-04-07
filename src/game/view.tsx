import * as React from 'react';
import { Dispatch } from '../framework/action';
import { imgProm, rrelpos } from '../framework/lib/dutil';
import { Point, Rect } from '../framework/lib/types';
import { CanvasInfo, useCanvas } from '../framework/lib/use-canvas';
import { int, vm, vm2, vswap } from '../framework/lib/vutil';
import { AVATAR_OFF, AVATAR_SIZE, BGCOLOR, BLOT_SIZE, BOARD_SIZE, BOTTOM_ROW_Y, MAX_STONES, SCALE, STONE_SIZE, STONE_SPACE, STONE_START, TOP_ROW_Y, TRI_SIZE_X, TRI_SIZE_Y, TRI_START } from './constants';
import { GameState, Move, Player, players, Side, sides } from './state';
import { pointInRect } from '../framework/lib/util';

export type Sprite = { src: Point }; // position on sprite sheet
type Part =
  | { t: 'sprite', sprite: Sprite, rect: Rect, info: PartInfo }
  | { t: 'blot', rect: Rect }
  ;
type PartInfo = Move;

const images: Record<string, HTMLImageElement> = {};

export async function loadAssets(): Promise<void> {
  images['game'] = await imgProm('game.png');
}

export function resizeView(c: HTMLCanvasElement): ViewData {
  const ratio = devicePixelRatio;

  c.width = innerWidth;
  c.height = innerHeight;

  const ow = innerWidth;
  const oh = innerHeight;

  c.width = ow * ratio;
  c.height = oh * ratio;

  c.style.width = ow + 'px';
  c.style.height = oh + 'px';

  const wsize = vm({ x: c.width / ratio, y: c.height / ratio }, w => int(w));
  const origin: Point = { x: 0, y: 0 };
  console.log(wsize);
  return { origin, wsize };
}

export type ViewData = {
  wsize: Point, // this is the overall window size
  origin: Point, // this is the origin of the play area in pixels, as an offset from the browser window
};

export type GameProps = {
  viewData: ViewData,
  viewingPlayer: Player,
  state: GameState,
  dispatch: Dispatch,
}

function statusMessage(message: string, more?: JSX.Element): JSX.Element {
  console.log(message);
  return <>
    <div className='outerDiv'>
      <div className='innerDiv'>
        {message}{more}
      </div>
    </div>
  </>
}

function getParts(gst: GameState, viewingPlayer: Player): Part[] {
  const parts: Part[] = [];

  function blit(src: Point, dst: Point, size: Point, data: PartInfo) {
    parts.push({ t: 'sprite', sprite: { src }, rect: { p: dst, sz: size }, info: data });
  }

  function draw_stones(player: Player, side: Side): (num: number, ix: number) => void {
    return (num: number, ix: number) => {
      // coordinates and activeness of stone counter
      const active_hole = gst.cur_player == viewingPlayer && player == gst.cur_player && num != MAX_STONES;
      let px = STONE_START + ix * STONE_SPACE;
      let py = player == 0 ? TOP_ROW_Y : BOTTOM_ROW_Y;
      if (side) {
        const t = px;
        px = py;
        py = t;
      }
      let data: PartInfo = { player, side, ix, action: 'add', active: active_hole };
      blit(
        {
          x: BOARD_SIZE + (active_hole ? 0 : 1) * STONE_SIZE,
          y: num * STONE_SIZE + (1 - player) * STONE_SIZE * (MAX_STONES + 1)
        },
        { x: px, y: py },
        { x: STONE_SIZE, y: STONE_SIZE },
        data
      );

      const active_tri =
        player == gst.cur_player
        && gst.cur_player == viewingPlayer
        && gst.stones[player][side][ix] > 0
        && (ix == (side ? gst.ball.y : gst.ball.x));
      const ty = player == 0 ? 0 : 164;
      let ARROW_TYPE: 0 | 1 | 2 = 1;
      if (active_tri) {
        ARROW_TYPE = 0;
      }
      else if (gst.moves.length > 0) {
        const last_move = gst.moves[gst.moves.length - 1];
        if (last_move.action == "kick"
          && last_move.ix == ix
          && last_move.side == side
          && last_move.player == player) {
          ARROW_TYPE = 2;
        }
      }
      let src = { x: TRI_START + STONE_SPACE * ARROW_TYPE, y: ty };
      let dst = { x: TRI_START + STONE_SPACE * ix, y: ty };
      let size = { x: TRI_SIZE_X, y: TRI_SIZE_Y };
      if (side) {
        src = vswap(src);
        dst = vswap(dst);
        size = vswap(size);
      }
      data = { player, side, ix, action: 'kick', active: active_tri };
      blit(src, dst, size, data);
    };
  }

  if (!gst.victory) {
    players.forEach(player => {
      sides.forEach(side => {
        gst.stones[player][side].forEach(draw_stones(player, side));
      });
    });

    if (gst.moves.length > 0) {
      const last_move = gst.moves.at(-1)!;

      if (last_move.action == 'add') {
        let blot = {
          x: TRI_START + last_move.ix * STONE_SPACE,
          y: last_move.player == 0 ? TRI_SIZE_Y + 2 : BOTTOM_ROW_Y - 1
        };
        let blot_size = { x: STONE_SIZE + 2, y: STONE_SIZE + 2 };
        if (last_move.side) {
          blot = vswap(blot);
          blot_size = vswap(blot_size);
        }
        parts.push({ t: 'blot', rect: { p: blot, sz: blot_size } });
      }
    }
  }
  return parts;
}

function doTransform(ci: CanvasInfo): void {
  const { d } = ci;
  const w = ci.size.x;
  const h = ci.size.y;
  d.translate(int((w - BOARD_SIZE * SCALE * devicePixelRatio) / (2 * devicePixelRatio)),
    int((h - BOARD_SIZE * SCALE * devicePixelRatio) / (2 * devicePixelRatio)));
  d.scale(SCALE, SCALE);
}

function renderBg(ci: CanvasInfo, gst: GameState): void {
  const { d } = ci;
  const g = images['game'];
  const w = ci.size.x;
  const h = ci.size.y;
  d.save();

  d.imageSmoothingEnabled = false;
  d.fillStyle = BGCOLOR;

  d.fillRect(0, 0, w, h);
  doTransform(ci);

  d.drawImage(g, 0, 0, BOARD_SIZE, BOARD_SIZE, 0, 0, BOARD_SIZE, BOARD_SIZE);
  d.fillStyle = BGCOLOR;
  d.fillRect(AVATAR_OFF, 1, AVATAR_SIZE, AVATAR_SIZE);
  d.fillRect(1, AVATAR_OFF, AVATAR_SIZE, AVATAR_SIZE);

  d.drawImage(g, BOARD_SIZE + 14, 0, STONE_SIZE, STONE_SIZE,
    STONE_START + gst.ball.x * STONE_SPACE,
    STONE_START + gst.ball.y * STONE_SPACE,
    STONE_SIZE, STONE_SIZE);

  // victory cleanup
  if (gst.victory) {
    [0, 1].forEach(player => {
      [0, 1].forEach(side => {
        let blot = { x: TRI_START, y: player == 0 ? 0 : BOTTOM_ROW_Y };
        let blot_size = BLOT_SIZE;
        if (side) {
          blot = vswap(blot);
          blot_size = vswap(blot_size);
        }
        d.fillStyle = BGCOLOR;
        d.fillRect(blot.x, blot.y, blot_size.x, blot_size.y);
      });
    });

    if (gst.cur_player == 0) {
      d.drawImage(g, AVATAR_OFF, 1, AVATAR_SIZE, AVATAR_SIZE, 1, 1, AVATAR_SIZE, AVATAR_SIZE);
    }
    else {
      d.drawImage(g, 1, AVATAR_OFF, AVATAR_SIZE, AVATAR_SIZE, AVATAR_OFF, AVATAR_OFF, AVATAR_SIZE, AVATAR_SIZE);
    }
  }
  d.restore();
}

function renderPart(ci: CanvasInfo, part: Part): void {
  const { d } = ci;
  switch (part.t) {
    case 'sprite':
      d.drawImage(images['game'], part.sprite.src.x, part.sprite.src.y,
        part.rect.sz.x, part.rect.sz.y,
        part.rect.p.x, part.rect.p.y,
        part.rect.sz.x, part.rect.sz.y);
      break;
    case 'blot':
      d.strokeStyle = 'rgba(255,255,128,0.7)';
      d.strokeRect(
        part.rect.p.x - 0.5, part.rect.p.y - 0.5,
        part.rect.sz.x + 1, part.rect.sz.y + 1);
      break;
  }
}

function drawScreen(ci: CanvasInfo, state: GameProps): void {
  const gst = state.state;
  const { d } = ci;

  renderBg(ci, gst);
  const parts = getParts(gst, state.viewingPlayer);

  const w = ci.size.x;
  const h = ci.size.y;
  d.save();
  doTransform(ci);
  parts.forEach(part => {
    renderPart(ci, part);
  });
  d.restore();
}

function render(ci: CanvasInfo, state: GameProps): void {
  const { d } = ci;
  d.save();
  d.scale(devicePixelRatio, devicePixelRatio);
  d.imageSmoothingEnabled = false;

  drawScreen({ c: ci.c, d: ci.d, size: state.viewData.wsize }, state);
  d.restore();
}

export function do_hit_test(viewData: ViewData, state: GameState, p: Point, viewingPlayer: Player): Move | null {
  console.log(viewData.wsize);
  const SC = SCALE * devicePixelRatio;
  const hit = {
    x: (p.x - int((viewData.wsize.x - BOARD_SIZE * SC) / 2)) / SC,
    y: (p.y - int((viewData.wsize.y - BOARD_SIZE * SC) / 2)) / SC
  };
  for (let part of getParts(state, viewingPlayer)) {
    if (pointInRect(hit, part.rect) && part.t == 'sprite') {
      return part.info;
    }
  }
  return null;
}

export function GameView(props: GameProps): JSX.Element {
  const { dispatch } = props;
  const [cref, mc] = useCanvas(props, render, [props, props.viewData], ci => {
    dispatch({ t: 'resize', vd: resizeView(ci.c) });
  });
  React.useEffect(() => {
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  });
  function onMouseDown(e: React.MouseEvent): void {
    dispatch({ t: 'mouseDown', p_in_canvas: rrelpos(e) });
  }
  return <canvas onMouseDown={onMouseDown} style={{ top: 0, left: 0, position: 'absolute' }} ref={cref} />;

  function handleResize(e: UIEvent) {
    const vd = resizeView(mc.current!.c);
    dispatch({ t: 'resize', vd });
  }
}
