import { Level } from '../Level.mjs';
import { Space } from '../cells/Space.mjs';
import { Dot } from '../contents/Dot.mjs';

const COLOURS = ['red', 'green', 'blue', 'yellow'];

const spawn = {
  waitForIdle: true,
  cascade: true,
  source: { x: 0, y: -1 },
  next: () => Dot(COLOURS[Math.floor(Math.random() * COLOURS.length)]),
};

export default new Level(8, 8, { moveLimit: 30 })
  .region({ y0: 0, y1: 1 }, Space({ spawn }))
  .goal('clear red', ['cull-dot', 'red'], 20)
  .goal('clear green', ['cull-dot', 'green'], 20)
  .goal('clear blue', ['cull-dot', 'blue'], 20)
  .goal('clear yellow', ['cull-dot', 'yellow'], 20);
