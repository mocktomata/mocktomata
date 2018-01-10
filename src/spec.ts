import { satisfy } from 'assertron'
import { Expectation, Spy, spy, CallRecord } from 'satisfier'
import { unpartial } from 'unpartial'


export interface SpecOptions {
  /**
   * ID of the spec.
   */
  id: string
  description: string
  /**
   * Scenario that this spec belongs to.
   * Scenario is used by global config to change the mode of the spec,
   * so that certain scenario can be changed to `verify` to test some real call in certain context (scenario),
   * while others remain in `replay` or `verify` mode.
   */
  scenario: string
  /**
   * Mode of the spec operating in.
   * `verify`: making real calls and verify in `satisfy()`.
   * `save`: making real calls and save the result in file.
   * `replay`: replay calls from file.
   */
  mode: 'verify' | 'save' | 'replay'
}

export interface Spec<T extends Function> extends Spy<T> {
  satisfy(expectation: Expectation): Promise<void>
}

export function spec<T extends Function>(fn: T, options?: Partial<SpecOptions>): Spec<T> {
  const opt = unpartial({ mode: 'verify' }, options)
  switch (opt.mode) {
    case 'verify':
    default:
      const spied = spy(fn)
      return Object.assign(spied, {
        satisfy(expectation: Expectation<CallRecord[]>) {
          return Promise.all(spied.calls.map(call => call.getCallRecord()))
            .then(records => {
              satisfy(records, expectation)
            })
        }
      })
  }
}
