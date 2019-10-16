import { start } from '@moctomata/file-server';
import chalk from 'chalk';
import { CliArgs, CliCommand } from 'clibuilder';
import { validate } from './validate';

export const serveCommand: CliCommand = {
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
  async run(args) {
    if (validate({ ui: this.ui }, args, {
      port: {
        presence: true,
        numericality: {
          onlyInteger: true,
          greaterThanOrEqualTo: 3000,
          lessThanOrEqualTo: 65535,
          message: 'must be between 3000 and 65535'
        }
      }
    })) {
      const server = await startServer(args)
      const msg = `      ${chalk.magenta(`${server.info.protocol}://localhost:${server.info.port}`)}`
      const bar = '-'.repeat(msg.length)
      this.ui.info(`
komondor server started.
${bar}
${msg}
${bar}
`)
    }
  }
}

function startServer(args: CliArgs) {
  if (args._defaults.indexOf('port') >= 0)
    return start()
  else
    return start({ port: args.port })
}
