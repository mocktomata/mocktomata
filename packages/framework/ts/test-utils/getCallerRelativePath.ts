import StackUtils from 'stack-utils'
import { AnyFunction } from 'type-plus'

const stackUtil = new StackUtils({ cwd: process.cwd() })

export function getCallerRelativePath(subject: AnyFunction): string {
  const callsite = stackUtil.at(subject)
  const raw = callsite.file || callsite.evalOrigin
  if (!raw) return ''

  return tryGetPathnameFromUrl(raw) || raw
}

function tryGetPathnameFromUrl(raw: string) {
  try {
    return new URL(raw).pathname
  }
  catch (_) {
    return undefined
  }
}
