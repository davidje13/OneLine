import { Level } from '../Level.mjs';
import { Space } from '../cells/Space.mjs';
import { Dot } from '../contents/Dot.mjs';
import { COL1, COL2, COL3, COL4, basicColours } from '../common/colours.mjs';

const COLOURS = basicColours(4);

const base = Space({
  waitForIdle: true,
  cascade: true,
  next: () => Dot(COLOURS[Math.floor(Math.random() * COLOURS.length)]),
});

export default new Level(8, 8, { moveLimit: 30 })
  .region({}, base())
  .goal(`clear ${COL1}`, ['cull-dot', COL1], 20)
  .goal(`clear ${COL2}`, ['cull-dot', COL2], 20)
  .goal(`clear ${COL3}`, ['cull-dot', COL3], 20)
  .goal(`clear ${COL4}`, ['cull-dot', COL4], 20);
