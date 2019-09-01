import { ReferenceId, SpecAction } from './types';
import { SpecRecordLive, SpecReferenceLive } from './types-internal';
import { someKey } from 'type-plus';

export function addReference(refs: SpecReferenceLive[], ref: SpecReferenceLive) {
  return String(refs.push(ref) - 1)
}

export function addAction(actions: SpecAction[], action: SpecAction) {
  return actions.push(action) - 1
}

export function getRef(record: SpecRecordLive, ref: string | number): SpecReferenceLive | undefined {
  return record.refs[Number(resolveRefId(record, ref))]
}

export function resolveRefId({ actions }: Pick<SpecRecordLive, 'actions'>, ref: string | number) {
  while (typeof ref === 'number') ref = actions[ref].ref
  return ref
}

export function findRefByTarget(refs: SpecReferenceLive[], target: any) {
  return refs.find(ref => ref.target === target)
}

export function findRefIdByTarget(refs: SpecReferenceLive[], target: any) {
  const id = refs.findIndex(ref => ref.target === target)
  return (id !== -1) ? String(id) : undefined
}

export function findTarget<T>(refs: SpecReferenceLive[], subject: T): T | undefined {
  const ref = refs.find(r => r.subject === subject)
  return ref && ref.target
}

export function  findSourceInfo(refs: SpecReferenceLive[], subject: any): { id: ReferenceId, path: Array<string | number> } | undefined {
  return refs.reduce((p, ref, i) => {
    if (p) return p

    const path = findSourcePathInRef(ref, subject)
    return path ? {
      id: String(i),
      path
    } : undefined
  }, undefined as any)
}

function findSourcePathInRef(ref: SpecReferenceLive, subject: any): Array<string | number> | undefined {
  if (typeof ref.subject !== 'object' || ref.subject === null) return undefined

  return findSourcePath(ref.subject, subject, [])
}

function findSourcePath(source: Record<any, any> | Array<any>, value: any, path: Array<string | number>): Array<string | number> | undefined {
  if (Array.isArray(source)) {
    return source.some((actual, i) => {
      if (actual === value) {
        path.push(i)
        return true
      }
      if (typeof actual === 'object' && actual !== null) {
        const newPath = findSourcePath(actual, value, [...path, i])
        if (newPath) {
          path = newPath
          return true
        }
      }
      return false
    }) ? path : undefined
  }

  return someKey(source, k => {
    const descriptor = Object.getOwnPropertyDescriptor(source, k)
    if (descriptor && descriptor.get) return false
    const actual = source[k]
    if (actual === value) {
      path.push(k)
      return true
    }
    if (typeof actual === 'object') {
      const newPath = findSourcePath(actual, value, [...path, k])
      if (newPath) {
        path = newPath
        return true
      }
    }
    return false
  }) ? path : undefined
}
