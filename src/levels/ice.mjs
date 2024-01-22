import { Level } from '../Level.mjs';
import { Space } from '../cells/Space.mjs';
import { Void } from '../cells/Void.mjs';
import { Ice } from '../cells/containers/Ice.mjs';
import { Dot } from '../contents/Dot.mjs';
import { basicColours } from '../common/colours.mjs';

const COLOURS = basicColours(3);

const base = Space({
	waitForIdle: true,
	cascade: true,
	next: () => Dot(COLOURS[Math.floor(Math.random() * COLOURS.length)]),
});
const ice = Ice({ strength: 3 });

export default new Level(8, 7, { moveLimit: 25 })
	.region({ x0: 0, x1: 2 }, base())
	.region({ x0: 3, x1: 5 }, base({ container: ice }))
	.cell(3, 1, Void())
	.cell(4, 3, Void())
	.cell(3, 5, Void())
	.region({ x0: 6, x1: 8 }, base())
	//.cell(4, 0, base({ container: ice, pulls: [{ pull: { x: -1, y: 0 } }] }))
	//.cell(3, 2, base({ container: ice, pulls: [{ pull: { x: 1, y: 0 } }] }))
	//.cell(4, 4, base({ container: ice, pulls: [{ pull: { x: -1, y: 0 } }] }))
	//.cell(3, 6, base({ container: ice, pulls: [{ pull: { x: 1, y: 0 } }] }))
	.goal('break-ice', ['break-ice'], 11);
