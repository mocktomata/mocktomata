import { CreateIOOptions } from '@mocktomata/io-local'

export type Config = {
  io?: CreateIOOptions,
  runtime?: {
    target?: 'es2015'
  }
}
