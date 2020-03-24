import { Cli } from 'clibuilder'
import validatejs from 'validate.js'

export function validate(context: Cli.RunContext<any, any>, value: any, constraints: any) {
  const failure = validatejs(value, constraints)
  if (failure === undefined) return true

  context.ui.showHelp(context)
  Object.keys(failure).forEach(k => {
    const messages = failure[k]
    context.ui.error(...messages)
  })
  return false
}
