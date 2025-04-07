import * as React from 'react';
import { Dispatch } from '../framework/action';
import { Player, GameState } from './state';
import { CanvasInfo, useCanvas } from '../framework/lib/use-canvas';
import { imgProm, rrelpos } from '../framework/lib/dutil';
import { Part } from '../types';
import { AVATAR_OFF, AVATAR_SIZE, BGCOLOR, BLOT_SIZE, BOARD_SIZE, BOTTOM_ROW_Y, SCALE, STONE_SIZE, STONE_SPACE, STONE_START, TRI_START } from './constants';
import { int, vswap } from '../framework/lib/vutil';

const images: Record<string, HTMLImageElement> = {};

export async function loadAssets(): Promise<void> {
  images['game'] = await imgProm('game.png');
}

export type GameProps = {
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

function getParts(gst: GameState): Part[] {
  return [];
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
  d.translate(int((w - BOARD_SIZE * SCALE) / 2),
    int((h - BOARD_SIZE * SCALE) / 2));
  d.scale(SCALE, SCALE);

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

function renderPart(d: CanvasRenderingContext2D, part: Part): void {

}

function drawScreen(d: CanvasRenderingContext2D, gst: GameState): void {
}

function render(ci: CanvasInfo, state: GameProps): void {
  const { d } = ci;
  d.save();
  d.scale(devicePixelRatio, devicePixelRatio);
  d.imageSmoothingEnabled = false;
  const gst = state.state;
  renderBg(ci, gst);
  getParts(gst).forEach(part => {
    renderPart(d, part)
  });
  d.restore();
}

function onLoad(ci: CanvasInfo): void {

}

export function GameView(props: GameProps): JSX.Element {
  const { dispatch } = props;
  const [cref, mc] = useCanvas(props, render, [props], onLoad);
  function onMouseDown(e: React.MouseEvent): void {
    dispatch({ t: 'mouseDown', p_in_canvas: rrelpos(e) });
  }
  return <canvas onMouseDown={onMouseDown} style={{ top: 0, left: 0, position: 'absolute', width: '100%', height: '100%' }} ref={cref} />;

}
