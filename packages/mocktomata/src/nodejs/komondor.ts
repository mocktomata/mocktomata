import { createKomondor } from '@mocktomata/framework'
import { createContext } from './createContext'

const context = createContext()

export const komondor = createKomondor(context)

export const kd = komondor
