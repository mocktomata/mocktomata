import GitHub = require('github')

// istanbul ignore next
export async function createGitHubTest() {
  const github = new GitHub()
  return github
}
