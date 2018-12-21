import 'komondor-plugin-fixture-deep-link'
import 'komondor-plugin-fixture-dummy'
import 'komondor-plugin-fixture-no-activate'

const testsContext = require.context('.', true, /\.spec/)

testsContext.keys().forEach(testsContext)
