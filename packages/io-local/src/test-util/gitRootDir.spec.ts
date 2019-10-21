
import { gitRootDir } from './gitRootDir'
import { dirSync } from 'tmp'
import fs from 'fs'
import path from 'path'

test('works on repo root', () => {
  const cwd = dirSync().name
  fs.mkdirSync(path.join(cwd, '.git'))
  expect(gitRootDir(cwd)).toBe(cwd)
})

test('go up to repo root', () => {
  const cwd = dirSync().name
  let current = cwd
  fs.mkdirSync(path.join(cwd, '.git'))
  fs.mkdirSync(current = path.join(current, 'a'))
  fs.mkdirSync(current = path.join(current, 'b'))
  fs.mkdirSync(current = path.join(current, 'c'))
  expect(gitRootDir(current)).toBe(cwd)
})
