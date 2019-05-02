import { KomondorPlugin } from '../../types';
import { isClass } from './isClass';
import { spyClass } from './spyClass';
import { stubClass } from './stubClass';

export const classPlugin: KomondorPlugin = {
  name: 'class',
  support: isClass,
  getSpy: spyClass,
  getStub: stubClass
}
