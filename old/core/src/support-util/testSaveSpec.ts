import { spec } from '../spec';
import { TestHandler } from './interfaces';

export function testSaveSpec(specId: string, handler: TestHandler): void {
  handler(`${specId}: save`, s => spec.save(specId, s))
}
