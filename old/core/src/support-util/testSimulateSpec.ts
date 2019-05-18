import { spec } from '../spec';
import { TestHandler } from './interfaces';

export function testSimulateSpec(specId: string, handler: TestHandler): void {
  handler(`${specId}: simulate`, s => spec.simulate(specId, s))
}
