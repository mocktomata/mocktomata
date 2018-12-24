import fs from 'fs'
import { CliCommand } from 'clibuilder'

export const bundleCommand: CliCommand = {
  name: 'bundle-plugins',
  description: 'Bundle plugins for browser usage',
  options: {
    string: {
      config: {
        description: 'config file to load',
        default: 'komondor.config.js'
      },
      output: {
        description: 'path for the output bundled file'
      }
    }
  },
  run(args) {
    const { config } = args
    const komondorConfig = fs.readFileSync(config, 'utf-8')
    console.log(komondorConfig)
  }
}
