import { json } from '../json.js'
import type { SpecRecord } from './types.js'

export function prettyPrintSpecRecord(record: SpecRecord) {
	return `{
  "refs": [
    ${record.refs.map(r => json.stringify(r)).join(',\n    ')}
  ],
  "actions": [
    ${record.actions.map(a => json.stringify(a)).join(',\n    ')}
  ]
}`
}
