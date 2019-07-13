import { View } from './view';
import { State, Event, init_state } from './state';
import { Model } from './model';
import { imgProm, nope } from './util';
import { Dict, WidgetPoint, TERM } from './types';
import { DEBUG } from './constants';
import { produce } from 'immer';
import { Loader } from './loader';

const _TERM = TERM; // just to force typescript compiler to reload types.ts

window.onload = () => {
  const app = new App;
  app.run();
};

class App {
  view: View;
  model: Model;

  constructor() {
    const c = document.getElementById('c') as HTMLCanvasElement;
    const d = c.getContext('2d') as CanvasRenderingContext2D;

    this.view = new View(c, d);
    this.model = new Model(init_state);
  }

  run(): void {
    const { view } = this;

    if (DEBUG.globals) {
      (window as any)['app'] = this;
    }

    window.onresize = () => this.resize();

    this.init_mouse();

    const loader = new Loader();
    loader.image('game.png', 'game');
    loader.done(d => {
      view.gameImg = d.img['game'];
      this.resize();
    });
  }

  resize(): void {
    this.view.resize();
    this.redraw();
  }

  redraw(): void {
    this.view.draw(this.model.state);
  }

  init_mouse(): void {
    const { view, model } = this;
    const c = view.c;
    function handler(adapt: (p: WidgetPoint) => Event): (e: MouseEvent) => void {
      return (e: MouseEvent) => {
        const wpoint = view.wpoint_of_canvas({ x: e.clientX, y: e.clientY }, model.state);
        if (model.handle_event(adapt(wpoint))) {
          view.draw(model.state);
        }
      }
    }
    c.onmousedown = handler(p => ({ t: 'mousedown', p }));
    document.onmouseup = handler(p => ({ t: 'mouseup', p }));
    c.onmousemove = handler(p => ({ t: 'mousemove', p }));
  }
}
