import { SpecRecord } from './types';

export function prettyPrintSpecRecord(record: SpecRecord) {
  return `{
  "refs": [
    ${record.refs.map(r => JSON.stringify(r)).join(',\n    ')}
  ],
  "actions": [
    ${record.actions.map(a => JSON.stringify(a)).join(',\n    ')}
  ]
}`
}
