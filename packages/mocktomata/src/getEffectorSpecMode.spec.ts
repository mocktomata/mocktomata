import { SpecMode } from '@mocktomata/framework'
import { getEffectiveSpecMode } from './getEffectiveSpecMode'

test.each<SpecMode>([
  'live', 'save', 'simulate'
])('%s mode always returns itself', mode => {
  expect(getEffectiveSpecMode({}, mode, '', '')).toBe(mode)
  expect(getEffectiveSpecMode({ overrideMode: 'auto' }, mode, '', '')).toBe(mode)
})

test('override all specs', () => {
  expect(getEffectiveSpecMode({ overrideMode: 'save' }, 'auto', '', '')).toBe('save')
})

test('spec name matching filter is overridden', () => {
  expect(getEffectiveSpecMode({ overrideMode: 'save', specNameFilter: /abc/ }, 'auto', 'hello abc world', '')).toBe('save')
})

test('spec name not matching filter is not overridden', () => {
  expect(getEffectiveSpecMode({ overrideMode: 'save', specNameFilter: /abc/ }, 'auto', 'hello world', '')).toBe('auto')
})

test('spec path matching filter is overridden', () => {
  expect(getEffectiveSpecMode({ overrideMode: 'save', filePathFilter: /some/ }, 'auto', '', 'src/some.spec.ts')).toBe('save')
})

test('spec path not matching filter is not overridden', () => {
  expect(getEffectiveSpecMode({ overrideMode: 'save', filePathFilter: /some/ }, 'auto', '', 'src/other.spec.ts')).toBe('auto')
})

test('spec not matching both filters is not overriden', () => {
  expect(getEffectiveSpecMode({
    overrideMode: 'save',
    specNameFilter: /abc/,
    filePathFilter: /some/
  }, 'auto', 'abc', '')).toBe('auto')

  expect(getEffectiveSpecMode({
    overrideMode: 'save',
    specNameFilter: /abc/,
    filePathFilter: /some/
  }, 'auto', '', 'src/some.spec.ts')).toBe('auto')
})
