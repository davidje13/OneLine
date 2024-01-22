import { Void } from './cells/Void.mjs';

const EMPTY = Void();

export class Level {
  constructor(width, height, { moveLimit = Number.POSITIVE_INFINITY }) {
    this.width = width;
    this.height = height;
    this.moveLimit = moveLimit;
    this.goals = [];
    this.cells = [];
    for (let i = 0; i < width * height; ++i) {
      this.cells.push(EMPTY);
    }
  }

  size() {
    return { width: this.width, height: this.height };
  }

  getCell(x, y) {
    return this.cells[y * this.width + x];
  }

  region({ x0 = 0, y0 = 0, x1 = this.width, y1 = this.height }, type) {
    for (let y = y0; y < y1; ++y) {
      for (let x = x0; x < x1; ++x) {
        this.cells[y * this.width + x] = type;
      }
    }
    return this;
  }

  cell(x, y, type) {
    return this.region({ x0: x, y0: y, x1: x + 1, y1: y + 1 }, type);
  }

  goal(id, filters, count) {
    this.goals.push({ id, filters, count });
    return this;
  }
}
