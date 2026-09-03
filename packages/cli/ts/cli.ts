import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { cli } from 'clibuilder'
import { serveCommand } from './serve_command.js'

// `../package.json` relative to this module — `lib/cli.js` when built, `ts/cli.ts` when run
// from source — is the package's own manifest either way.
//
// This used to be `uni-require`'s `require('./package.json')`. That shim builds its `require`
// from *its own* `import.meta.url`, so the specifier resolved against `uni-require`'s directory
// and `mt --version` reported `1.0.0`, uni-require's version, instead of the CLI's.
const pjson = JSON.parse(readFileSync(fileURLToPath(new URL('../package.json', import.meta.url)), 'utf8')) as {
	version: string
}

export const app = cli({ name: 'mtmt', version: pjson.version }).command(serveCommand)
