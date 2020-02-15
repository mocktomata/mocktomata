import { Spec } from './spec/types'
import { SpecPlugin } from './spec-plugin/types'

export namespace Mocktomata {
  export type Config = {
    plugins: string[]
  }
  export type Context = Spec.Context & SpecPlugin.Context
  export type IO = Spec.IO & SpecPlugin.IO
}
