import { PLAY_SIZE, SCALE, DEBUG, DIR_BUTTON_SIZE, DIR_BUTTON_MARGIN, DIR_BUTTON_LABEL_SIZE } from './constants';
import { nope, int, vm, vm2, vmn, vplus, vminus, vint, vfpart, Buffer, buffer, fbuf } from './util';
import * as u from './util';
import { Point, WidgetPoint, Rect, Color, Dict, TileType, Sprite, Dir } from './types';
import {
  State, MouseEphState, Screen,
  Position,
} from './state';


export class View {
  c: HTMLCanvasElement;
  d: CanvasRenderingContext2D;
  wsize: Point;
  origin: Point;
  gameImg: HTMLImageElement;
  spriteCache: Dict<Buffer> = {};

  constructor(c: HTMLCanvasElement, d: CanvasRenderingContext2D) {
    this.c = c;
    this.d = d;
  }

  draw(state: State): void {
    const { d } = this;
    d.save();
    d.scale(devicePixelRatio, devicePixelRatio);
    this.drawScaled(state);
    d.restore();
  }



  draw_screen(state: State, screen: Screen) {
    const { d } = this;
    switch (state.screen.t) {
      case 'title':
        break;
      default: return nope(state.screen.t);
    }
  }


  drawScaled(state: State): void {
    const { d } = this;

    // background
    d.fillStyle = "#000000";
    d.fillRect(0, 0, this.wsize.x, this.wsize.y);
    // d.fillStyle = "#ff0000";
    // d.fillRect(this.origin.x, this.origin.y,
    //   PLAY_SIZE.x * SCALE, PLAY_SIZE.y * SCALE);

    d.save();
    d.translate(this.origin.x, this.origin.y);
    d.scale(SCALE, SCALE);
    d.imageSmoothingEnabled = false;
    this.draw_screen(state, state.screen);
    d.restore();

    if (DEBUG.devicePixelRatio) {
      d.fillStyle = "black";
      d.fillRect(200, 100.25, 100, 0.5);
      d.fillRect(200, 110.5, 100, 0.5);
      d.fillRect(200, 120.75, 100, 0.5);
      d.fillRect(200, 131, 100, 0.5);
    }
  }

  resize(): void {
    const { c, d } = this;

    const ratio = devicePixelRatio;

    c.width = innerWidth;
    c.height = innerHeight;

    const ow = innerWidth;
    const oh = innerHeight;

    c.width = ow * ratio;
    c.height = oh * ratio;

    c.style.width = ow + 'px';
    c.style.height = oh + 'px';

    this.wsize = { x: c.width / ratio, y: c.height / ratio };

    const center = vm(this.wsize, wsize => int(wsize / 2));
    this.origin = vm2(center, PLAY_SIZE, (c, PS) => c - int(PS * SCALE / 2));
  }

  wpoint_of_canvas(p: Point, s: State): WidgetPoint {
    return {
      t: 'World',
      p: vmn([this.origin, p], ([o, p]) => Math.floor((p - o) / SCALE))
    };

  }
}
