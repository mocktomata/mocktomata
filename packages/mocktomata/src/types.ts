import { Spec, SpecContext } from '@mocktomata/framework'
import { Context } from 'async-fp'

export type WorkerStore = {
  context: Context<SpecContext> | undefined,
  overrideMode?: Spec.Mode,
  filePathFilter?: RegExp,
  specNameFilter?: RegExp
}
