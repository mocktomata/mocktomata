import { KomondorPlugin } from '../../plugin';
import { isClass } from './isClass';
import { spyClass } from './spyClass';
import { stubClass } from './stubClass';

export const classPlugin: KomondorPlugin = {
  name: 'class',
  support: isClass,
  createSpy: spyClass,
  createStub: stubClass,
  createReplayer(context, value) {
    return {}
  }
}
