import { SpecOptions } from './createSpec'
import { Spec } from './interfaces'

export interface SpecControl {
  options: SpecOptions,
  spec: Spec<any>
}
