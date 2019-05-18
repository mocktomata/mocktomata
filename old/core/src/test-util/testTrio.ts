import { TestHandler } from './interfaces';
import { testLive } from './testLive';
import { testSave } from './testSave';
import { testSimulate } from './testSimulate';

export function testTrio(specName: string, handler: TestHandler): void
export function testTrio(description: string, specName: string, handler: TestHandler): void
export function testTrio(description: string, specNameOrHandler: string | TestHandler, inputHandler?: TestHandler): void {
  testLive(description, specNameOrHandler as any, inputHandler as any)
  testSave(description, specNameOrHandler as any, inputHandler as any)
  testSimulate(description, specNameOrHandler as any, inputHandler as any)
}
