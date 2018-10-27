import a from 'assertron';
import isNode from 'is-node';
import { NotConfigured } from './errors';
import { createRemoteIO } from './remoteIO';
import { resetStore } from './store';

if (isNode) {
  it.skip('No test for remoteIO under Node', () => { return })
}
else {
  it('configuring remoteOptions.baseUrl is required', async () => {
    const err = a.throws(() => createRemoteIO(), NotConfigured)
    a.satisfy(err, {
      configPath: 'remoteOptions.baseUrl'
    })
  })
}

afterEach(() => resetStore())
