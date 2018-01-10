import GitHub = require('github')
export function createGitHubTest() {
  const github = new GitHub()
  github.authenticate({ username: 'unional', password: 'Neag7GitHub', type: 'basic' })
  return github
}
