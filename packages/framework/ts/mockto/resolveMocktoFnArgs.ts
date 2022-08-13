import { Spec } from '../spec/types.js'

export function resolveMocktoFnArgs<H = Spec.Handler>(args: any[]): { specName: string, options: Spec.Options | undefined, handler: H } {
  if (args.length === 3) {
    return { specName: args[0], options: args[1], handler: args[2] }
  }
  else {
    return { specName: args[0], options: undefined, handler: args[1] }
  }
}
