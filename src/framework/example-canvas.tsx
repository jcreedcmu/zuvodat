import *  as React from 'react';
import { CanvasInfo, useCanvas } from './lib/use-canvas';
import { Dispatch } from './action';
import { relpos, rrelpos } from './lib/dutil';

export type ExampleCanvasProps = {
  counter: number,
  dispatch: Dispatch,
}

export type ExampleCanvasState = {
  counter: number,
}

function render(ci: CanvasInfo, state: ExampleCanvasState): void {
  const { d, size } = ci;
  d.clearRect(0, 0, size.x, size.y);

  d.fillStyle = '#def';
  d.beginPath();
  d.arc(size.x / 2, size.y / 2, size.x / 2 - 10, 0, 2 * Math.PI);
  d.fill();

  d.strokeStyle = 'black';
  d.lineWidth = 1;
  d.strokeRect(1, 1, size.x - 1, size.y - 1);

  d.fillStyle = '#449';
  const text = '' + state.counter;
  d.font = size.x * (1 / 10 + (130 / 200 / text.length)) + 'px serif';
  d.textBaseline = 'alphabetic';
  d.textAlign = 'center';

  const metrics = d.measureText(text);

  d.fillText(text, size.x / 2, size.y / 2 + (metrics.emHeightAscent) / 2);
}

function onLoad(ci: CanvasInfo): void {

}

export function ExampleCanvas(props: ExampleCanvasProps): JSX.Element {
  const { dispatch } = props;
  const [cref, mc] = useCanvas(props, render, [props], onLoad);
  function onMouseDown(e: React.MouseEvent): void {
    dispatch({ t: 'mouseDown', p_in_canvas: rrelpos(e) });
  }
  return <canvas onMouseDown={onMouseDown} style={{ width: 200, height: 200 }} ref={cref} />;
}
