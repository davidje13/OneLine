// TODO: deduplicate movement handling with Dot

export const Bomb = () => {
	let count = 0;
	return {
		type: 'bomb',
		initialise() {
			count = 0;
		},
		step(scope) {
			if (count < 1) {
				return {
					type: 'bomb-countdown',
					blockedBy: (a) => (a.type !== 'bomb-countdown'),
					apply() {
						++count;
					},
				};
			}
			return {
				type: 'bomb-explode',
				blockedBy: (a, alreadyApplied) => a.type === 'bomb-countdown' && alreadyApplied,
				blocks: (a) => (a.type !== 'bomb-explode'),
				apply() {
					scope.recordEvent('bomb-explode');
					scope.getCell().replaceContent?.('cull-explode');
					for (let y = -1; y <= 1; ++y) {
						for (let x = -1; x <= 1; ++x) {
							const c = scope.getCell(x, y);
							const content = c?.content?.();
							if (content && content.type !== 'bomb') {
								c.replaceContent?.('cull-explode-cascade');
							}
						}
					}
				},
			};
		},
		makeDOM(parent) {
			const self = this;
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
					el.className = 'cell bomb appear';
					parent.append(el);
					setPosition({ x, y });
					await new Promise((resolve) => {
						el.addEventListener('animationend', resolve, { once: true });
					});
				},
				async update({ x, y }) {
					if (lastx !== x || lasty !== y) {
						el.className = moving ? 'cell bomb' : 'cell bomb accel';
						setPosition({ x, y });
						await new Promise((resolve) => {
							el.addEventListener('transitionend', resolve, { once: true });
						});
					} else if (moving) {
						el.className = 'cell bomb bounce';
						el.style.setProperty('--bouncex', `${moving.x * 0.5}px`);
						el.style.setProperty('--bouncey', `${moving.y}px`);
						moving = null;
					}
					el.dataset['count'] = count;
					if (count > 0) {
						await new Promise((resolve) => setTimeout(resolve, 500));
					}
				},
				async remove(animate) {
					if (animate) {
						el.className = 'cell bomb explode';
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
