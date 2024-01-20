import { Level } from '../Level.mjs';
import { Space } from '../cells/Space.mjs';
import { Void } from '../cells/Void.mjs';
import { Dot } from '../contents/Dot.mjs';
import { Anchor } from '../contents/Anchor.mjs';

const COLOURS = ['red', 'green', 'blue', 'yellow', 'cyan'];

const spawn = {
  waitForIdle: true,
  cascade: true,
  source: { x: 0, y: -1 },
  next: () => Dot(COLOURS[Math.floor(Math.random() * COLOURS.length)]),
};

const seed = (cell) => ({ next: () => cell, source: { x: 0, y: -1 } });

export default new Level(7, 7, { moveLimit: 30 })
  .region({ y0: 0, y1: 1 }, Space({ spawn }))
  .region({ x0: 2, x1: 3 }, Void())
  .cell(0, 0, Space({ spawn, seed: seed(Dot('cyan')) }))
  .cell(1, 0, Space({ spawn, seed: seed(Anchor()) }))
  .cell(0, 1, Space({ seed: seed(Anchor()) }))
  .cell(1, 1, Space({ seed: seed(Dot('yellow')) }))
  .cell(0, 2, Space({ seed: seed(Dot('yellow')) }))
  .cell(1, 2, Space({ seed: seed(Anchor()) }))
  .cell(0, 3, Space({ seed: seed(Anchor()) }))
  .cell(1, 3, Space({ seed: seed(Dot('blue')) }))
  .cell(0, 4, Space({ seed: seed(Dot('blue')) }))
  .cell(1, 4, Space({ seed: seed(Anchor()) }))
  .cell(0, 5, Space({ seed: seed(Anchor()) }))
  .cell(1, 5, Space({ seed: seed(Dot('green')) }))
  .cell(0, 6, Space({ seed: seed(Dot('green')) }))
  .cell(1, 6, Space({ seed: seed(Dot('red')) }))
  .goal('drop-anchor', ['drop-anchor'], 6)
  .goal('clear red', ['cull-dot', 'red'], 20)
  .goal('clear green', ['cull-dot', 'green'], 20)
  .goal('clear blue', ['cull-dot', 'blue'], 20)
  .goal('clear yellow', ['cull-dot', 'yellow'], 20);
