import { TestHandler } from './interfaces';
import { testLiveSpec } from './testLiveSpec';
import { testSaveSpec } from './testSaveSpec';
import { testSimulateSpec } from './testSimulateSpec';

export function testTrioSpec(spedId: string, handler: TestHandler): void {
  testLiveSpec(spedId, handler)
  testSaveSpec(spedId, handler)
  testSimulateSpec(spedId, handler)
}
