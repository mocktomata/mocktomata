import StackUtils from 'stack-utils';

const stackUtil = new StackUtils({ cwd: process.cwd() })

export function getCallerRelativePath(startStackFunction: Function) {
  const callSite = stackUtil.at(startStackFunction)

  // istanbul ignore next
  return callSite.file || getBrowserRelativePath(callSite.evalOrigin!)
}

// istanbul ignore next
function getBrowserRelativePath(evalOrigin: string) {
  // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
  // @ts-ignore
  const href: string = window.location.href
  return evalOrigin.slice(href.length + 2)
}
