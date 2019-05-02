import { SpecAction, SpecIO } from './types';

export async function loadActions({ io }: {
  io: SpecIO;
}, specId: string): Promise<SpecAction[]> {
  const specRecord = await io.readSpec(specId);
  return fixCircularRefs(specRecord.actions);
}

function fixCircularRefs(actions: SpecAction[]) {
  const objRefs: object[] = []
  return actions.map(action => {
    return { ...action, payload: fixCirRefValue(action.payload, objRefs) }
  })
}

function fixCirRefValue(value: any, objRefs: object[]): any {
  if (Array.isArray(value)) {
    return value.map(p => fixCirRefValue(p, objRefs))
  }
  if (value === undefined || value === null) return value

  const type = typeof value
  if (type === 'object') {
    objRefs.push(value)
    Object.keys(value).forEach(k => value[k] = fixCirRefValue(value[k], objRefs))
    return value
  }
  if (typeof value !== 'string') return value

  const matches = /\[circular:(\d+)\]/.exec(value)
  if (matches) {
    const cirId = parseInt(matches[1], 10)
    return objRefs[cirId]
  }
  return value
}
