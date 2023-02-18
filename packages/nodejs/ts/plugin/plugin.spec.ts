import { a } from 'assertron'
import { hasAll } from 'satisfier'
import { dirSync } from 'tmp'
import { fixturePath } from '../testutils/fixture.js'
import { findInstalledPlugins } from './index.js'

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
