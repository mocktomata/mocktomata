import { spec } from '../spec';
import { TestHandler } from './interfaces';

export function testSimulate(specName: string, handler: TestHandler): void
export function testSimulate(description: string, specName: string, handler: TestHandler): void
export function testSimulate(description: string, specNameOrHandler: string | TestHandler, inputHandler?: TestHandler): void {
  if (typeof specNameOrHandler === 'string') {
    inputHandler!(`${description} (with ${specNameOrHandler}): simulate`, s => spec.simulate(specNameOrHandler, s))
  }
  else {
    specNameOrHandler(`${description}: simulate`, s => spec.simulate(description, s))
  }
}
