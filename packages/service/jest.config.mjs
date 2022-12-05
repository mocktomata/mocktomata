// import preset from '@repobuddy/jest/presets/ts-esm'
// import localPreset from '../../.jest/preset.js'

// /** @type {import('jest').Config} */
// export default {
//   ...preset,
//   moduleNameMapper: {
//     ...preset.moduleNameMapper,
//     ...localPreset.moduleNameMapper,
//   },
//   transformIgnorePatterns: [
//     'node_modules/(?!(node-fetch))'
//   ],
//   displayName: 'service'
// }

import base from '../../.jest/jest.nodejs.js'

/** @type {import('jest').Config} */
export default {
  ...base,
  displayName: 'service',
  transformIgnorePatterns: [
    'node_modules/(?!(node-fetch))'
  ]
}
