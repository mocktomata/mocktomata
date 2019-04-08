export interface CreateIOOptions {
  /**
   * URL to the komondor server.
   * This is used by browser tests to connect to the komondor server.
   */
  url: string
}

export type ServerInfo = {
  version: string
  url: string,
  plugins: string[]
}
