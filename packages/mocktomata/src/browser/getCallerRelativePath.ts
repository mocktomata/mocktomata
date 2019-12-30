import StackUtils from 'stack-utils';

const stackUtil = new StackUtils({ cwd: process.cwd() })

export function getCallerRelativePath(subject: Function) {
  const callSite = stackUtil.at(subject)
  // istanbul ignore next
  return callSite.file || callSite.evalOrigin!
}
