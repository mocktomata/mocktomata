import isNode from 'is-node';

if (isNode) {
  it.skip('No test for remoteIO under Node', () => { return })
}
else {
  it.skip('todo', () => { return })
}
