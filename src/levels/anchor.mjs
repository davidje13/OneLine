import { Level } from '../Level.mjs';
import { Space } from '../cells/Space.mjs';
import { Dot } from '../contents/Dot.mjs';
import { Anchor } from '../contents/Anchor.mjs';
import { COL1, COL2, COL3, COL4, COL5, basicColours } from '../common/colours.mjs';

const COLOURS = basicColours(5);

const base = Space({
	waitForIdle: true,
	cascade: true,
	next: () => Dot(COLOURS[Math.floor(Math.random() * COLOURS.length)]),
});

export default new Level(7, 7, { moveLimit: 30 })
	.cell(0, 0, base({ seed: () => Dot(COL5) }))
	.cell(1, 0, base({ seed: () => Anchor() }))
	.cell(0, 1, base({ seed: () => Anchor() }))
	.cell(1, 1, base({ seed: () => Dot(COL4) }))
	.cell(0, 2, base({ seed: () => Dot(COL4) }))
	.cell(1, 2, base({ seed: () => Anchor() }))
	.cell(0, 3, base({ seed: () => Anchor() }))
	.cell(1, 3, base({ seed: () => Dot(COL3) }))
	.cell(0, 4, base({ seed: () => Dot(COL3) }))
	.cell(1, 4, base({ seed: () => Anchor() }))
	.cell(0, 5, base({ seed: () => Anchor() }))
	.cell(1, 5, base({ seed: () => Dot(COL2) }))
	.cell(0, 6, base({ seed: () => Dot(COL2) }))
	.cell(1, 6, base({ seed: () => Dot(COL1) }))
	.region({ x0: 3, x1: 7 }, base())
	.goal('drop-anchor', ['drop-anchor'], 6)
	.goal(`clear ${COL1}`, ['cull-dot', COL1], 20)
	.goal(`clear ${COL2}`, ['cull-dot', COL2], 20)
	.goal(`clear ${COL3}`, ['cull-dot', COL3], 20)
	.goal(`clear ${COL4}`, ['cull-dot', COL4], 20);
