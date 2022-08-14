import { SpecIDCannotBeEmpty } from '@mocktomata/framework'
import a from 'assertron'
import { kd } from '../index.js'

function noop() { }

test('spec id cannot be empty (auto)', async () => {
  const spec = kd('')
  await a.throws(() => spec(noop), SpecIDCannotBeEmpty)
})

test('spec id cannot be empty (save)', async () => {
  const spec = kd.save('')
  await a.throws(() => spec(noop), SpecIDCannotBeEmpty)
})

test('spec id cannot be empty (simulate)', async () => {
  const spec = kd.simulate('')
  await a.throws(() => spec(noop), SpecIDCannotBeEmpty)
})
