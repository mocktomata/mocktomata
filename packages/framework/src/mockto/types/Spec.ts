
export interface CreateSpec {
  (specName: string, options?: MocktoOptions): Promise<Spec>,
  (specName: string, handler: MocktoHandler): void,
  (specName: string, options: MocktoOptions, handler: MocktoHandler): void,
}

export type MocktoOptions = {
  timeout: number
}

export type SpecMode = 'live' | 'save' | 'simulate' | 'auto'

export type Spec = {
  <S>(subject: S): Promise<S>,
  done(): Promise<void>,
}

export type MocktoHandler = (
  specName: string,
  spec: Spec
) => void | Promise<any>
