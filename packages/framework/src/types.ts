import { Store } from 'global-store'
import { Spec, SpecPluginModuleIO, SpecStore } from './spec/types'

export type MocktomataContext = {
  io: Spec.IO & SpecPluginModuleIO,
  store: Store<SpecStore>
}
