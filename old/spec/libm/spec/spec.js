import { createSpec } from './createSpec';
export const spec = Object.assign(createSpec('live'), {
    live: createSpec('live'),
    save: createSpec('save'),
    replay: createSpec('replay')
});
//# sourceMappingURL=spec.js.map