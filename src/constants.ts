import path = require('path')

const pjson = require('../package.json')

export const SPECS_FOLDER = `__${pjson.name}__${path.sep}specs`
export const SCENARIOS_FOLDER = `__${pjson.name}__${path.sep}scenarios`
