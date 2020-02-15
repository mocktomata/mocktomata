import { SpecPlugin } from '@mocktomata/framework'

export namespace FileServer {
  export type Config = {
    'file-server'?: {
      port?: number
    }
  } & SpecPlugin.Config
}
