import { spec } from '../spec';
import { TestHandler } from './interfaces';

export function testLive(specName: string, handler: TestHandler): void
export function testLive(description: string, specName: string, handler: TestHandler): void
export function testLive(description: string, specNameOrHandler: string | TestHandler, inputHandler?: TestHandler): void {
  if (typeof specNameOrHandler === 'string') {
    inputHandler!(`${description} (with ${specNameOrHandler}): live`, s => spec(specNameOrHandler, s))
  }
  else {
    specNameOrHandler(`${description}: live`, s => spec(description, s))
  }
}
