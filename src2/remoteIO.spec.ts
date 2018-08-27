import a from 'assertron'
import isNode from 'is-node';
import { createRemoteIO } from './remoteIO';
import { NotConfigured } from './errors';

if (isNode) {
  it.skip('No test for remoteIO under Node', () => { return })
}
else {
  it('configuring remoteOptions.baseUrl is required', async () => {
    const err = await a.throws(() => createRemoteIO(), NotConfigured)
    a.satisfy(err, {
      configPath: 'remoteOptions.baseUrl'
    })
  })
}
