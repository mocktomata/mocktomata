export interface SpecAction {
  type: string;
  name: string;
  payload: any;
}

export type SpecMode = 'live' | 'save' | 'simulate'

export interface Spec<T> {
  subject: T,
  done(): Promise<void>
}
