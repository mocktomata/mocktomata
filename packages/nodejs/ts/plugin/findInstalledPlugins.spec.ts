import { a } from 'assertron'
import { dirSync } from 'tmp'
import { findInstalledPlugins } from './index.js'
import { fixturePath } from '../test_util/fixturePath.js'
import { hasAll } from 'satisfier'
test('gets empty plugin list in empty folder', async () => {
	expect(await findInstalledPlugins(dirSync().name)).toEqual([])
})

test('find all installed plugins', async () => {
	const cwd = fixturePath('has-plugins')

	a.satisfies(
		await findInstalledPlugins(cwd),
		hasAll('@mocktomata/plugin-fixture-deep-link', '@mocktomata/plugin-fixture-dummy')
	)
})
