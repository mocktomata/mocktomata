// import { SpecAction } from '@komondor-lab/core';

export interface SpecRecord {
  expectation: string,
  // actions: SpecAction[]
  actions: any[]
}

export interface IOOptions {
  /**
   * URL to the komondor server.
   * This is used by browser tests to connect to the komondor server.
   */
  url?: string
  /**
   * Authenticate key to komondor service
   */
  key?: string
}
