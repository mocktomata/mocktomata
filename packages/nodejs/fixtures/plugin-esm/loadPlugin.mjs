import { createStandardLogForTest } from 'standard-log/testing'
import { createIO } from '@mocktomata/nodejs'

const sl = createStandardLogForTest()
const log = sl.getLogger('test')
const cwd = process.cwd()
const io = createIO({ cwd, log })

const [, , id] = process.argv

  ; (async () => {
    try {
      const plugin = await io.loadPlugin(id)
      console.info(typeof plugin.activate)
    }
    catch (e) {
      console.error(e)
    }
  })()
