import { createKomondor } from '@mocktomata/framework'
import { createContext } from './createContext.js'

const context = createContext()

export const komondor = createKomondor(context)

export const kd = komondor
