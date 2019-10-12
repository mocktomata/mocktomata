export type SpecMode = 'live' | 'save' | 'simulate' | 'auto'

export type SpecOptions = {
  timeout: number
}

export type Spec<T> = {
  subject: T,
  done(): Promise<void>
}
