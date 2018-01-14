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
  invokedCallback?: string,
  asyncOutput?: any,
  asyncError?: any
}

export interface CallRecord {
  inputs: any[],
  output: any,
  error: any,
  invokedCallback: string,
  asyncOutput: any,
  asyncError: any,
  tersify(): string
}

export const CallRecord = {
  /**
   * Creates a call record object.
   */
  create({ inputs, output, error, invokedCallback, asyncOutput, asyncError }: CallRecordData) {
    return tersible({ inputs, output, error, invokedCallback, asyncOutput, asyncError },
      () => {
        const obj = { inputs, output, error } as CallRecord
        if (invokedCallback !== undefined) obj.invokedCallback = invokedCallback
        if (asyncError !== undefined) obj.asyncError = asyncError
        if (asyncOutput !== undefined) obj.asyncOutput = asyncOutput
        return tersify(obj, { maxLength: Infinity })
      })
  }
}
