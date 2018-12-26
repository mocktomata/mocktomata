import a from 'assertron';
import { PluginAlreadyLoaded } from './errors';
import { registerPlugin } from './registerPlugin';
import { PluginModule } from './interfaces';
import { getPlugins } from './getPlugins';
import { some } from 'satisfier';

test('register plugin', () => {
  registerPlugin(createEmptyPlugin('dummy'))
  a.satisfies(getPlugins(), some({ name: 'dummy' }))
})

test('registering plugin with the same name throws PluginAlreadyLoaded', () => {
  registerPlugin(createEmptyPlugin('same-name'))

  a.throws(() => registerPlugin(createEmptyPlugin('same-name')), PluginAlreadyLoaded)
})

function createEmptyPlugin(name: string): PluginModule {
  return {
    activate(a) {
      a.register(
        name,
        () => false,
        () => { return },
        () => { return },
        () => { return }
      )
    }
  }
}
