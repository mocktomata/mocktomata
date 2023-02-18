import t from 'assert'
import { a } from 'assertron'
import cp from 'child_process'
import { classPlugin } from './class_plugin.js'

test('false for simple function', () => {
	a.false(classPlugin.support((x: any) => x))
	a.false(
		classPlugin.support(function () {
			return
		})
	)
})

test('false for object', () => {
	const obj = {
		f() {
			return
		}
	}

	a.false(classPlugin.support(obj))
})

test('false for method in object', () => {
	const obj = {
		f() {
			return
		}
	}
	a.false(classPlugin.support(obj.f))
})

test('true for class with at lease one method', () => {
	class F {
		f() {
			return
		}
	}
	t(classPlugin.support(F))
})

test('child class is true', () => {
	class Parent {
		do() {
			return 'do'
		}
	}
	class Child extends Parent {}
	t(classPlugin.support(Child))
})

test('spawn is not a class', () => {
	a.false(classPlugin.support(cp.spawn))
})
