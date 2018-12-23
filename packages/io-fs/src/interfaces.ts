import { SpecAction } from '@komondor-lab/core';

export interface SpecRecord {
  expectation: string,
  actions: SpecAction[]
}
