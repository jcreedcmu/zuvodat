import * as React from 'react';
import { Dispatch } from '../framework/action';
import { Player, GameState } from './state';
import { CanvasInfo, useCanvas } from '../framework/lib/use-canvas';
import { rrelpos } from '../framework/lib/dutil';
import { Part } from '../types';

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

function renderBg(d: CanvasRenderingContext2D, gst: GameState): void {

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
  renderBg(d, gst);
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
