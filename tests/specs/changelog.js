'use strict' // force block-scoping w/ Node < 6

const spec = require('tape')
const createBitbucketEnterpriseCommitLink = require('../../lib/changelog').createBitbucketEnterpriseCommitLink

spec('createBitbucketEnterpriseCommitLink', specOptions => {
  const test = specOptions.test
  const endSpec = specOptions.end

  test('Has a task function (well it inherits from Undertaker)', testOptions => {
    const equal = testOptions.equal
    const endTest = testOptions.end

    equal(typeof createBitbucketEnterpriseCommitLink, 'function')
    equal(createBitbucketEnterpriseCommitLink()('acognaoiuc'), '[acognaoi](https://github.com/netflix/unleash/commits/acognaoi)')
    endTest()
  })

  endSpec()
})
