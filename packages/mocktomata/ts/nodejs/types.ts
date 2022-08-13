export namespace config {
  export type Options = {
    io?: {
      cwd?: string,
      dir?: string
    },
    runtime?: {
      target?: 'es2015',
      plugins?: string[]
    }
  }
}
