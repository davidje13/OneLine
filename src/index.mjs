import { Game } from './Game.mjs';
import { Level } from './Level.mjs';
import { Renderer } from './Renderer.mjs';
import { Space } from './cells/Space.mjs';
import { Ice } from './cells/containers/Ice.mjs';
import { Dot } from './contents/Dot.mjs';

const renderer = new Renderer();
document.body.append(renderer.dom());

const COLOURS = ['red', 'green', 'blue'];

const game = new Game(renderer);
renderer.addEventListener('interact', ({ detail: { position, count, followup } }) => {
  if (count === 1) {
    const interaction = game.interact(position);
    followup.addEventListener('move', ({ detail: { position } }) => interaction.move(position));
    followup.addEventListener('end', () => interaction.end());
  }
});

const spawn = {
  waitForIdle: true,
  cascade: true,
  source: { x: 0, y: -1 },
  next: () => Dot(COLOURS[Math.floor(Math.random() * COLOURS.length)]),
};
const ice = Ice({ strength: 2 });

const level = new Level(8, 7, { moveLimit: 25 })
  .region({ y0: 0, y1: 1 }, Space({ spawn }))
  .region({ x0: 2, x1: 6 }, null)
  .cell(3, 0, Space({ container: ice, spawn }))
  .cell(4, 0, Space({ container: ice, pulls: [{ pull: { x: -1, y: 0 } }] }))
  .cell(4, 1, Space({ container: ice }))
  .cell(4, 2, Space({ container: ice }))
  .cell(3, 2, Space({ container: ice, pulls: [{ pull: { x: 1, y: 0 } }] }))
  .cell(3, 3, Space({ container: ice }))
  .cell(3, 4, Space({ container: ice }))
  .cell(4, 4, Space({ container: ice, pulls: [{ pull: { x: -1, y: 0 } }] }))
  .cell(4, 5, Space({ container: ice }))
  .cell(4, 6, Space({ container: ice }))
  .cell(3, 6, Space({ container: ice, pulls: [{ pull: { x: 1, y: 0 } }] }))
  .cell(3, 7, Space({ container: ice }))
  .goal('break-ice', ['break-ice'], 11);

game.addEventListener('over', (e) => {
  if (e.detail.win) {
    alert('Level clear');
  } else {
    alert('Game over');
    game.begin(level);
  }
});

game.begin(level);
