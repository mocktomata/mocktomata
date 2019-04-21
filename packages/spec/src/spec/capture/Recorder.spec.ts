import { Recorder } from './Recorder';

test('construct with no argument', () => {
  const recorder = new Recorder('dummy plugin')
  recorder.newSpy()

  expect(recorder.actions).toEqual([
    {
      name: 'construct',
      plugin: 'dummy plugin',
      instanceId: 1,
      meta: undefined,
      payload: undefined
    }
  ])
})
