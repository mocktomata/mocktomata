import { test } from 'ava'
import GitHub = require('github')

import { spec } from './spec'
import { createGitHubTest } from './testUtil'

function getFollowers(github: GitHub, username: string) {
  return new Promise((a, r) => {
    github.users.getFollowersForUser({
      username
    }, (err, res) => {
      if (err) r(err)
      a(res)
    })
  })
}

test('getting response', async t => {
  const github = createGitHubTest()
  // suite
  const specs = spec(github.users.getFollowersForUser, { mode: 'save', id: 'abc' })
  github.users.getFollowersForUser = specs.fn
  await getFollowers(github, 'unional')
  await specs.satisfy({
    asyncOutput: [null, {
      data: e => {
        return e.login && e.id
      }
    }]
  })
  t.pass()
})
