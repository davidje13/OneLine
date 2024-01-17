export class Renderer extends EventTarget {
	constructor() {
		super();
		this.hold = document.createElement('div');
		this.grid = document.createElement('div');
		this.grid.className = 'grid';
		const banner = document.createElement('div');
		banner.className = 'banner';
		this.moveCount = document.createElement('div');
		this.moveCount.className = 'move-count';
		this.goalsList = document.createElement('div');
		this.goalsList.className = 'goals-list';
		const bannerL = document.createElement('div');
		bannerL.className = 'banner-left';
		bannerL.append(this.moveCount);
		const bannerR = document.createElement('div');
		bannerR.className = 'banner-right';
		banner.append(bannerL, this.goalsList, bannerR);
		this.hold.append(banner, this.grid);
		this.cells = new Map();
		this.contents = new Map();
		this.goals = new Map();
		this.drag = new Map();
		this.width = 0;
		this.height = 0;
		this.layerCache = [];

    this._md = this._md.bind(this);
    this._mm = this._mm.bind(this);
    this._mu = this._mu.bind(this);

    this.grid.addEventListener('pointerdown', this._md, { passive: false });
	}

	getLayer() {
		const bounds = this.grid.getBoundingClientRect();

		const cache = this.layerCache;
		let canvas = cache.pop();
		if (!canvas) {
			canvas = document.createElement('canvas');
			canvas.className = 'live-canvas';
		}

		const cellSize = bounds.width * window.devicePixelRatio / this.width;
		canvas.width = this.width * cellSize;
		canvas.height = this.height * cellSize;
		const ctx = canvas.getContext('2d');
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		this.grid.append(canvas);
		let active = true;
		return {
			canvas,
			ctx,
			cellSize,
			discard() {
				if (active) {
					active = false;
					canvas.remove();
					if (cache.length < 2) {
						cache.push(canvas);
					}
				}
			},
		};
	}

  destroy() {
    this.grid.removeEventListener('pointerdown', this._md);
    window.removeEventListener('pointermove', this._mm);
    window.removeEventListener('pointerup', this._mu);
  }

	_getMousePos(e) {
		const bounds = this.grid.getBoundingClientRect();
		return {
			x: (e.clientX - bounds.left) * this.width / bounds.width,
			y: (e.clientY - bounds.top) * this.height / bounds.height,
		};
	}

  _md(e) {
		if (e.button !== 0) {
			return;
		}
    e.preventDefault();
		if (this.drag.size === 0) {
	    window.addEventListener('pointermove', this._mm, { passive: true });
  	  window.addEventListener('pointerup', this._mu, { passive: true, once: true });
		}
		const followup = new EventTarget();
		this.drag.set(e.pointerId, { followup });
    this.grid.setPointerCapture(e.pointerId);
		this.dispatchEvent(new CustomEvent('interact', {
			detail: { position: this._getMousePos(e), count: this.drag.size, followup },
		}));
  }

  _mm(e) {
		const state = this.drag.get(e.pointerId);
		if (!state) {
			return;
		}
		state.followup.dispatchEvent(new CustomEvent('move', {
			detail: { position: this._getMousePos(e) },
		}));
  }

  _mu(e) {
		const state = this.drag.get(e.pointerId);
		if (!state) {
			return;
		}
		this._mm(e);
		state.followup.dispatchEvent(new CustomEvent('end'));
		this.grid.releasePointerCapture(e.pointerId);
		this.drag.delete(e.pointerId);
		if (!this.drag.size) {
			window.removeEventListener('pointermove', this._mm);
			window.removeEventListener('pointerup', this._mu);
		}
  }

	clear() {
		for (const dom of this.cells.values()) {
			dom.remove?.(false);
		}
		for (const dom of this.contents.values()) {
			dom.remove?.(false);
		}
		for (const { element } of this.goals.values()) {
			element.remove();
		}
		this.cells.clear();
		this.contents.clear();
		this.goals.clear();
	}

	async update(width, height, cells, moves, moveLimit, goals) {
		this.moveCount.textContent = String(moveLimit - moves);
		const unseenGoals = new Set(this.goals.keys());
		for (const goal of goals) {
			let g = this.goals.get(goal);
			if (g) {
				unseenGoals.delete(goal);
			} else {
				const element = document.createElement('div');
				element.className = `goal ${goal.id}`;
				const progress = document.createElement('div');
				progress.className = 'progress';
				const label = document.createElement('div');
				label.className = 'label';
				//label.textContent = goal.id;
				element.append(label, progress);
				this.goalsList.append(element);
				g = { element, progress };
				this.goals.set(goal, g);
			}
			g.progress.textContent = `${goal.progress} / ${goal.count}`;
		}

		this.width = width;
		this.height = height;
		this.grid.style.setProperty('--w', width);
		this.grid.style.setProperty('--h', height);
		const tasks = [];
		const unseenCells = new Set(this.cells.keys());
		const unseenContents = new Set(this.contents.keys());
		for (let y = 0; y < height; ++y) {
			for (let x = 0; x < width; ++x) {
				const cell = cells[y * width + x];
				const content = cell.content?.();
				const scope = { cell, content, x, y };
				unseenCells.delete(cell);
				const domCell = this.cells.get(cell);
				if (domCell) {
					tasks.push(domCell.update?.(scope));
				} else {
					const dom = cell.makeDOM?.(this.grid) ?? {};
					this.cells.set(cell, dom);
					tasks.push(dom.initialise?.(scope));
				}
				if (content) {
					unseenContents.delete(content);
					const domContents = this.contents.get(content);
					if (domContents) {
						tasks.push(domContents.update?.(scope));
					} else {
						const dom = content.makeDOM?.(this.grid) ?? {};
						this.contents.set(content, dom);
						tasks.push(dom.initialise?.(scope));
					}
				}
			}
		}
		for (const cell of unseenCells) {
			tasks.push(this.cells.get(cell).remove?.(true));
			this.cells.delete(cell);
		}
		for (const content of unseenContents) {
			tasks.push(this.contents.get(content).remove?.(true));
			this.contents.delete(content);
		}
		await Promise.all(tasks);
	}

	dom() {
		return this.hold;
	}
}
