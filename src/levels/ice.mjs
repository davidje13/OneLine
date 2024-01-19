import { Level } from '../Level.mjs';
import { Space } from '../cells/Space.mjs';
import { Void } from '../cells/Void.mjs';
import { Ice } from '../cells/containers/Ice.mjs';
import { Dot } from '../contents/Dot.mjs';

const COLOURS = ['red', 'green', 'blue'];

const spawn = {
  waitForIdle: true,
  cascade: true,
  source: { x: 0, y: -1 },
  next: () => Dot(COLOURS[Math.floor(Math.random() * COLOURS.length)]),
};
const ice = Ice({ strength: 3 });

export default new Level(8, 7, { moveLimit: 25 })
  .region({ y0: 0, y1: 1 }, Space({ spawn }))
  .region({ x0: 2, x1: 6 }, Void())
  .cell(3, 0, Space({ container: ice, spawn }))
  .cell(4, 0, Space({ container: ice, spawn }))
  //.cell(4, 0, Space({ container: ice, pulls: [{ pull: { x: -1, y: 0 } }] }))
  .cell(4, 1, Space({ container: ice }))
  .cell(4, 2, Space({ container: ice }))
  .cell(3, 2, Space({ container: ice, spawn }))
  //.cell(3, 2, Space({ container: ice, pulls: [{ pull: { x: 1, y: 0 } }] }))
  .cell(3, 3, Space({ container: ice }))
  .cell(3, 4, Space({ container: ice }))
  .cell(4, 4, Space({ container: ice, spawn }))
  //.cell(4, 4, Space({ container: ice, pulls: [{ pull: { x: -1, y: 0 } }] }))
  .cell(4, 5, Space({ container: ice }))
  .cell(4, 6, Space({ container: ice }))
  .cell(3, 6, Space({ container: ice, spawn }))
  //.cell(3, 6, Space({ container: ice, pulls: [{ pull: { x: 1, y: 0 } }] }))
  .cell(3, 7, Space({ container: ice }))
  .goal('break-ice', ['break-ice'], 11);
