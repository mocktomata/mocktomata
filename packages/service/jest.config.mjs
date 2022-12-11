import preset from '@repobuddy/jest/presets/ts'
import deepmerge from 'deepmerge'

/** @type {import('jest').Config} */
export default deepmerge(
  preset, {
  displayName: 'service'
})
