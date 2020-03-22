import { incubator } from '@mocktomata/framework'
import fs from 'fs'
import path from 'path'

incubator.duo('readFileSync in string', (title, spec) => {
  test(title, async () => {
    const sfs = await spec(fs)

    const filePath = getFixturePath('dummy.txt')
    const data = sfs.readFileSync(filePath, 'utf-8')
    expect(data).toEqual(`dummy`)
    await spec.done()
  })
})

incubator.duo('readFileSync in Buffer', (title, spec) => {
  test(title, async () => {
    const sfs = await spec(fs)

    const filePath = getFixturePath('dummy.txt')
    const data = sfs.readFileSync(filePath)
    expect(data.toString()).toEqual(`dummy`)
    await spec.done()
  })
})

function getFixturePath(targetPath: string) {
  return path.resolve(__dirname, `../../.fixtures/${targetPath}`)
}
