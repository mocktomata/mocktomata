import { Registrar } from 'komondor-plugin';
import { isInstance } from './isInstance';
import { spyInstance } from './spyInstance';
import { stubInstance } from './stubInstance';

export function activate(r: Registrar) {
  r.register(
    'instance',
    isInstance,
    spyInstance,
    stubInstance
  )
}
