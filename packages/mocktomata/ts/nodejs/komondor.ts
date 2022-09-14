import { createKomondor } from '@mocktomata/framework'
import { createContext } from './createContext.js'

export const komondor = createKomondor(createContext())

export const kd = komondor
