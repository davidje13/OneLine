export class ConnectedTile {
  constructor() {
    this.matches = new Uint8Array(9);
  }

  update(lookup) {
    for (let y = -1; y <= 1; ++y) {
      for (let x = -1; x <= 1; ++x) {
        this.matches[y * 3 + x + 4] = lookup(x, y) ? 1 : 0;
      }
    }
  }

  makeDOM() {
    const el = document.createElement('div');
    el.className = 'connected-tile';
    for (let y = 0; y < 2; ++y) {
      for (let x = 0; x < 2; ++x) {
        const p = y * 3 + x;
        const tl = this.matches[p];
        const tr = this.matches[p + 1];
        const bl = this.matches[p + 3];
        const br = this.matches[p + 4];
        const t = TILE_LOOKUP[(tl << 3) | (tr << 2) | (bl << 1) | br];
        const quad = document.createElement('div');
        if (t.x2 !== undefined && !y) { // special handling for saddles
          quad.style.setProperty('--tx', t.x2 - x);
          quad.style.setProperty('--ty', t.y2 - y);
        } else {
          quad.style.setProperty('--tx', t.x - x);
          quad.style.setProperty('--ty', t.y - y);
        }
        el.append(quad);
      }
    }
    return el;
  }
}

const TILE_LOOKUP = [
  /* 0000 */ { x: -2, y: -2 },

  /* 0001 */ { x: 0, y: 0 },
  /* 0010 */ { x: 4, y: 0 },
  /* 0011 */ { x: 2, y: 0 },
  /* 0100 */ { x: 0, y: 4 },
  /* 0101 */ { x: 0, y: 2 },
  /* 0110 */ { x: 0, y: 4, x2: 4, y2: 0 },
  /* 0111 */ { x: 7, y: 3 },
  /* 1000 */ { x: 4, y: 4 },
  /* 1001 */ { x: 4, y: 4, x2: 0, y2: 0 },
  /* 1010 */ { x: 4, y: 2 },
  /* 1011 */ { x: 5, y: 3 },
  /* 1100 */ { x: 2, y: 4 },
  /* 1101 */ { x: 7, y: 1 },
  /* 1110 */ { x: 5, y: 1 },
  /* 1111 */ { x: 2, y: 2 },
];
