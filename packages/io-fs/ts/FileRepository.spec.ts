import { FileRepository } from './index.js'
import { fixturePath } from './util/index.js'

test('load config', () => {
  const repo = getTestRepo()
  const config = repo.loadConfig()
  expect(config.plugins).toEqual(['plugin-a'])
})

test('load plugin', () => {
  const repo = getTestRepo()
  const plugin = repo.loadPlugin('plugin-a')
  expect(typeof plugin.activate).toBe('function')
})

test('find installed plugins', async () => {
  const repo = getTestRepo()
  const plugins = await repo.findInstalledPlugins()
  expect(plugins).toEqual(['plugin-a', 'plugin-b'])
})

test('read/write spec', () => {
  const repo = getTestRepo()
  const relative = './src/FileRepository.spec.ts'
  repo.writeSpec('some spec', relative, 'abc')
  const spec = repo.readSpec('some spec', relative)
  expect(spec).toBe('abc')
})

function getTestRepo() {
  const cwd = fixturePath('file-repository')
  return new FileRepository({ cwd })
}
