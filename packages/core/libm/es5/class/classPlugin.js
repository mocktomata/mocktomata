import { isClass } from './isClass';
import { spyClass } from './spyClass';
import { stubClass } from './stubClass';
export const classPlugin = {
    name: 'class',
    support: isClass,
    getSpy: spyClass,
    getStub: stubClass
};
//# sourceMappingURL=classPlugin.js.map