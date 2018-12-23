import { create } from 'global-store'

export const configHandlerStore = create<((config: any) => void)[]>('komondor-core/config-handlers', [])
