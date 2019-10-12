import { SpecRecord } from './SpecRecord';

export type SpecIO = {
  readSpec(ref: string): Promise<SpecRecord>,
  writeSpec(ref: string, record: SpecRecord): Promise<void>
}
