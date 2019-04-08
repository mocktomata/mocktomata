import { Cli } from 'clibuilder';
import { getVersion } from './version';
import { startCommand } from './commands';

export const cli = new Cli({
  name: 'uni',
  version: getVersion(),
  defaultConfig: { devpkgKeywords: ['uni-devpkg'] },
  commands: [startCommand]
})
