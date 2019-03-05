'use strict'

const spec = require('tape')
const { createBitbucketEnterpriseCommitLink } = require('../../lib/changelog')

spec('createBitbucketEnterpriseCommitLink', ({ test, end }) => {

  test('Creates BB links in the changelog', ({ equal, end: endTest }) => {

    equal(typeof createBitbucketEnterpriseCommitLink, 'function')
    equal(
        createBitbucketEnterpriseCommitLink()('acognaoiuc'),
        '[acognaoi](https://github.com/netflix/unleash/commits/acognaoi)'
    )
    endTest()
  })

  end()
})
