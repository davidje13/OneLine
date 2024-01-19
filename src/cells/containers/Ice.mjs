export const Ice = ({
  strength = 3,
  blockInteraction = false,
} = {}) => () => {
  let hits = 0;
  let hit = false;
  return {
    allowAccess() {
      return !blockInteraction || hits >= strength;
    },
    onRemoveContent(type) {
      if (hits < strength) {
        if (type === 'cull' || type === 'cull-cascade' || type === 'cull-bomb') {
          hit = true;
        }
      }
    },
    step(scope) {
      if (hit) {
        return {
          type: 'ice-break',
          incidental: true,
          blocks: (a) => (a.type === 'drop' || a.type === 'spawn'),
          apply() {
            if (hits < strength) {
              ++hits;
              if (hits >= strength) {
                scope.recordEvent('break-ice');
              }
            }
            hit = false;
          },
        };
      }
    },
    makeDOM(parent) {
      const el = parent.ownerDocument.createElement('div');
      let prevHits = 0;
      return {
        async initialise({ x, y }) {
          el.style.setProperty('--x', x);
          el.style.setProperty('--y', y);
          el.dataset['hits'] = hits;
          prevHits = hits;
          el.className = 'cell ice appear';
          parent.append(el);
        },
        async update() {
          if (hits !== prevHits && prevHits < strength) {
            prevHits = hits;
            if (hits >= strength) {
              el.className = 'cell ice disappear';
              await new Promise((resolve) => {
                el.addEventListener('animationend', resolve, { once: true });
              });
              el.remove();
            } else {
              el.dataset['hits'] = hits;
              el.className = 'cell ice anim';
              await new Promise((resolve) => {
                el.addEventListener('animationend', resolve, { once: true });
              });
              el.className = 'cell ice';
            }
          }
        },
        async remove(animate) {
          if (animate) {
            el.className = 'cell ice disappear';
            await new Promise((resolve) => {
              el.addEventListener('animationend', resolve, { once: true });
            });
          }
          el.remove();
        },
      };
    },
  };
};
