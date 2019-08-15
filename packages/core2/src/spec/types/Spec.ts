export type SpecMode = 'live' | 'save' | 'simulate' | 'auto'

export type CreateSpecFunction = <S>(id: string, subject: S, options?: SpecOptions) => Promise<Spec<S>>

export type SpecOptions = {
  timeout: number
}

export type Spec<S> = {
  subject: S,
  done(): Promise<void>
}
