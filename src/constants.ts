import path = require('path')

const pjson = require('../package.json')

export const SPECS_FOLDER = `__${pjson.name}__${path.sep}specs`
export const GIVENS_FOLDER = `__${pjson.name}__${path.sep}givens`
