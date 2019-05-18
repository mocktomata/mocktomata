import { spec } from '../spec';
import { TestHandler } from './interfaces';

export function testLiveSpec(specId: string, handler: TestHandler): void {
  handler(`${specId}: live`, s => spec(specId, s))
}
