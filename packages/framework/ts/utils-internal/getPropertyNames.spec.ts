import { getPropertyNames, getInheritedPropertyNames } from './getPropertyNames';

describe('getPropertyNames()', () => {
  test('empty object', () => {
    const subject = {}
    const actual = getPropertyNames(subject)
    expect(actual).toEqual([])
  })

  test('object literal keys', () => {
    const subject = { a: 1, b: 2 }
    const actual = getPropertyNames(subject)
    expect(actual).toEqual(['a', 'b'])
  })

  test('class instance keys', () => {
    class Foo {
      a = 1
      do() { return 'do' }
    }
    const subject = new Foo()
    const actual = getPropertyNames(subject)

    expect(actual).toEqual(['a', 'do'])
  })
  test('two level inheritance', () => {
    class Foo {
      a = () => { }
      foo() { return 'foo' }
    }
    class Boo extends Foo {
      b = () => { }
      boo() { return this.a() }
    }
    const subject = new Boo()
    const actual = getPropertyNames(subject)

    expect(actual).toEqual(['a', 'b', 'boo', 'foo'])
  })
});

describe('getInheritedPropertyNames()', () => {
  // properties are initialized within constructor.
  // Unless I create a new instance, I can't get the instance properties,
  // Which I cannot because the class may require certain constructor parameters that only the application knows.
  test('inherit once', () => {
    class Foo {
      a = () => { }
      do() { return 'do' }
    }
    const Child = class extends Foo { }
    const actual = getInheritedPropertyNames(Child)
    expect(actual).toEqual(['do'])
  })
  test('inherit twice', () => {
    class Foo {
      a = () => { }
      foo() { return 'foo' }
    }
    class Boo extends Foo {
      b = () => { }
      boo() { return this.a() }
    }
    const Child = class extends Boo { }
    const actual = getInheritedPropertyNames(Child)
    expect(actual).toEqual(['boo', 'foo'])
  })
})
