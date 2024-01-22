export const Space = (spawn = null) => ({
	pulls = [{ pull: { x: 0, y: -1 } }],
	seed = null,
	container = null,
} = {}) => () => {
	let content = null;
	const hold = container?.() ?? null;
	let spawning = 0;

	return {
		initialise(scope) {
			if (seed) {
				content = seed();
				content?.initialise?.(pulls[0]?.pull);
			} else {
				content = null;
			}
			hold?.initialise?.(scope);
			spawning = 0;
		},
		content() {
			return content;
		},
		locked() {
			return hold?.locked?.() ?? false;
		},
		interactiveContent() {
			if (!hold || hold.allowAccess()) {
				return content;
			}
		},
		mouseDown(scope, start) {
			const holdHandler = hold?.mouseDown?.(scope, start);
			if (holdHandler) {
				return holdHandler;
			}
			if (!hold || hold.allowAccess()) {
				return content?.mouseDown(scope, start);
			}
			return null;
		},
		replaceContent(type, newContent = null) {
			hold?.onRemoveContent?.(type);
			const oldContent = content;
			if (typeof newContent === 'function') {
				content = newContent();
				content?.initialise?.();
			} else {
				content = newContent;
				content?.move?.();
			}
			return oldContent;
		},
		step(scope) {
			const holdAction = hold?.step?.(scope, content);
			if (holdAction) {
				return holdAction;
			}
			if (content) {
				return content.step?.(scope);
			}
			const me = scope.getCell();
			let canPull = false;
			for (const { pull, priority = 0 } of pulls) {
				const source = scope.getCell(pull.x, pull.y);
				if (source && source.content && !source.locked?.()) {
					canPull = true;
					if (source.content()) {
						return {
							type: 'drop',
							source,
							priority,
							blockedBy: (a) => (
								a.type === 'drop' &&
								a.source === source &&
								a.priority < priority
							),
							blocks: (a) => (a.type === 'drop' && a.source === me),
							apply() {
								if (!content) {
									content = source.replaceContent('move');
									content?.move?.();
								}
							},
						};
					}
				}
			}
			if (spawn && !canPull) {
				return {
					type: 'spawn',
					blockedBy: (a) => spawn.waitForIdle && (!spawn.cascade || !spawning) && a.type === 'drop',
					blocks: (a) => (a.type === 'drop' && a.source === me),
					apply() {
						if (!content) {
							content = spawn.next();
							content?.initialise?.(pulls[0]?.pull);
							spawning = 2;
						}
					},
				};
			}
			return null;
		},
		afterStep() {
			if (spawning) {
				--spawning;
			}
			hold?.afterStep?.();
		},
		makeDOM(parent) {
			return hold?.makeDOM?.(parent);
		},
	};
}
