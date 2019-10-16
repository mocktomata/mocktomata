import t from 'assert'
import fs from 'fs'
import k from './testUtil'

// need to link `komondor-plugin-node` and add it to package.json/komondor/plugins for this test to work
k.simulate('spec/fs/readStream/success', (title, spec) => {
  test.skip(title, async () => {
    const read = (fileStream: fs.ReadStream) => {
      return new Promise(a => {
        const chunks: any[] = []
        // TODO: capture and replay functions
        // Simulation does not have information about `chunk => chunks.push(chunk)`
        // To support this, need to save the function into SpecAction instead of serializing it to `null`
        // and recreate and execute it using `new Function()`
        // related to https://github.com/mocktomata/mocktomata/issues/36 and https://github.com/mocktomata/mocktomata/issues/35
        fileStream.on('data', chunk => chunks.push(chunk))
        fileStream.on('end', () => a(chunks.join()))
      })
    }
    const s = await spec(read)
    const file = fs.createReadStream('fixtures/file.txt')
    const actual = await s.subject(file)
    t.strictEqual(actual, 'file\n')

    await s.done()
  })
})
