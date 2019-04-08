import { CliCommand } from 'clibuilder';
import { start } from '../start';
import { CliArgs } from 'clibuilder/lib/argv-parser';

export const startCommand: CliCommand = {
  name: 'start',
  options: {
    number: {
      port: {
        description: 'port number',
        default: 3698
      }
    }
  },
  async run(args) {
    const server = await startServer(args)
    const msg = `--- komondor server started at port ${server.info.port} ---`
    const bar = '-'.repeat(msg.length)
    this.ui.info(`
${bar}
${msg}
${bar}
`)
  }
}

function startServer(args: CliArgs) {
  if (args._defaults.indexOf('port') >= 0)
    return start()
  else
    return start({ port: args.port })
}
