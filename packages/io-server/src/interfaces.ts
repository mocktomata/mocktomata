export interface IOServerOptions {
  /**
   * Working directory of the server. Default to process.cwd.
   */
  cwd?: string
  /**
   * Port number the server will run on.
   */
  port: number
}
