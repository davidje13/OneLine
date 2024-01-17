export class Game extends EventTarget {
	constructor(renderer) {
    super();
    this.renderer = renderer;
    this.width = 0;
    this.height = 0;
    this.cells = [];
    this.advancing = false;
    this.activeInteractions = new Set();
    this.moves = 0;
    this.moveLimit = 0;
    this.over = true;
	}

  scope(x, y) {
    const self = this;
    return {
      getCell(dx = 0, dy = 0) {
        const xx = x + dx;
        const yy = y + dy;
        if (xx < 0 || xx >= self.width || yy < 0 || yy >= self.height) {
          return null;
        }
        return self.cells[yy * self.width + xx];
      },
      getAbsoluteCell(x, y) {
        if (x < 0 || x >= self.width || y < 0 || y >= self.height) {
          return null;
        }
        return self.cells[y * self.width + x];
      },
      getAllCells() {
        const r = [];
        for (let y = 0; y < self.height; ++y) {
          for (let x = 0; x < self.width; ++x) {
            r.push({ x, y, cell: self.cells[y * self.width + x] });
          }
        }
        return r;
      },
      recordMove() {
        ++self.moves;
      },
      recordEvent(...qualifiers) {
        for (const goal of self.goals) {
          if (goal.filters.every((f) => qualifiers.includes(f))) {
            ++goal.progress;
          }
        }
      },
    };
  }

	async begin(level) {
    const { width, height } = level.size();
    this.moves = 0;
    this.over = false;
    this.moveLimit = level.moveLimit;
    this.width = width;
    this.height = height;
    this.goals = level.goals.map((props) => ({ ...props, progress: 0 }));
    this.cells.length = 0;
    for (let y = 0; y < height; ++y) {
      for (let x = 0; x < width; ++x) {
        this.cells[y * width + x] = level.getCell(x, y)?.() ?? {};
      }
    }
    for (let y = 0; y < height; ++y) {
      for (let x = 0; x < width; ++x) {
        this.cells[y * width + x].initialise?.(this.scope(x, y));
      }
    }
    await this.renderer.clear();
    await this.advance();
	}

  interact(start) {
    if (this.over) {
      return VOID_INTERACTION;
    }
    if (this.advancing) {
      return VOID_INTERACTION;
    }
    const sx = Math.floor(start.x);
    const sy = Math.floor(start.y);
    let active = true;
    const scope = this.scope(sx, sy);
    const activeLayers = [];
    const handler = scope.getCell()?.mouseDown?.({
      ...scope,
      getLayer: () => {
        const layer = this.renderer.getLayer();
        activeLayers.push(layer);
        return layer;
      },
    }, {
      x: start.x,
      y: start.y,
      ix: sx,
      iy: sy,
    });
    if (!handler) {
      return VOID_INTERACTION;
    }
    const cleanup = () => {
      if (active) {
        active = false;
        this.activeInteractions.delete(proxy);
        for (const layer of activeLayers) {
          layer.discard();
        }
      }
    };
    const proxy = {
      accepted: true,
      move: (position) => {
        if (!active) {
          return;
        }
        const px = Math.floor(position.x);
        const py = Math.floor(position.y);
        const done = handler.move?.({
          x: position.x,
          y: position.y,
          ix: px,
          iy: py,
          fx: position.x - px,
          fy: position.y - py,
          dx: position.x - start.x,
          dy: position.y - start.y,
          idx: px - sx,
          idy: py - sy,
        });
        if (done) {
          active = false;
          cleanup();
        }
        return proxy;
      },
      end: () => {
        if (active) {
          cleanup();
          handler.end?.();
          this.advance();
        }
      },
      cancel: () => {
        if (active) {
          cleanup();
          handler.cancel?.();
        }
      },
    };
    this.activeInteractions.add(proxy);
    return proxy;
  }

  _render() {
    return this.renderer.update(this.width, this.height, this.cells, this.moves, this.moveLimit, this.goals);
  }

  async advance() {
    this.advancing = true;
    for (const interaction of this.activeInteractions) {
      interaction.cancel();
    }

    const { width, height } = this;
    let diff = true;
    let actionsSoFar = [];
    while (diff) {
      const actions = [];
      for (let y = 0; y < height; ++y) {
        for (let x = 0; x < width; ++x) {
          const action = this.cells[y * width + x].step?.(this.scope(x, y));
          if (action) {
            actions.push(action);
          }
        }
      }
      diff = false;
      for (const action of actions) {
        if (!actions.some((action2) => (action2 !== action) && blocks(action2, action))) {
          if (!actionsSoFar.some((action2) => blocks(action2, action))) {
            actionsSoFar.push(action);
            action.apply();
            diff = true;
          }
        }
      }
      if (!diff && actionsSoFar.length > 0) {
        for (let y = 0; y < height; ++y) {
          for (let x = 0; x < width; ++x) {
            this.cells[y * width + x].afterStep?.(this.scope(x, y));
          }
        }
        await this._render();
        actionsSoFar.length = 0;
        diff = true;
      }
    }
    // final update for trailing animations
    await this._render();
    if (this.goals.every((goal) => goal.progress >= goal.count)) {
      this.over = true;
      this.dispatchEvent(new CustomEvent('over', { detail: { win: true } }));
    } else if (this.moves >= this.moveLimit) {
      this.over = true;
      this.dispatchEvent(new CustomEvent('over', { detail: { win: false } }));
    }
    this.advancing = false;
  }
}

const blocks = (a1, a2) => a1.blocks?.(a2) || a2.blockedBy?.(a1);

const VOID_INTERACTION = {
  accepted: false,
  move: () => VOID_INTERACTION,
  end: () => null,
  cancel: () => null,
};
