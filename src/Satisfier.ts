import { createSatisfier } from './createSatisfier'
import { Expecter, Struct, SatisfierExec } from './interfaces'

export class Satisfier<T extends Struct> {
  private satisfier
  /**
   * creates a Satisfier instance
   * @param expected All properties can be a value which will be compared to the same property in `actual`, RegExp, or a predicate function that will be used to check against the property.
   */
  constructor(expected: Expecter<T>) {
    this.satisfier = createSatisfier(expected)
  }

  test(actual): boolean {
    return this.satisfier.test(actual)
  }
  /**
   * Check if `actual` satisfies the expected criteria.
   */
  exec(actual: T): SatisfierExec[] | null {
    return this.satisfier.exec(actual)
  }
}
