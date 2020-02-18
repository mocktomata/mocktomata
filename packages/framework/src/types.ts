import { ReplaceProperty } from 'type-plus'
import { SpecPlugin } from './spec-plugin/types'
import { Spec } from './spec/types'

export namespace Mocktomata {
  export type Config = Spec.Config & SpecPlugin.Config & {
    ecmaVersion: 'ES2015'
  }
  export type Context = Spec.Context & SpecPlugin.Context
  export type IO = ReplaceProperty<Spec.IO & SpecPlugin.IO, 'getConfig', () => Promise<Config>>
}
