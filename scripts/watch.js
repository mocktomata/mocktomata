const cp = require('node:child_process')

cp.spawn('tsc', ['-w'], {})
cp.spawn('jest', ['--watch'], {
	stdio: 'inherit',
	shell: true
})
