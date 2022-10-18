import type { Log } from '../log/types.js'
import type { SpecPlugin } from '../spec-plugin/types.js'
import type { Spec } from '../spec/types.js'

export namespace Config {
  export type Options = {
    config?: Spec.Config & Partial<SpecPlugin.Config> & Log.Config
  }

  export type Context = {
    config: Spec.Config & SpecPlugin.Config & Log.Config
  }
}
