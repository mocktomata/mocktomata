import { spec } from '../spec';
import { TestHandler } from './interfaces';

export function testSave(specName: string, handler: TestHandler): void
export function testSave(description: string, specName: string, handler: TestHandler): void
export function testSave(description: string, specNameOrHandler: string | TestHandler, inputHandler?: TestHandler): void {
  if (typeof specNameOrHandler === 'string') {
    inputHandler!(`${description} (with ${specNameOrHandler}): save`, s => spec.save(specNameOrHandler, s))
  }
  else {
    specNameOrHandler(`${description}: save`, s => spec.save(description, s))
  }
}
