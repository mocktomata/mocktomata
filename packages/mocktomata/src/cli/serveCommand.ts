import { start } from '@mocktomata/file-server'
import chalk from 'chalk'
import { createCommand } from 'clibuilder'
import { validate } from './validate'

export const serveCommand = createCommand({
  name: 'serve',
  description: 'Starts a local server to serve requests from client (browser)',
  options: {
    number: {
      port: {
        description: 'port number',
        default: 3698
      }
    }
  },
  context: {
    _deps: { start }
  },
  async run(args) {
    if (validate(this, args, {
      port: {
        presence: true,
        numericality: {
          onlyInteger: true,
          lessThanOrEqualTo: 65535,
          message: 'must be a valid port number'
        }
      }
    })) {
      const { port } = args
      const server = await this._deps.start({ cwd: this.cwd, port })
      const msg = `      ${chalk.magenta(`${server.info.protocol}://localhost:${server.info.port}`)}`
      const bar = '-'.repeat(msg.length)
      this.ui.info(`
mocktomata server started.
${bar}
${msg}
${bar}
`)
    }
  }
})

