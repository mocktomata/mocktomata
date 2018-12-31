import { addAppender, removeAppender } from '@unional/logging';
import t from 'assert';
import a from 'assertron';
import { MemoryAppender } from 'aurelia-logging-memory';
import delay from 'delay';
import { IDCannotBeEmpty, spec } from '.';

test('id cannot be an empty string', async () => {
  await a.throws(() => spec('', { a: 1 }), IDCannotBeEmpty)
  await a.throws(() => spec.live('', { a: 1 }), IDCannotBeEmpty)
  await a.throws(() => spec.save('', { a: 1 }), IDCannotBeEmpty)
  await a.throws(() => spec.simulate('', { a: 1 }), IDCannotBeEmpty)
})

test(`when test takes longer than 'timeout' to call done(), a warning message will be displayed.`, async () => {

  const appender = new MemoryAppender()
  try {
    addAppender(appender)
    await spec.save('timeout', () => true, { timeout: 10 })
    await delay(30)

    a.satisfies(appender.logs, [{ id: 'komondor', level: 20, messages: ['no action for 10 ms. Did you forget to call done()?'] }])
  }
  finally {
    removeAppender(appender)
  }
})

test.skip('when there are actions being recorded, the timeout window will slide', async () => {
  const appender = new MemoryAppender()
  try {
    addAppender(appender)
    const s = await spec.save('timeout', () => true, { timeout: 30 })
    await delay(20)
    s.subject()
    await delay(20)
    t.strictEqual(appender.logs.length, 0)
  }
  finally {
    removeAppender(appender)
  }
})
