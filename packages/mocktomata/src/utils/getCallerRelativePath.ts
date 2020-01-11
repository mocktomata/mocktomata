import StackUtils from 'stack-utils';

const stackUtil = new StackUtils({ cwd: process.cwd() })

export function getCallerRelativePath(subject: Function): string {
  const callsite = stackUtil.at(subject)
  // istanbul ignore next
  return callsite.file || callsite.evalOrigin!
}
