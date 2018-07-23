import t from 'assert';
import a from 'assertron';
import cp from 'child_process';
import { isClass } from './isClass';
test('false for simple function', () => {
    a.false(isClass((x) => x));
    a.false(isClass(function () { return; }));
});
test('false for object', () => {
    const obj = {
        f() { return; }
    };
    a.false(isClass(obj));
});
test('false for method in object', () => {
    const obj = {
        f() { return; }
    };
    a.false(isClass(obj.f));
});
test('true for class with at lease one method', () => {
    class F {
        f() { return; }
    }
    t(isClass(F));
});
test('child class is true', () => {
    class Parent {
        do() { return 'do'; }
    }
    class Child extends Parent {
    }
    t(isClass(Child));
});
test('spawn is not a class', () => {
    a.false(isClass(cp.spawn));
});
//# sourceMappingURL=isClass.spec.js.map