import { Spec } from '@mocktomata/framework';
import { config, ConfigOptions } from 'standard-log';

export type StartOptions = {
  folder: string,
  libs: string[],
  plugins: string[],
  mode: Spec.Mode,
  fileName: RegExp,
  specName: RegExp,
  logOptions: Partial<ConfigOptions>,
  clientOptions: {
    url: string
  },
  serverOptions: {
    port: number
  },
}
export function start(options: Partial<StartOptions> = {}) {
  if (options.logOptions) {
    config(options.logOptions)
  }
}
