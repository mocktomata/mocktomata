import { ReferenceId } from './SpecAction';

export type SpecReference = {
  /**
   * Name of the plugin
   */
  plugin: string,

  subject?: any,

  specTarget?: boolean,

  source?: { id: ReferenceId, path: Array<string | number> }
}
