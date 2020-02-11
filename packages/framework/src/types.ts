import { Store } from 'global-store'
import { Spec, SpecPlugin, SpecStore } from './spec/types'

export type MocktomataContext = {
  io: Spec.IO & SpecPlugin.IO,
  store: Store<SpecStore>
}
