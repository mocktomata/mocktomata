import { create } from 'global-store'

export const store = create<{ plugins: any[] }>('komondor/plugin', { plugins: [] })
