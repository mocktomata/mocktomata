import t from 'assert'
import fs from 'fs'
import path from 'path'
import { dirSync } from 'tmp'
import { ensureFolderCreated } from './fs.js'

test('folder exists does nothing', () => {
	const tmp = dirSync()
	const dir = path.join(tmp.name, 'some-folder')
	fs.mkdirSync(dir)
	fs.writeFileSync(path.join(dir, 'x'), 'abc')
	ensureFolderCreated(dir)
	const actual = fs.readdirSync(dir)

	t.strictEqual(actual[0], 'x')
})

test('create folder if not exist', () => {
	const tmp = dirSync()
	const dir = path.join(tmp.name, 'some-folder')
	ensureFolderCreated(dir)
	const actual = fs.readdirSync(tmp.name)

	t.strictEqual(actual[0], 'some-folder')
})
