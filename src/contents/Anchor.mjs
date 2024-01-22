// TODO: deduplicate movement handling with Dot

export const Anchor = () => {
	let initialOffset;
	return {
		type: 'anchor',
		initialise(source = { x: 0, y: 0 }) {
			initialOffset = source;
		},
		step(scope) {
			const below = scope.getCell(0, 1);
			if (!below || below.type === 'void') {
				return {
					type: 'drop-anchor',
					blocks: (a) => (a.type !== 'drop-anchor' && a.type !== 'drop'),
					blockedBy: (a) => a.type === 'drop',
					apply() {
						scope.recordEvent('drop-anchor');
						scope.getCell().replaceContent?.('move');
					},
				};
			}
		},
		move() {
			initialOffset = { x: 0, y: 0 };
		},
		makeDOM(parent) {
			const el = parent.ownerDocument.createElement('div');
			let lastx = -1;
			let lasty = -1;
			const setPosition = ({ x, y }) => {
				moving = (lastx === -1) ? null : { x: x - lastx, y: y - lasty };
				el.style.setProperty('--x', x);
				el.style.setProperty('--y', y);
				lastx = x;
				lasty = y;
			};
			let moving = null;
			return {
				async initialise({ x, y }) {
					el.className = 'cell anchor appear';
					parent.append(el);
					if (initialOffset.x !== 0 || initialOffset.y !== 0) {
						setPosition({ x: x + initialOffset.x, y: y + initialOffset.y });
						await Promise.resolve(); // try to batch all reflows together
						el.offsetWidth; // force reflow so position starts a CSS transition
					}
					setPosition({ x, y });
					await new Promise((resolve) => {
						el.addEventListener('animationend', resolve, { once: true });
					});
				},
				async update({ x, y }) {
					if (lastx !== x || lasty !== y) {
						el.className = moving ? 'cell anchor' : 'cell anchor accel';
						setPosition({ x, y });
						await new Promise((resolve) => {
							el.addEventListener('transitionend', resolve, { once: true });
						});
					} else if (moving) {
						el.className = 'cell anchor bounce';
						el.style.setProperty('--bouncex', `${moving.x * 0.5}px`);
						el.style.setProperty('--bouncey', `${moving.y}px`);
						moving = null;
					}
				},
				async remove(animate) {
					if (animate) {
						el.className = 'cell anchor disappear';
						await new Promise((resolve) => {
							el.addEventListener('animationend', resolve, { once: true });
						});
					}
					el.remove();
				},
			};
		},
	};
}
