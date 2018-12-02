import path = require('path')

const pjson = require('../package.json')

export const KOMONDOR_FOLDER = '__komondor__'
export const SPECS_FOLDER = `__${pjson.name}__${path.sep}specs`
export const GIVENS_FOLDER = `__${pjson.name}__${path.sep}givens`

export const artifactKey = Symbol.for('artifact')
