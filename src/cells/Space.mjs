export const Space = ({
  pulls = [{ pull: { x: 0, y: -1 } }],
  spawn = null,
  seed = null,
  container = null,
} = {}) => () => {
  let content = null;
  const hold = container?.() ?? null;
  let spawning = 0;

  return {
    initialise(scope) {
      if (seed) {
        content = seed.next();
        content?.initialise?.(scope, seed.source);
      } else {
        content = null;
      }
      hold?.initialise?.(scope);
      spawning = 0;
    },
    content() {
      return content;
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
    removeContent(type) {
      hold?.onRemoveContent?.(type);
      const oldContent = content;
      content = null;
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
      for (const { pull, priority = 0 } of pulls) {
        const source = scope.getCell(pull.x, pull.y);
        if (source?.content?.()) {
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
                content = source.removeContent('move');
                content?.move?.(scope);
              }
            },
          };
        }
      }
      if (spawn) {
        return {
          type: 'spawn',
          blockedBy: (a) => spawn.waitForIdle && (!spawn.cascade || !spawning) && a.type === 'drop',
          blocks: (a) => (a.type === 'drop' && a.source === me),
          apply() {
            if (!content) {
              content = spawn.next();
              content?.initialise?.(scope, spawn.source);
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
