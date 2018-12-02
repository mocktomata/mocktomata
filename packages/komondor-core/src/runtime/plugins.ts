import { get } from 'global-store';

const STORE_NAME = 'komondor.runtime.plugins'

export const plugins = get(STORE_NAME, [])
