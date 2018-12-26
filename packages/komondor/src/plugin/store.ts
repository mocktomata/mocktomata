import { create } from 'global-store'
import { Plugin } from './interfaces'

export const store = create<{ plugins: Plugin[] }>('komondor/plugin', { plugins: [] })
