import { SpecRecord } from './SpecRecord';

export type SpecIO = {
  /**
   * Read spec record.
   * @param specRelativePath file path of where the spec was used relative to:
   * root of project (`process.cwd()`) for server side usage,
   * path name (http://host/<path-name>?query) for client side usage.
   * For example, when used in test, it is the relative path of the test file.
   */
  readSpec(specName: string, specRelativePath: string): Promise<SpecRecord>,
  /**
   * Write spec record.
   * @param specRelativePath file path of where the spec was used relative to:
   * root of project (`process.cwd()`) for server side usage,
   * path name (http://host/<path-name>?query) for client side usage.
   * For example, when used in test, it is the relative path of the test file.
   */
  writeSpec(specName: string, specRelativePath: string, record: SpecRecord): Promise<void>
}
