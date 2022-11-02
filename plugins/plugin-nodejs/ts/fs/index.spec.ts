import { incubator } from '@mocktomata/framework'
import { dirname } from 'dirname-filename-esm'
import fs from 'fs'
import path from 'path'

incubator('readFileSync in string', (specName, spec) => {
  test(specName, async () => {
    const sfs = await spec(fs)

    const filePath = getFixturePath('dummy.txt')
    const data = sfs.readFileSync(filePath, 'utf-8')
    expect(data).toEqual(`dummy`)
    await spec.done()
  })
})

incubator('readFileSync in Buffer', (specName, spec) => {
  test(specName, async () => {
    const sfs = await spec(fs)

    const filePath = getFixturePath('dummy.txt')
    const data = sfs.readFileSync(filePath)
    expect(data.toString()).toEqual(`dummy`)
    await spec.done()
  })
})

function getFixturePath(targetPath: string) {
  return path.resolve(dirname(import.meta), `../../.fixtures/${targetPath}`)
}
