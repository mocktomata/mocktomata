import a from 'assertron'

import { MissingGivenHandler } from '.';
import { given } from './given2';

test('no handler registered throws MissingGivenHandler', async () => {
  await a.throws(given('no handler'), MissingGivenHandler)
})
