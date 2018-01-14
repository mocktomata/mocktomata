import GitHub = require('github')

// istanbul ignore next
export function createGitHubTest() {
  const github = new GitHub()
  github.authenticate({ username: 'unional', password: 'Neag7GitHub', type: 'basic' })
  return github
}
