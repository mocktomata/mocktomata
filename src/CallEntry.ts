import { CallRecord } from './CallRecord'

export interface CallEntry extends Promise<any> {
  inputs: any[],
  /**
   * Synchronous result.
   */
  output: any,
  /**
   * Synchronous error got thrown.
   */
  error: any,
  getCallRecord(): Promise<CallRecord>
}
