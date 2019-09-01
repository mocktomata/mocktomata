export type SpecMode = 'live' | 'save' | 'simulate' | 'auto'

export type CreateSpec = (id: string, options?: SpecOptions) => Promise<Spec>

export type SpecOptions = {
  timeout: number
}

export type Spec = {
  mock<S>(subject: S): S,
  done(): Promise<void>
}
