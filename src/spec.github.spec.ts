import { test } from 'ava'
import GitHub = require('github')
import { every } from 'satisfier'

import { spec } from './index'
import { createGitHubTest } from './testUtil'

function getFollowers(github: GitHub, username: string) {
  return new Promise<any>((a, r) => {
    github.users.getFollowersForUser({
      username
    }, (err, res) => {
      console.log('called')
      if (err) r(err)
      a(res)
    })
  })
}

test.skip('get followers (demo)', async t => {
  const github = await createGitHubTest()
  const specs = await spec('github/getFollowersForUser/success', github.users.getFollowersForUser)

  github.users.getFollowersForUser = specs.subject
  specs.onAny(a => console.log(a))
  console.log('before')
  await getFollowers(github, 'unional')

  console.log(specs.actions)
  await specs.satisfy([
    undefined,
    { type: 'fn/return' },
    {
      type: 'fn/callback',
      payload: [null, {
        data: every(e => e.login && e.id)
      }]
    }
  ])
  t.pass()
})
