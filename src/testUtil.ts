import GitHub = require('@octokit/rest')

// istanbul ignore next
export async function createGitHubTest() {
  const github = new GitHub()
  return github
}
