export type ReferenceId = string

export type SpecReference = {
  /**
   * Name of the plugin
   */
  plugin: string,

  subject?: any,

  sourceSite?: [ReferenceId, ...Array<string | number>]
}
