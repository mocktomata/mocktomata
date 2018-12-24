import { create } from 'global-store';
import { Config } from './interfaces';

export const store = create<Config>('komondor/config', {})
