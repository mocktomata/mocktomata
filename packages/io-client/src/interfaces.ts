import { SpecAction } from '@komondor-lab/core';

export interface SpecRecord {
  expectation: string,
  actions: SpecAction[]
}

export interface IORemoteOptions {
  /**
   * URL to the komondor server.
   * This is used by browser tests to connect to the komondor server.
   */
  url: string
  /**
   * Authenticate key to komondor service
   */
  key?: string
}
