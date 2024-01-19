/**
 * The returned function returns true when given a point which is inside the loop,
 * and false for points which are outside. Returned value is undefined for points
 * which are on the loop.
 *
 * @param {{ x: number, y: number }[]} path a path defining a loop.
 * Must begin and end with the same point,
 * must only contain unit-length N/S/E/W steps.
 */
export function getCellsWithinLoop(path) {
  const bounds = {
    x0: Number.POSITIVE_INFINITY,
    y0: Number.POSITIVE_INFINITY,
    x1: Number.NEGATIVE_INFINITY,
    y1: Number.NEGATIVE_INFINITY,
  };
  let dir = 0;
  for (let i = 1; i < path.length; ++i) {
    const { x, y } = path[i];
    bounds.x0 = Math.min(bounds.x0, x);
    bounds.x1 = Math.max(bounds.x1, x);
    bounds.y1 = Math.max(bounds.y1, y);
    if (y < bounds.y0) {
      bounds.y0 = y;
      dir = 0;
    }
    if (y === bounds.y0) {
      dir ||= (x - path[i - 1].x);
    }
  }
  const bw = bounds.x1 - bounds.x0;
  const bh = bounds.y1 - bounds.y0;
  const fill = new Uint8Array(bw * bh);
  for (let i = 1; i < path.length; ++i) {
    const cur = path[i];
    const x = Math.min(cur.x, path[i - 1].x);
    const d = cur.x - path[i - 1].x;
    if (d && cur.y < bounds.y1 && x < bounds.x1) {
      fill[(cur.y - bounds.y0) * bw + x - bounds.x0] = (d === dir) ? 2 : 1;
    }
  }
  for (let y = 1; y < bh; ++y) {
    for (let x = 0; x < bw; ++x) {
      const p = y * bw + x;
      fill[p] ||= (fill[p - bw] === 2) ? 2 : 0;
    }
  }
  return (x, y) => (
    x > bounds.x0 && x < bounds.x1 &&
    y > bounds.y0 && y < bounds.y1 &&
    (fill[(y - bounds.y0 - 1) * bw + (x - bounds.x0 - 1)] === 2)
  );
}
