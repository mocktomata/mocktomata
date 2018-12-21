import { get, set } from 'global-store'

export const store = {
  get<T>(name: string, defaultValue?: T) {
    return get<T>(`komondor.${name}`, defaultValue)
  },
  set(name: string, value: any) {
    set(`komondor.${name}`, value)
  }
}
