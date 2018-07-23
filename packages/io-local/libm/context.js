import { createFileRepository } from '@komondor-lab/io-fs';
import { createStore } from 'global-store';
const defaultContext = {
    repository: createFileRepository(process.cwd())
};
export const context = createStore('@komondor-lab/io-local/context', defaultContext);
//# sourceMappingURL=context.js.map