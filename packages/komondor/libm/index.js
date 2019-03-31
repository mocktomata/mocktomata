import { start } from '@komondor-lab/core';
import { createIO } from '@komondor-lab/io-local';
const io = createIO();
// TODO: Detect different platforms and load different plugins.
// e.g. NodeJS 5 does not support Promise, NodeJS 11 supports bigint
// language and platform support will change over time.
start({ io, libs: [] });
//# sourceMappingURL=index.js.map