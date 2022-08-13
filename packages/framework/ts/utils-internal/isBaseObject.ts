export function isBaseObject(value: any) {
  return value === null || value.__proto__ === null && value.constructor.name === 'Object'
}
