import { View } from './view';
import { State, init_state } from './state';
import { Model } from './model';
import { nope } from './util';
import { imgProm } from './dutil';
import { Dict, TERM, Point, Move, ClientMsg, Side, WsMsg } from './types';
import { DEBUG } from './constants';
import { produce } from 'immer';
import { Loader } from './loader';

const _TERM = TERM; // just to force typescript compiler to reload types.ts

// these used to be injected by server, but I'm faking them for now
const board_id: string = "abcd-efgh";
const whoami: Side = 0;
const other: string = "other";

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
    this.model = new Model(init_state, whoami, other);
    this.model.set_started();
    this.model.gstate.state.cur_player = 0;
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
      this.open_ws();
      if (whoami === 1) {
        this.send_join(board_id);
      }
    });
  }

  resize(): void {
    console.log("RESIZE");
    this.view.resize();
    this.redraw();
  }

  redraw(): void {
    this.view.draw(this.model.gstate);
  }

  send_msg(msg: ClientMsg): void {
    fetch('move', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(msg),
    })
  }

  send_move(move: Move): void {
    this.send_msg({ t: 'move', board_id, move });
  }

  send_join(board_id: string): void {
    this.send_msg({ t: 'join', board_id });
  }

  handle_mouse(e: MouseEvent): void {
    const { view, model } = this;
    if (model.gstate.started) {
      const wpoint = { x: e.clientX, y: e.clientY };
      const move: Move | null = view.do_hit_test(model.gstate, wpoint);
      if (move != null) {
        this.send_move(move);
      }
    }
  }

  init_mouse(): void {
    const c = this.view.c;
    c.onmousedown = e => this.handle_mouse(e);
  }

  handle_msg(event: MessageEvent) {
    console.log("MESSAGE " + event.data);
    const wsmsg: WsMsg = JSON.parse(event.data);
    switch (wsmsg.t) {
      case 'init-state':
        this.model.set_state(wsmsg.state);
        this.redraw();
        break;

      case 'new-state':
        if (this.model.set_state(wsmsg.state)) {
          this.redraw();
        }
        break;

      case 'join':
        this.model.set_started();
        this.redraw();
        break;
    }
  }

  open_ws() {
    console.log('was going to open websocket');
  }
}
