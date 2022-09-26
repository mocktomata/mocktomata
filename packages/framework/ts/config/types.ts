export namespace Config {
  export type IO = {
    getConfig(): Promise<Record<string, any>>
  }
}
