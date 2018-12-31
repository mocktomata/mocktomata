import { PluginActivationContext } from '../plugin'
export function activate(context: PluginActivationContext) {
  context.register(
    'function',
    subject => typeof subject === 'function',
    (context, subject) => subject,
    (context, subject) => subject,
    subject => ''
  )
}
