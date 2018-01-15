import {
  tersible,
  tersify,
  // @ts-ignore
  Tersify,
  // @ts-ignore
  TersifyOptions
} from 'tersify'

export interface CallRecordData {
  inputs: any[],
  output: any,
  error: any,
  /**
   * Name of the invoked callback on object literal input.
   * This property only exists for object literal input.
   */
  callbackPath?: (string | number)[],
  asyncOutput?: any,
  asyncError?: any
}

export interface CallRecord {
  inputs: any[],
  output: any,
  error: any,
  callbackPath: (string | number)[],
  asyncOutput: any,
  asyncError: any,
  tersify(): string
}

export const CallRecord = {
  /**
   * Creates a call record object.
   */
  create({ inputs, output, error, callbackPath, asyncOutput, asyncError }: CallRecordData) {
    return tersible({ inputs, output, error, callbackPath, asyncOutput, asyncError },
      () => {
        const obj = { inputs, output, error } as CallRecord
        if (callbackPath !== undefined) obj.callbackPath = callbackPath
        if (asyncError !== undefined) obj.asyncError = asyncError
        if (asyncOutput !== undefined) obj.asyncOutput = asyncOutput
        return tersify(obj, { maxLength: Infinity })
      })
  }
}
