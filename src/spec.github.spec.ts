import GitHub from 'github'
import { every } from 'satisfier'

import { spec } from './index'
import { createGitHubTest } from './testUtil'

function getFollowers(github: GitHub, username: string) {
  return new Promise<any>((a, r) => {
    github.users.getFollowersForUser({
      username
    }, (err, res) => {
      if (err) r(err)
      a(res)
    })
  })
}

test.skip('get followers (demo)', async () => {
  const github = await createGitHubTest()
  const specs = await spec('github/getFollowersForUser/success', github.users.getFollowersForUser)
  github.users.getFollowersForUser = specs.subject

  await getFollowers(github, 'unional')

  await specs.satisfy([
    { type: 'fn/invoke', payload: [{ username: 'unional' }] },
    { type: 'fn/return' },
    {
      type: 'fn/callback',
      payload: [null, {
        data: every(e => e.login && e.id)
      }]
    }
  ])
})
