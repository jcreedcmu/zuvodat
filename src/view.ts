import { SCALE, DEBUG, PLAY_SIZE, BOARD_SIZE, AVATAR_SIZE, STONE_START, STONE_SIZE, STONE_SPACE, BGCOLOR, AVATAR_OFF, TRI_START, BOTTOM_ROW_Y, BLOT_SIZE, MAX_STONES, TOP_ROW_Y, TRI_SIZE_X, TRI_SIZE_Y } from './constants';
import { nope, int, vm, vm2, vmn, vplus, vminus, vint, vfpart } from './util';
import { Buffer, buffer, fbuf } from './dutil';
import * as u from './util';
import { Point, Rect, Color, Dict, Dir, PartInfo, Player, Side, Part, Move } from './types';
import {
  State, Screen,
} from './state';
import { GameState } from './model';


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

  draw(gstate: GameState): void {
    if (gstate.started || gstate.whoami == 1) {
      document.getElementById('message')!.innerHTML = '';
      if (this.wsize == undefined)
        this.resize();
      const { d } = this;
      d.save();
      d.scale(devicePixelRatio, devicePixelRatio);
      this.drawScaled(gstate);
      d.restore();
    }
    else {
      const link = "/b/" + gstate.other;
      const msg = `Give <a href="${link}">this link</a> to the other player.`;
      document.getElementById('message')!.innerHTML = msg;
    }
  }

  getParts(gst: GameState): Part[] {
    const parts: Part[] = [];

    const st = gst.state;

    function blit(src: Point, dst: Point, size: Point, data: PartInfo) {
      parts.push({ t: 'sprite', sprite: { src }, rect: { p: dst, sz: size }, info: data });
    }

    function draw_stones(player: Player, side: Side): (num: number, ix: number) => void {
      return (num: number, ix: number) => {
        // coordinates and activeness of stone counter
        const active_hole = st.cur_player == gst.whoami && player == st.cur_player && num != MAX_STONES;
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
          player == st.cur_player
          && st.cur_player == gst.whoami
          && st.stones[player][side][ix] > 0
          && (ix == (side ? st.ball.y : st.ball.x));
        const ty = player == 0 ? 0 : 164;
        let ARROW_TYPE: 0 | 1 | 2 = 1;
        if (active_tri) {
          ARROW_TYPE = 0;
        }
        else if (st.moves.length > 0) {
          const last_move = st.moves[st.moves.length - 1];
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
          src = u.vswap(src);
          dst = u.vswap(dst);
          size = u.vswap(size);
        }
        data = { player, side, ix, action: 'kick', active: active_tri };
        blit(src, dst, size, data);
      };
    }

    if (!st.victory) {
      [0, 1].forEach((player: Player) => {
        [0, 1].forEach((side: Side) => {
          st.stones[player][side].forEach(draw_stones(player, side));
        });
      });


      if (st.moves.length > 0) {
        const last_move = u.last(st.moves);

        if (last_move.action == 'add') {
          let blot = {
            x: TRI_START + last_move.ix * STONE_SPACE,
            y: last_move.player == 0 ? TRI_SIZE_Y + 2 : BOTTOM_ROW_Y - 1
          };
          let blot_size = { x: STONE_SIZE + 2, y: STONE_SIZE + 2 };
          if (last_move.side) {
            blot = u.vswap(blot);
            blot_size = u.vswap(blot_size);
          }
          parts.push({ t: 'blot', rect: { p: blot, sz: blot_size } });
        }
      }
    }
    return parts;
  }

  renderBg(st: State): void {
    const { d } = this;
    const g = this.gameImg;
    const w = this.wsize.x;
    const h = this.wsize.y;
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
      STONE_START + st.ball.x * STONE_SPACE,
      STONE_START + st.ball.y * STONE_SPACE,
      STONE_SIZE, STONE_SIZE);

    // victory cleanup
    if (st.victory) {
      [0, 1].forEach(player => {
        [0, 1].forEach(side => {
          let blot = { x: TRI_START, y: player == 0 ? 0 : BOTTOM_ROW_Y };
          let blot_size = BLOT_SIZE;
          if (side) {
            blot = u.vswap(blot);
            blot_size = u.vswap(blot_size);
          }
          d.fillStyle = BGCOLOR;
          d.fillRect(blot.x, blot.y, blot_size.x, blot_size.y);
        });
      });

      if (st.cur_player == 0) {
        d.drawImage(g, AVATAR_OFF, 1, AVATAR_SIZE, AVATAR_SIZE, 1, 1, AVATAR_SIZE, AVATAR_SIZE);
      }
      else {
        d.drawImage(g, 1, AVATAR_OFF, AVATAR_SIZE, AVATAR_SIZE, AVATAR_OFF, AVATAR_OFF, AVATAR_SIZE, AVATAR_SIZE);
      }
    }
  }

  renderPart(p: Part): void {
    const { d } = this;
    switch (p.t) {
      case 'sprite':
        d.drawImage(this.gameImg, p.sprite.src.x, p.sprite.src.y, p.rect.sz.x, p.rect.sz.y,
          p.rect.p.x, p.rect.p.y, p.rect.sz.x, p.rect.sz.y);
        break;
      case 'blot':
        d.strokeStyle = 'rgba(255,255,128,0.7)';
        d.strokeRect(p.rect.p.x - 0.5, p.rect.p.y - 0.5, p.rect.sz.x + 1, p.rect.sz.y + 1);
        break;
    }
  }

  do_hit_test(gst: GameState, p: Point): Move | null {
    const hit = {
      x: (p.x - int((this.wsize.x - BOARD_SIZE * SCALE) / 2)) / SCALE,
      y: (p.y - int((this.wsize.y - BOARD_SIZE * SCALE) / 2)) / SCALE
    };
    for (let part of this.getParts(gst)) {
      if (u.inrect(hit, part.rect) && part.t == 'sprite') {
        return part.info;
      }
    }
    return null;
  }

  draw_screen(gst: GameState) {
    this.renderBg(gst.state);
    this.getParts(gst).forEach(part => {
      this.renderPart(part)
    });
  }


  drawScaled(gst: GameState): void {
    const { d } = this;

    d.save();
    d.imageSmoothingEnabled = false;
    this.draw_screen(gst);
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


}
