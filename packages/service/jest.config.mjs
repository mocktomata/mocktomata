import preset from '@repobuddy/jest/presets/ts-watch'
import deepmerge from 'deepmerge'

/** @type {import('jest').Config} */
export default deepmerge(preset, {
	displayName: 'service'
})
