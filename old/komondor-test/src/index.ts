export * from './testTrio'

import { testLive as live, testSave as save, testSimulate as simulate, testTrio as trio } from './testTrio'

const komondorTest = { live, save, simulate, trio }

export default komondorTest
