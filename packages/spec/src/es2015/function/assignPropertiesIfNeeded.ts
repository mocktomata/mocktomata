export function assignPropertiesIfNeeded(target: any, properties: any) {
  return properties ? Object.assign(target, properties) : target
}
