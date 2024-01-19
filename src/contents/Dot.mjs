import { getCellsWithinLoop } from '../common/loop.mjs';
import { Bomb } from './Bomb.mjs';

export const Dot = (colour) => {
  let initialOffset;
  return {
    type: 'dot',
    colour,
    nextAction: 0,
    sequence: 0,
    initialise(source = { x: 0, y: 0 }) {
      initialOffset = source;
      this.nextAction = 0;
      this.sequence = 0;
    },
    step(scope) {
      if (this.nextAction === 'cull') {
        return {
          type: 'cull',
          blocks: (a) => (a.type !== 'cull'),
          apply() {
            scope.recordEvent('cull-dot', 'direct', colour);
            scope.getCell().replaceContent?.('cull');
          },
        };
      } else if (this.nextAction === 'cull-cascade') {
        return {
          type: 'cull-cascade',
          blocks: (a) => (a.type !== 'cull' && a.type !== 'cull-cascade' && a.type !== 'make-bomb' && !a.incidental),
          apply() {
            scope.recordEvent('cull-dot', 'cascade', colour);
            scope.getCell().replaceContent?.('cull-cascade');
          },
        };
      } else if (this.nextAction === 'make-bomb') {
        return {
          type: 'make-bomb',
          blocks: (a) => (a.type !== 'cull' && a.type !== 'cull-cascade' && a.type !== 'make-bomb' && !a.incidental),
          apply() {
            scope.recordEvent('cull-dot', 'make-bomb', colour);
            scope.getCell().replaceContent?.('make-bomb', Bomb);
          },
        };
      }
    },
    move() {
      initialOffset = { x: 0, y: 0 };
    },
    makeDOM(parent) {
      const self = this;
      const el = parent.ownerDocument.createElement('div');
      el.dataset['col'] = colour;
      let lastx = -1;
      let lasty = -1;
      const setPosition = ({ x, y }) => {
        moving = (lastx === -1) ? null : { x: x - lastx, y: y - lasty };
        el.style.setProperty('--x', x);
        el.style.setProperty('--y', y);
        lastx = x;
        lasty = y;
      };
      let moving = null;
      return {
        async initialise({ x, y }) {
          el.className = 'cell dot appear';
          parent.append(el);
          if (initialOffset.x !== 0 || initialOffset.y !== 0) {
            setPosition({ x: x + initialOffset.x, y: y + initialOffset.y });
            await Promise.resolve(); // try to batch all reflows together
            el.offsetWidth; // force reflow so position starts a CSS transition
          }
          setPosition({ x, y });
          await new Promise((resolve) => {
            el.addEventListener('animationend', resolve, { once: true });
          });
        },
        async update({ x, y }) {
          if (lastx !== x || lasty !== y) {
            el.className = moving ? 'cell dot' : 'cell dot accel';
            setPosition({ x, y });
            await new Promise((resolve) => {
              el.addEventListener('transitionend', resolve, { once: true });
            });
          } else if (moving) {
            el.className = 'cell dot bounce';
            el.style.setProperty('--bouncex', `${moving.x * 0.5}px`);
            el.style.setProperty('--bouncey', `${moving.y}px`);
            moving = null;
          }
        },
        async remove(animate) {
          if (animate) {
            el.style.setProperty('--sequence', self.sequence);
            el.className = 'cell dot disappear';
            await new Promise((resolve) => {
              el.addEventListener('animationend', resolve, { once: true });
            });
          }
          el.remove();
        },
      };
    },
    mouseDown(scope, start) {
      const domColour = (() => {
        const el = document.createElement('div');
        el.className = 'dot';
        el.dataset['col'] = colour;
        document.body.append(el);
        const col = getComputedStyle(el).getPropertyValue('--col');
        el.remove();
        return col;
      })();
      const path = [{ x: start.ix, y: start.iy, content: this }];
      const layer = scope.getLayer();
      layer.ctx.lineCap = 'round';
      layer.ctx.lineJoin = 'round';
      layer.ctx.lineWidth = layer.cellSize * 0.15;
      const isLoop = () => path.length > 1 && path[path.length - 1] === path[0];
      const render = (position) => {
        const s = layer.cellSize;
        layer.ctx.clearRect(0, 0, layer.canvas.width, layer.canvas.height);
        layer.ctx.strokeStyle = domColour;
        layer.ctx.globalAlpha = 1;
        layer.ctx.beginPath();
        layer.ctx.moveTo((path[0].x + 0.5) * s, (path[0].y + 0.5) * s);
        for (let i = 1; i < path.length; ++i) {
          layer.ctx.lineTo((path[i].x + 0.5) * s, (path[i].y + 0.5) * s);
        }
        layer.ctx.stroke();
        const last = path[path.length - 1];
        if (!isLoop()) {
          layer.ctx.globalAlpha = 0.5;
          layer.ctx.beginPath();
          layer.ctx.moveTo((last.x + 0.5) * s, (last.y + 0.5) * s);
          layer.ctx.lineTo(position.x * s, position.y * s);
          layer.ctx.stroke();
        }
      };
      return {
        move(position) {
          const last = path[path.length - 1];
          const dx = position.x - last.x - 0.5;
          const dy = position.y - last.y - 0.5;
          if (dx * dx + dy * dy < DRAG_THRESHOLD * DRAG_THRESHOLD) {
            render(position);
            return;
          }
          let move = null;
          if (Math.abs(dx) > Math.abs(dy)) {
            if (dx > 0) {
              move = { x: 1, y: 0 };
            } else {
              move = { x: -1, y: 0 };
            }
          } else if (dy > 0) {
            move = { x: 0, y: 1 };
          } else {
            move = { x: 0, y: -1 };
          }
          const nx = last.x + move.x;
          const ny = last.y + move.y;
          const loop = path.findIndex((p) => p.x === nx && p.y === ny);
          if (path.length > 1 && loop === path.length - 2) {
            path.pop();
          } else if (loop === 0) {
            path.push(path[0]);
          } else if (loop === -1 && (last !== path[0] || path.length === 1)) {
            const next = scope.getAbsoluteCell(nx, ny)?.interactiveContent?.();
            if (next && next.type === 'dot' && next.colour === colour) {
              path.push({ x: nx, y: ny, content: next });
            }
          }
          render(position);
        },
        end() {
          if (path.length < 2) {
            return;
          }
          scope.recordMove();
          if (isLoop()) {
            scope.recordEvent('loop');
            const checkFill = getCellsWithinLoop(path);
            for (const { x, y, cell } of scope.getAllCells()) {
              const item = cell.content?.();
              if (item && item.type === 'dot') {
                if (checkFill(x, y)) {
                  item.nextAction = 'make-bomb';
                } else if (item.colour === colour) {
                  item.nextAction = 'cull-cascade';
                  item.sequence = Math.abs(x - start.ix) + Math.abs(y - start.iy);
                }
              }
            }
            path.pop();
            for (const { content } of path) {
              content.nextAction = 'cull';
              content.sequence = 0;
            }
          } else {
            let i = 0;
            for (const { content } of path.reverse()) {
              content.nextAction = 'cull';
              content.sequence = i;
              ++i;
            }
          }
        },
        cancel() {
        },
      };
    },
  };
}

const DRAG_THRESHOLD = 0.8;
