import { ConnectedTile } from '../common/ConnectedTile.mjs';

export const Void = () => () => {
	const tile = new ConnectedTile();
	return {
		type: 'void',
		initialise(scope) {
			tile.update((x, y) => scope.getCell(x, y)?.type === 'void');
		},
		makeDOM(parent) {
			const el = parent.ownerDocument.createElement('div');
			el.className = 'cell void';
			el.append(tile.makeDOM());

			return {
				initialise({ x, y }) {
					el.style.setProperty('--x', x);
					el.style.setProperty('--y', y);
					parent.append(el);
				},
				remove() {
					el.remove();
				},
			};
		},
	};
};
