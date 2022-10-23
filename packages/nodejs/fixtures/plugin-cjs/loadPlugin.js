const { createStandardLogForTest } = require('standard-log')
const { createIO } = require('@mocktomata/nodejs')

const sl = createStandardLogForTest()
const log = sl.getLogger('test')
const cwd = process.cwd()
const io = createIO({ cwd, log })

const [, , id] = process.argv

  ; (async () => {
    const plugin = await io.loadPlugin(id)
    console.info(plugin)
  })()
