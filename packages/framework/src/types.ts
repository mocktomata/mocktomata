import { ReplaceProperty } from 'type-plus'
import { SpecPlugin } from './spec-plugin/types'
import { Spec } from './spec/types'

export namespace Mocktomata {
  export type Config = Spec.Config & SpecPlugin.Config
  // add this back when we have actual use case
  // & {
  //   ecmaVersion: 'ES2015'
  // }
  export type Context = {
    config: Config,
    io: IO
  }
  export type IO = ReplaceProperty<Spec.IO & SpecPlugin.IO, 'getConfig', () => Promise<Config>>
}
