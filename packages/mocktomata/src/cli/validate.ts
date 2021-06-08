import validateJs from 'validate.js'

export function validate(context: any, value: any, constraints: any) {
  const failure = validateJs(value, constraints)
  if (failure === undefined) return true

  context.ui.showHelp(context)
  Object.keys(failure).forEach(k => {
    const messages = failure[k]
    context.ui.error(...messages)
  })
  return false
}
