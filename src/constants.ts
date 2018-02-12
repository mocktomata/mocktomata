import path = require('path')

const pjson = require('../package.json')

export const KOMONDOR_CONFIG = pjson.komondor
export const SPECS_FOLDER = `__${pjson.name}__${path.sep}specs`
export const GIVENS_FOLDER = `__${pjson.name}__${path.sep}givens`

// put this here before Scenario is implemented
export interface ScenarioOptions {
  /**
   * ID of the Scenario.
   * Scenario is used by global config to change the mode of the spec,
   * so that certain scenario can be changed to `verify` to test some real call in certain context (scenario),
   * while others remain in `replay` or `verify` mode.
   */
  id: string
  /**
   * Given statement in Behavior Driven Development.
   * This is provided to communicate between teams to setup the scenario correctly for this suite.
   */
  given: string
}
