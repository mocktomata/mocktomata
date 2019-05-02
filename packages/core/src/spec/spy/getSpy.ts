import { KomondorPlugin } from '@komondor-lab/plugin'
import { SpyContext } from './interfaces';

// import { unartifactify } from './artifactify';
// import { isClass } from './class/isClass';

export function getSpy<T>(context: SpyContext, plugin: KomondorPlugin, subject: T): T {
  if (subject === undefined || subject === null) return subject
  const spy = plugin.getSpy(context, subject)
  // return isClass(subject) ?
  //   function (...args) {
  //     return new spy(...unartifactify(args))
  //   } : spy
  return spy
}
