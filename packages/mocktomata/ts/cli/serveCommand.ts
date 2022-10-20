import { start } from '@mocktomata/service'
import chalk from 'chalk'
import { command, z } from 'clibuilder'
import { validate } from './validate.js'

export const serveCommand = command({
  name: 'serve',
  description: 'Starts a local server to serve requests from client (browser)',
  options: {
    port: {
      description: 'port number',
      // default: 3698
      type: z.optional(z.number())
    }
  },
  context: {
    start
  },
  async run(args: any) {
    if (validate(this, args, {
      port: {
        presence: false,
        numericality: {
          onlyInteger: true,
          lessThanOrEqualTo: 65535,
          message: 'must be a valid port number'
        }
      }
    })) {
      const { port } = args
      const server = await this.context.start({ cwd: this.cwd, port })
      const info = `${server.info.protocol}://localhost:${server.info.port}`
      const bar = '-'.repeat(info.length + 8)
      this.ui.info(`
mocktomata server started.
${bar}
    ${chalk.magenta(info)}
${bar}
`)
    }
  }
})
