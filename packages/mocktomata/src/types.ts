import { Spec } from '@mocktomata/framework'
import { Context } from 'async-fp'

export type WorkerStore = {
  context: Context<Spec.Context> | undefined,
  overrideMode?: Spec.Mode,
  filePathFilter?: RegExp,
  specNameFilter?: RegExp
}
