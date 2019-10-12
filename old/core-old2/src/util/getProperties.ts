import { getPropertyNames } from './getPropertyNames';

export function getProperties(subject: any) {
  const propertyNames = getPropertyNames(subject)
  return propertyNames.reduce((p, name) => {
    p[name] = {
      descriptor: Object.getOwnPropertyDescriptor(subject, name),
      type: typeof subject[name]
    }
    return p
  }, {} as any)
}
