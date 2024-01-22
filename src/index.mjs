import { Game } from './Game.mjs';
import { Renderer } from './Renderer.mjs';
import { levels } from './levels/index.mjs';

const renderer = new Renderer();
document.body.append(renderer.dom());

function updateGameSize() {
  renderer.setAvailableSpace(window.innerWidth - 5, window.innerHeight - 80);
}
window.addEventListener('resize', updateGameSize);
updateGameSize();

const game = new Game(renderer);
renderer.addEventListener('interact', ({ detail: { position, count, followup } }) => {
  if (count === 1) {
    const interaction = game.interact(position);
    followup.addEventListener('move', ({ detail: { position } }) => interaction.move(position));
    followup.addEventListener('end', () => interaction.end());
    followup.addEventListener('cancel', () => interaction.cancel());
  }
});

let curLevel = 0;

game.addEventListener('over', (e) => {
  if (e.detail.win) {
    alert('Level clear');
    ++curLevel;
  } else {
    alert('Game over');
  }
  if (curLevel < levels.length) {
    game.begin(levels[curLevel]);
  } else {
    alert('No more levels!');
  }
});

game.begin(levels[curLevel]);
