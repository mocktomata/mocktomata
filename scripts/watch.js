'use strict'

const cp = require('child_process')

cp.spawn('tsc', ['-w'], {})
cp.spawn('jest', ['--watch'], {
	stdio: 'inherit',
	shell: true
})
