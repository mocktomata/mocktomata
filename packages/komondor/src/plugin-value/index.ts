import { PluginActivationContext } from '../plugin'
export function activate(activationContext: PluginActivationContext) {
  activationContext.register(
    'value',
    subject => {
      const type = typeof subject
      return type === 'boolean' ||
        type === 'number' ||
        type === 'string' ||
        type === 'undefined' ||
        subject === null ||
        type === 'symbol' ||
        (type === 'object' && Object.prototype.toString.call(subject) === '[object Symbol]')
    },
    (_, subject) => subject,
    (_, subject) => subject,
    subject => subject
  )
}
