import { createSpec } from './createSpec';
export const spec = Object.assign(createSpec('live'), {
    live: createSpec('live'),
    save: createSpec('save'),
    simulate: createSpec('simulate')
});
//# sourceMappingURL=spec.js.map