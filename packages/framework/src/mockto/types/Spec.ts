
export type MocktoMode = 'live' | 'save' | 'simulate' | 'auto'

export interface CreateSpec {
  (id: string, options?: MocktoOptions): Promise<Spec>,
  (id: string, handler: MocktoHandler): void,
  (id: string, options: MocktoOptions, handler: MocktoHandler): void,
}

export type MocktoOptions = {
  timeout: number
}

export type Spec = {
  <S>(subject: S): Promise<S>,
  done(): Promise<void>,
}

export type MocktoHandler = (
  title: string,
  spec: Spec
) => void | Promise<any>
